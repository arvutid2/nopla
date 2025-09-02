import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase, userId } from "../../lib/supabaseClient";

type Move = "rock" | "paper" | "scissors";
type Outcome = "win" | "lose" | "tie";
type MatchResult = "you_win" | "you_lose";

const EMOJI: Record<Move, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };

function decideOutcome(p: Move, a: Move): Outcome {
  if (p === a) return "tie";
  const win =
    (p === "rock" && a === "scissors") ||
    (p === "paper" && a === "rock") ||
    (p === "scissors" && a === "paper");
  return win ? "win" : "lose";
}

export default function GameOverlay({
  open,
  onClose,
  buyIn,
  onReportResult,
  mode = "ai",
  matchId,
  role
}: {
  open: boolean;
  onClose: () => void;
  buyIn: number;
  onReportResult?: (payload: {
    matchResult: MatchResult;
    prizeAwarded: number;
    rounds: { player: Move; opp: Move; outcome: Outcome }[];
  }) => Promise<void> | void;
  mode?: "ai" | "pvp";
  matchId?: string;
  role?: "host" | "guest";
}) {
  const prize = useMemo(() => Math.round(buyIn * 1.9 * 100) / 100, [buyIn]);

  // BO3 state
  const [you, setYou] = useState(0);
  const [opp, setOpp] = useState(0);
  const [history, setHistory] = useState<{ player: Move; opp: Move; outcome: Outcome }[]>([]);
  const [matchOver, setMatchOver] = useState<MatchResult | null>(null);

  // UI state
  const [waiting, setWaiting] = useState(false);
  const [myMove, setMyMove] = useState<Move | null>(null);
  const [oppMove, setOppMove] = useState<Move | null>(null);

  // PVP internals
  const matchChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const roundBufferRef = useRef<{ me?: Move; opp?: Move }>({});

  // TOTAALNE RESET: iga kord kui modal avaneb VÕI matchId muutub
  useEffect(() => {
    if (!open) return;
    setYou(0);
    setOpp(0);
    setHistory([]);
    setMatchOver(null);
    setWaiting(false);
    setMyMove(null);
    setOppMove(null);
    roundBufferRef.current = {};
  }, [open, matchId]);

  // ==== AI MODE ====
  const playAI = (m: Move) => {
    if (matchOver || waiting) return;
    setWaiting(true);
    setMyMove(m);
    const opts: Move[] = ["rock", "paper", "scissors"];
    const ai = opts[Math.floor(Math.random() * 3)];
    setTimeout(() => {
      setOppMove(ai);
      const r = decideOutcome(m, ai);
      setHistory((h) => [...h, { player: m, opp: ai, outcome: r }]);
      if (r === "win") setYou((v) => v + 1);
      if (r === "lose") setOpp((v) => v + 1);
      setTimeout(() => {
        setWaiting(false);
        setMyMove(null);
        setOppMove(null);
      }, 350);
    }, 300);
  };

  // ==== PVP MODE ====
  // lahendus: kui mõlemad käigud olemas -> arvuta ja reseti raundi UI
  const resolveIfBoth = (me?: Move, other?: Move) => {
    if (!me || !other) return;
    const r = decideOutcome(me, other);
    setHistory((h) => [...h, { player: me, opp: other, outcome: r }]);
    if (r === "win") setYou((v) => v + 1);
    if (r === "lose") setOpp((v) => v + 1);
    setTimeout(() => {
      setWaiting(false);
      setMyMove(null);
      setOppMove(null);
      roundBufferRef.current = {};
    }, 250);
  };

  useEffect(() => {
    if (!open || mode !== "pvp" || !matchId) return;

    const ch = supabase.channel(`match-${matchId}`, { config: { presence: { key: userId } } });
    matchChannelRef.current = ch;

    const sendMove = (mv: Move) => {
      ch.send({ type: "broadcast", event: "move", payload: { from: userId, mv } });
    };

    ch
      .on("broadcast", { event: "move" }, (m) => {
        const { from, mv } = m.payload as any;
        if (from === userId) return; // ignore my echo
        setOppMove(mv);
        roundBufferRef.current.opp = mv;
        resolveIfBoth(roundBufferRef.current.me, roundBufferRef.current.opp);
      })
      .subscribe(async (s) => {
        if (s === "SUBSCRIBED") {
          await ch.track({ uid: userId });
        }
      });

    (window as any).__sendPvpMove = (mv: Move) => sendMove(mv);

    return () => {
      supabase.removeChannel(ch);
      matchChannelRef.current = null;
      (window as any).__sendPvpMove = undefined;
    };
  }, [open, mode, matchId]);

  const playPVP = (m: Move) => {
    if (matchOver || waiting) return;
    setWaiting(true);
    setMyMove(m);
    roundBufferRef.current.me = m;
    (window as any).__sendPvpMove?.(m);
    resolveIfBoth(roundBufferRef.current.me, roundBufferRef.current.opp);
  };

  // Lõpetamise kontroll (best of 3)
  useEffect(() => {
    if (!open) return;
    if (you >= 2) setMatchOver("you_win");
    else if (opp >= 2) setMatchOver("you_lose");
  }, [you, opp, open]);

  const finishAndReport = async () => {
    const payload = {
      matchResult: matchOver!,
      prizeAwarded: matchOver === "you_win" ? prize : 0,
      rounds: history
    };
    try {
      await onReportResult?.(payload);
    } finally {
      onClose();
    }
  };

  if (!open) return null;

  const disabled = waiting || !!matchOver;
  const Btn = ({ m, label }: { m: Move; label: string }) => (
    <button
      disabled={disabled}
      onClick={() => (mode === "ai" ? playAI(m) : playPVP(m))}
      className="px-4 py-2 rounded-lg border border-white/15 hover:bg-white/10 disabled:opacity-50"
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70">
      <div className="relative w-[92%] max-w-2xl rounded-2xl border border-white/10 bg-[#11162a]/95 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Rock · Paper · Scissors — Best of 3 {mode === "pvp" ? "· PVP" : "· vs AI"}
          </h2>
          <button onClick={onClose} className="px-3 py-1 rounded-md border border-white/15 hover:bg-white/10 text-sm">
            Exit
          </button>
        </div>

        <div className="text-white/70 text-sm mb-4">
          First to <b>2</b> wins. Victory rewards: <span className="text-cyan-300 font-semibold">{prize}</span>
          {mode === "pvp" && matchId ? (
            <span className="ml-2 text-white/50">Match: {matchId.slice(0, 8)} · {role}</span>
          ) : null}
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2">
            <div className="text-xs text-white/60">Score</div>
            <div className="text-lg font-bold">{you} : {opp}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.length === 0 ? (
              <div className="text-xs text-white/50">No rounds yet</div>
            ) : (
              history.map((h, idx) => (
                <div key={idx} className="px-2 py-1 rounded-md text-xs border bg-white/5 border-white/10">
                  {EMOJI[h.player]} <span className="opacity-60">/</span> {EMOJI[h.opp]}{" "}
                  <span className="ml-1">{h.outcome === "win" ? "W" : h.outcome === "lose" ? "L" : "T"}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <div className="text-white/70 text-sm mb-1">You</div>
            <div className="text-5xl">{myMove ? EMOJI[myMove] : "❔"}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
            <div className="text-xs text-white/60">{waiting ? "Waiting for opponent…" : "Pick your move"}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <div className="text-white/70 text-sm mb-1">Opponent</div>
            <div className="text-5xl">{oppMove ? EMOJI[oppMove] : "❔"}</div>
          </div>
        </div>

        {!matchOver ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Btn m="rock" label="🪨 Rock" />
            <Btn m="paper" label="📄 Paper" />
            <Btn m="scissors" label="✂️ Scissors" />
          </div>
        ) : (
          <div className="mt-6 text-center">
            {matchOver === "you_win" ? (
              <>
                <div className="text-emerald-300 font-bold text-xl mb-2">You won the match!</div>
                <div className="text-sm text-white/80 mb-4">Prize awarded: <span className="text-cyan-300 font-semibold">{prize}</span></div>
              </>
            ) : (
              <>
                <div className="text-rose-300 font-bold text-xl mb-2">You lost the match</div>
                <div className="text-sm text-white/80 mb-4">Prize awarded: <span className="text-white/70">0</span></div>
              </>
            )}
            <button onClick={finishAndReport} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">
              Close & report result
            </button>
          </div>
        )}
      </div>
    </div>
  );
}