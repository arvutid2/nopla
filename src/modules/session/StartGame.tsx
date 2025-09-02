import React from "react";
import type { MatchStatus } from "@modules/matchmaking/MatchmakingProvider";

export default function StartGame({
  gameId,
  buyIn,
  walletConnected,
  onStart,
  onCancel,
  status
}: {
  gameId: string;
  buyIn: number;
  walletConnected: boolean;
  onStart: () => void | Promise<void>;
  onCancel: () => void;
  status: MatchStatus;
}) {
  const disabled = !gameId || buyIn <= 0 || !walletConnected || status === "searching";
  return (
    <div className="flex items-center gap-3">
      <button
        className="px-4 py-2 rounded-xl border disabled:opacity-50"
        disabled={disabled}
        onClick={() => void onStart()}
        title={!walletConnected ? "Connect wallet first" : ""}
      >
        {status === "searching" ? "Searching…" : "Start Game"}
      </button>
      {status === "searching" && (
        <button className="px-4 py-2 rounded-xl border" onClick={onCancel}>Cancel</button>
      )}
    </div>
  );
}