// src/games/rps/Overlay.tsx
import React from "react";

export default function RPSOverlay({
  open,
  onClose,
  prize,
  buyIn,
}: {
  open: boolean;
  onClose: () => void;
  prize?: number;
  buyIn?: number;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
      <div className="w-[90%] max-w-md rounded-2xl border border-white/10 bg-[#1a1d2e]/95 p-6 text-center">
        <div className="text-lg font-semibold mb-2">Matchmaking overlay (legacy)</div>
        <p className="text-sm text-white/70 mb-4">
          See on vana komponent, mida enam ei kasutata. Uues voos kasuta{" "}
          <b>components/matchmaking/MatchmakingOverlay</b> ja <b>components/game/GameOverlay</b>.
        </p>
        {typeof buyIn === "number" && (
          <div className="text-white/80 mb-2">Buy-in: {buyIn}</div>
        )}
        {typeof prize === "number" && (
          <div className="text-cyan-300 font-bold mb-4">Winner gets: {prize}</div>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10"
        >
          Close
        </button>
      </div>
    </div>
  );
}