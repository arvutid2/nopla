import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type RoundState = "idle" | "committing" | "committed" | "complete";
type Move = "rock" | "paper" | "scissors";

function getOrSetClientId() {
  const key = "mm_client_id";
  let v = sessionStorage.getItem(key);
  if (!v) { v = crypto.randomUUID(); sessionStorage.setItem(key, v); }
  return v;
}
function rpsWinner(a: Move, b: Move): 0 | 1 | 2 {
  if (a === b) return 0;
  if ((a === "rock" && b === "scissors") || (a === "paper" && b === "rock") || (a === "scissors" && b === "paper")) return 1;
  return 2;
}
async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function PlayMatch() {
  const { matchId } = useParams();
  const nav = useNavigate();
  const me = useMemo(() => getOrSetClientId(), []);
  const chRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [round, setRound] = useState(1);
  const bestOf = 3;
  const [state, setState] = useState<RoundState>("idle");
  const [myCommit, setMyCommit] = useState<string | null>(null);
  const [opCommit, setOpCommit] = useState<string | null>(null);
  const [myMove, setMyMove] = useState<Move | null>(null);
  const [opMove, setOpMove] = useState<Move | null>(null);
  const [myNonce, setMyNonce] = useState<string | null>(null);
  const [scores, setScores] = useState({ me: 0, op: 0 });
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>("Connecting…");
  const gameOver = scores.me === 2 || scores.op === 2 || round > bestOf;
  const computedRef = useRef(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!matchId) return;
    const ch = supabase.channel(`mm_match_${matchId}`, {
      config: { presence: { key: me }, broadcasts: { ack: true } }
    });
    chRef.current = ch;

    ch.on("presence", { event: "sync" }, () => {
      const list = ch.getPresence();
      const keys = Object.keys(list || {});
      const others = keys.filter(k => k !== me);
      setOpponentId(others[0] ?? null);
      setStatusText(others.length ? "Opponent connected — ready to play" : "Waiting opponent…");
    });

    ch.on("broadcast", { event: "commit" }, (payload) => {
      const { from, round: r, commit } = payload.payload || {};
      if (from && from !== me && Number(r) === round) setOpCommit(commit);
    });

    ch.on("broadcast", { event: "reveal" }, (payload) => {
      const { from, round: r, move, nonce } = payload.payload || {};
      if (from && from !== me && Number(r) === round) {
        setOpMove(move);
        tryCompute(move as Move, nonce as string, true);
      }
    });

    ch.on("broadcast", { event: "next" }, () => {
      if (state === "complete" && !gameOver) goNextRound();
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await ch.track({ t: Date.now() });
    });

    return () => { ch.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, me, round, state, gameOver]);

  function resetRoundLocal() {
    setState("idle");
    setMyCommit(null); setOpCommit(null);
    setMyMove(null);  setOpMove(null);
    setMyNonce(null);
    computedRef.current = false;
  }
  function goNextRound() { resetRoundLocal(); setRound(r => r + 1); }

  async function chooseMove(m: Move) {
    if (!opponentId || state !== "idle") return;
    setState("committing");
    const nonce = crypto.randomUUID();
    const commit = await sha256Hex(`${m}|${nonce}`);
    setMyNonce(nonce); setMyMove(m); setMyCommit(commit);
    chRef.current?.send({ type: "broadcast", event: "commit", payload: { from: me, round, commit } });
    setState("committed"); setStatusText("Committed. Waiting opponent…");
  }

  function tryCompute(moveOrOpp: Move, nonceOrOpp: string, isOpp: boolean) {
    if (computedRef.current) return;
    const mine = myMove;
    const opp  = opMove || (isOpp ? moveOrOpp : null);
    if (!mine || !opp) return;
    if (myCommit && myNonce && myMove) {
      sha256Hex(`${myMove}|${myNonce}`).then(h => { if (h !== myCommit) console.warn("Commit mismatch (me)"); });
    }
    if (opCommit && opMove) {
      sha256Hex(`${opMove}|${nonceOrOpp}`).then(h => { if (h !== opCommit) console.warn("Commit mismatch (opp)"); });
    }
    const w = rpsWinner(mine, opp);
    if (w === 1) setScores(s => ({ ...s, me: s.me + 1 }));
    if (w === 2) setScores(s => ({ ...s, op: s.op + 1 }));
    setState("complete");
    setStatusText(w === 0 ? "Draw" : w === 1 ? "You win the round" : "Opponent wins the round");
    computedRef.current = true;
  }

  function requestNextRound() {
    if (gameOver) return;
    chRef.current?.send({ type: "broadcast", event: "next", payload: { from: me, round } });
    goNextRound();
  }

  async function reveal() {
    if (state !== "committed" || !myMove || !myNonce || !opCommit) return;
    chRef.current?.send({ type: "broadcast", event: "reveal", payload: { from: me, round, move: myMove, nonce: myNonce } });
    tryCompute(myMove, myNonce, false);
  }

  useEffect(() => {
    async function saveResult() {
      if (!matchId || savedRef.current || !gameOver) return;
      const winner = scores.me > scores.op ? me : opponentId;
      const loser  = scores.me > scores.op ? opponentId : me;
      await supabase.from("results").upsert({
        match_id: matchId,
        winner_client_id: winner ?? null,
        loser_client_id:  loser ?? null,
        score_winner: Math.max(scores.me, scores.op),
        score_loser:  Math.min(scores.me, scores.op),
      });
      await supabase.from("matches").update({ status: "finished" }).eq("id", matchId);
      savedRef.current = true;
    }
    void saveResult();
  }, [gameOver, matchId, me, opponentId, scores.me, scores.op]);

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4 text-white">
      <h1 className="text-xl font-bold">Match #{matchId}</h1>
      <div className="text-sm opacity-80">{statusText}</div>

      <div className="flex items-center gap-4">
        <div className="rounded-xl border border-white/10 p-3">
          <div className="text-xs opacity-70">You</div>
          <div className="font-mono text-xs break-all">{me}</div>
          <div className="mt-2">Score: <b>{scores.me}</b></div>
        </div>
        <div className="rounded-xl border border-white/10 p-3">
          <div className="text-xs opacity-70">Opponent</div>
          <div className="font-mono text-xs break-all">{opponentId ?? "—"}</div>
          <div className="mt-2">Score: <b>{scores.op}</b></div>
        </div>
        <div className="rounded-xl border border-white/10 p-3">
          <div className="text-xs opacity-70">Round</div>
          <div className="font-medium">{round} / {bestOf}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm opacity-80">State: {state} {(!opponentId) && " • waiting opponent…"} </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl border border-white/20 disabled:opacity-50"
            disabled={state !== "idle" || !opponentId} onClick={() => chooseMove("rock")}>Rock</button>
          <button className="px-4 py-2 rounded-xl border border-white/20 disabled:opacity-50"
            disabled={state !== "idle" || !opponentId} onClick={() => chooseMove("paper")}>Paper</button>
          <button className="px-4 py-2 rounded-xl border border-white/20 disabled:opacity-50"
            disabled={state !== "idle" || !opponentId} onClick={() => chooseMove("scissors")}>Scissors</button>
        </div>

        {state === "committed" && (
          <button className="px-4 py-2 rounded-xl border border-white/20" onClick={reveal}>
            Reveal
          </button>
        )}

        {state === "complete" && (
          <button className="px-4 py-2 rounded-xl border border-white/20" onClick={requestNextRound}>
            Next round
          </button>
        )}
      </div>
    </main>
  );
}