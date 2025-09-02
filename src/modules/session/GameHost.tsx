// src/modules/session/GameHost.tsx
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { loadGame } from "@games/manifest";
import type { GameMeta, GameSessionResult, GameModule } from "@games/GameTypes";
import { calcPayouts, type PayoutConfig, payoutConfig as defaultPayoutConfig } from "@lib/payouts";

type LoadedModule = { meta: GameMeta; Component: React.ComponentType<any> };

export function GameHost({
  gameId,
  playerRole = "solo",
  adminSettings = {},
  buyIn = 1,
  players = 2,
  payoutConfig = defaultPayoutConfig,
  onComplete,
}: {
  gameId: string;
  playerRole?: "host" | "guest" | "solo";
  adminSettings?: Record<string, unknown>;
  buyIn?: number;
  players?: number;
  payoutConfig?: PayoutConfig;
  onComplete?: (result: GameSessionResult & { payout: any }) => void;
}) {
  const [mod, setMod] = useState<LoadedModule | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setMod(null);
    setError("");

    (async () => {
      try {
        if (!gameId) throw new Error("Unknown game key: undefined");
        // cast gameId, et sobida kitsama unioniga
        const m = (await loadGame(gameId as any)) as unknown as GameModule;
        const entry: LoadedModule = { meta: (m as any).meta, Component: (m as any).default };
        if (!entry?.Component) throw new Error("Game module missing default export");
        if (!cancelled) setMod(entry);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  const settings = useMemo(() => {
    const base = (mod?.meta?.defaultSettings as Record<string, unknown> | undefined) || {};
    return { ...base, ...adminSettings };
  }, [mod?.meta?.defaultSettings, adminSettings]);

  if (error) return <div className="p-4 text-red-600">Game load error: {error}</div>;
  if (!mod) return <div className="p-4">Loading game…</div>;

  const { Component } = mod;
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

export default GameHost;
