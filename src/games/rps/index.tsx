import React from "react";
import type { GameProps } from "@games/GameTypes";
import { choices, decide, type Choice } from "@games/rps/logic";

const RpsGame: React.FC<GameProps> = ({ settings, onFinish }) => {
  const [your, setYour] = React.useState<Choice | null>(null);
  const [opp, setOpp] = React.useState<Choice | null>(null);
  const bestOf = Number(settings?.bestOf ?? 3);
  const drawRefund = Boolean(settings?.drawRefund ?? true);
  const [score, setScore] = React.useState({ you: 0, opp: 0 });

  const playRound = (c: Choice) => {
    const o = choices[Math.floor(Math.random() * choices.length)];
    setYour(c);
    setOpp(o);
    const outcome = decide(c, o);
    if (outcome === "win") setScore((s) => ({ ...s, you: s.you + 1 }));
    if (outcome === "loss") setScore((s) => ({ ...s, opp: s.opp + 1 }));
  };

  React.useEffect(() => {
    const needed = Math.ceil(bestOf / 2);
    if (score.you >= needed || score.opp >= needed) {
      const final = score.you === score.opp
        ? { outcome: drawRefund ? "draw" : score.you > score.opp ? "win" : "loss", meta: { score } }
        : { outcome: score.you > score.opp ? "win" : "loss", meta: { score } };
      onFinish(final as any);
    }
  }, [score, bestOf, drawRefund, onFinish]);

  return (
    <div className="p-6 max-w-md mx-auto rounded-2xl border">
      <div className="text-xl font-semibold mb-4">Rock-Paper-Scissors</div>
      <div className="mb-2">Best of: {bestOf}</div>
      <div className="mb-4">Score: You {score.you} – {score.opp} Opp</div>
      <div className="flex gap-2 mb-4">
        {choices.map((c) => (
          <button key={c} className="px-4 py-2 rounded-xl border" onClick={() => playRound(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="opacity-70">Last: You {your ?? "?"} vs Opp {opp ?? "?"}</div>
    </div>
  );
};

export const meta = {
  id: "rps",
  name: "Rock-Paper-Scissors",
  capabilities: { overlay: true, bestOf: true, drawRefund: true, ai: true, maxPlayers: 2 },
  defaultSettings: { bestOf: 3, drawRefund: true }
};

export default RpsGame;