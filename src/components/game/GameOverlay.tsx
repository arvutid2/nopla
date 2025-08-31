import React, { useEffect, useMemo, useState } from "react";

type Move = "rock" | "paper" | "scissors";
type Outcome = "win" | "lose" | "tie";
type MatchResult = "you_win" | "you_lose";

const EMOJI: Record<Move, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };

function ResultBanner({ result }: { result: Outcome | null }) {
  if (!result) return null;
  const map = {
    win: { text: "You win the round!", cls: "text-emerald-300" },
    lose: { text: "You lose the round!", cls: "text-rose-300" },
    tie: { text: "Tie round!", cls: "text-white/80" },
  } as const;
  return <div className={`text-lg font-bold ${map[result].cls} mb-1`}>{map[result].text}</div>;
}

function HistoryPill({ p, a, r }: { p: Move | null; a: Move | null; r: Outcome | null }) {
  const text =
    r === "win" ? "W" : r === "lose" ? "L" : r === "tie" ? "T" : "?";
  const cls =
    r === "win" ? "bg-emerald-500/20 border-emerald-400/30"
    : r === "lose" ? "bg-rose-500/20 border-rose-400/30"
    : r === "tie" ? "bg-white/10 border-white/20"
    : "bg-white/5 border-white/10";
  return (
    <div className={`px-2 py-1 rounded-md text-xs border ${cls}`}>
      {p ? EMOJI[p] : "❔"} <span className="opacity-60">/</span> {a ? EMOJI[a] : "❔"} <span className="ml-1">{text}</span>
    </div>
  );
}

export default function GameOverlay({
  open,
  onClose,
  buyIn,
  onReportResult, // <-- serveri hook
}: {
  open: boolean;
  onClose: () => void;
  buyIn: number;
  onReportResult?: (payload: {
    matchResult: MatchResult;
    prizeAwarded: number;   // kui võit: 1.9×buyIn, kaotus: 0
    rounds: { player: Move; ai: Move; outcome: Outcome }[];
  }) => Promise<void> | void;
}) {
  /* --- tuletatud väärtused --- */
  const prize = useMemo(() => Math.round(buyIn * 1.9 * 100) / 100, [buyIn]);

  /* --- BO3 state --- */
  const [playerChoice, setPlayerChoice] = useState<Move | null>(null);
  const [aiChoice, setAiChoice] = useState<Move | null>(null);
  const [roundOutcome, setRoundOutcome] = useState<Outcome | null>(null);
  const [you, setYou] = useState(0);
  const [opp, setOpp] = useState(0);
  const [history, setHistory] = useState<{ player: Move | null; ai: Move | null; outcome: Outcome | null }[]>([]);
  const [isPicking, setIsPicking] = useState(false); // nupud lukku, kuni AI valik “avalik”
  const [matchOver, setMatchOver] = useState<MatchResult | null>(null);

  /* --- reset iga kord kui modal avatakse --- */
  useEffect(() => {
    if (open) {
      setPlayerChoice(null);
      setAiChoice(null);
      setRoundOutcome(null);
      setYou(0);
      setOpp(0);
      setHistory([]);
      setIsPicking(false);
      setMatchOver(null);
    }
  }, [open]);

  /* --- utilid --- */
  const decideOutcome = (p: Move, a: Move): Outcome => {
    if (p === a) return "tie";
    const win =
      (p === "rock" && a === "scissors") ||
      (p === "paper" && a === "rock") ||
      (p === "scissors" && a === "paper");
    return win ? "win" : "lose";
  };

  const play = (m: Move) => {
    if (matchOver || isPicking) return;
    setIsPicking(true);
    setPlayerChoice(m);

    const options: Move[] = ["rock", "paper", "scissors"];
    const aiPick = options[Math.floor(Math.random() * 3)];

    // väike “dramaturgia” enne avalikustamist
    setTimeout(() => {
      setAiChoice(aiPick);
      const r = decideOutcome(m, aiPick);
      setRoundOutcome(r);

      setHistory((h) => [...h, { player: m, ai: aiPick, outcome: r }]);

      if (r === "win") setYou((v) => v + 1);
      if (r === "lose") setOpp((v) => v + 1);

      setTimeout(() => {
        // kontrolli, kas keegi jõudis 2-ni
        setIsPicking(false);
        setPlayerChoice(null);
        setAiChoice(null);
        setRoundOutcome(null);
      }, 500);
    }, 400);
  };

  /* --- jälgi skoori, lõpeta kui 2 võitu käes --- */
  useEffect(() => {
    if (!open) return;
    if (you >= 2) setMatchOver("you_win");
    else if (opp >= 2) setMatchOver("you_lose");
  }, [you, opp, open]);

  /* --- lõpp-ekraani nupp --- */
  const finishAndReport = async () => {
    const payload = {
      matchResult: matchOver!, // kindel, et mitte null (nupp on nähtav ainult kui over)
      prizeAwarded: matchOver === "you_win" ? prize : 0,
      rounds: history
        .filter((r): r is { player: Move; ai: Move; outcome: Outcome } => !!r.player && !!r.ai && !!r.outcome),
    };
    try {
      await onReportResult?.(payload);
    } catch {
      // kui server feilib, me ei blokigi kasutajat—võib lisada UI teavituse
    } finally {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70">
      <div className="relative w-[92%] max-w-2xl rounded-2xl border border-white/10 bg-[#11162a]/95 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold">Rock · Paper · Scissors — Best of 3</h2>
          <button onClick={onClose} className="px-3 py-1 rounded-md border border-white/15 hover:bg-white/10 text-sm">
            Exit
          </button>
        </div>

        {/* Üldinfo */}
        <div className="text-white/70 text-sm mb-4">
          First to <b>2</b> wins. Victory rewards: <span className="text-cyan-300 font-semibold">{prize}</span>
        </div>

        {/* Skoor + ajalugu */}
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
                <HistoryPill key={idx} p={h.player} a={h.ai} r={h.outcome} />
              ))
            )}
          </div>
        </div>

        {/* Laud */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
          {/* player */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <div className="text-white/70 text-sm mb-1">You</div>
            <div className="text-5xl">{playerChoice ? EMOJI[playerChoice] : "❔"}</div>
          </div>

          {/* tulemus */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center flex flex-col items-center justify-center">
            <ResultBanner result={roundOutcome} />
            <div className="text-xs text-white/60">
              {playerChoice && aiChoice
                ? `You picked ${playerChoice} · Opponent picked ${aiChoice}`
                : "Pick your move"}
            </div>
          </div>

          {/* opponent */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <div className="text-white/70 text-sm mb-1">Opponent</div>
            <div className="text-5xl">{aiChoice ? EMOJI[aiChoice] : "❔"}</div>
          </div>
        </div>

        {/* Controls / Finish */}
        {!matchOver ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button disabled={isPicking} onClick={() => play("rock")} className="px-4 py-2 rounded-lg border border-white/15 hover:bg-white/10 disabled:opacity-50">🪨 Rock</button>
            <button disabled={isPicking} onClick={() => play("paper")} className="px-4 py-2 rounded-lg border border-white/15 hover:bg-white/10 disabled:opacity-50">📄 Paper</button>
            <button disabled={isPicking} onClick={() => play("scissors")} className="px-4 py-2 rounded-lg border border-white/15 hover:bg-white/10 disabled:opacity-50">✂️ Scissors</button>
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