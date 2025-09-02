import type { Outcome } from "@games/GameTypes";

export type PayoutConfig = {
  platformFee: number;
  modes: {
    "1v1"?: { winner: number };
  };
};

export const payoutConfig: PayoutConfig = {
  platformFee: 0.1,
  modes: { "1v1": { winner: 0.9 } }
};

export function calcPayouts({ buyIn, players, outcome, cfg }: {
  buyIn: number; players: number; outcome: Outcome; cfg: PayoutConfig;
}) {
  const pool = buyIn * players;
  const fee = pool * cfg.platformFee;
  const net = pool - fee;
  if (players === 2) {
    if (outcome === "draw") return { you: buyIn, platform: 0 };
    const youWin = outcome === "win";
    return { you: youWin ? net : 0, platform: fee };
  }
  return { you: 0, platform: fee };
}