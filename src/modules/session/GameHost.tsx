import React, { Suspense, useMemo, useState } from "react";
import { loadGame } from "@games/manifest";
import type { GameMeta, GameSessionResult } from "@games/GameTypes";
import { calcPayouts, type PayoutConfig } from "@lib/payouts";

export function GameHost({
  gameId,
  playerRole = "solo",
  adminSettings = {},
  buyIn = 1,
  players = 2,
  payoutConfig,
  onComplete
}: {
  gameId: string;
  playerRole?: "host" | "guest" | "solo";
  adminSettings?: Record<string, unknown>;
  buyIn?: number;
  players?: number;
  payoutConfig: PayoutConfig;
  onComplete?: (r: GameSessionResult & { payout: { you: number; platform: number } }) => void;
}) {
  const [module, setModule] = useState<null | { meta: GameMeta; Component: any }>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    loadGame(gameId)
      .then((m) => { if (!alive) return; setModule({ meta: m.meta, Component: m.default }); })
      .catch((e) => { if (!alive) return; setError(String(e?.message || e)); });
    return () => { alive = false; };
  }, [gameId]);

  const settings = useMemo(
    () => ({ ...(module?.meta.defaultSettings || {}), ...(adminSettings || {}) }),
    [module, adminSettings]
  );

  if (error) return <div className="p-4 text-red-600">Game load error: {error}</div>;
  if (!module) return <div className="p-4">Loading game…</div>;

  const { Component } = module;
  const handleFinish = (r: GameSessionResult) => {
    const payout = calcPayouts({ buyIn, players, outcome: r.outcome, cfg: payoutConfig });
    onComplete?.({ ...r, payout });
  };

  return (
    <Suspense fallback={<div className="p-4">Preparing…</div>}>
      <Component settings={settings} onFinish={handleFinish} playerRole={playerRole} />
    </Suspense>
  );
}