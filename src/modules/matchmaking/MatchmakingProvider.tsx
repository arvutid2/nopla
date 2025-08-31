import React, { createContext, useContext, useMemo, useState } from "react";

export type MatchStatus = "idle" | "searching" | "found" | "cancelled";

export type FindParams = { gameId: string; buyIn: number };

type Ctx = {
  status: MatchStatus;
  findOpponent: (p: FindParams) => Promise<boolean>;
  cancel: () => void;
};

const MMContext = createContext<Ctx | undefined>(undefined);

export function MatchmakingProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<MatchStatus>("idle");

  const findOpponent = async (_: FindParams) => {
    setStatus("searching");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("found");
    return true;
  };

  const cancel = () => setStatus("cancelled");

  const value = useMemo(() => ({ status, findOpponent, cancel }), [status]);
  return <MMContext.Provider value={value}>{children}</MMContext.Provider>;
}

export function useMatchmaking() {
  const ctx = useContext(MMContext);
  if (!ctx) throw new Error("useMatchmaking must be used inside MatchmakingProvider");
  return ctx;
}