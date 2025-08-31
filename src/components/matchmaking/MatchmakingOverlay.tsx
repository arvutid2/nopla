import React, { useEffect, useState } from "react";

export default function MatchmakingOverlay({
  open,
  onCancel,
  onFound,
  searchMs = 1400,
}: {
  open: boolean;
  onCancel: () => void;
  onFound: (opponentName: string) => void;
  searchMs?: number;
}) {
  const [phase, setPhase] = useState<"idle"|"search"|"found">("idle");
  const [opponent, setOpponent] = useState("");

  useEffect(() => {
    if (!open) { setPhase("idle"); setOpponent(""); return; }
    setPhase("search"); setOpponent("");

    const names = ["NovaPrime","VoidWalker","Starling","NebulaFox","CosmoKat","OrionAce","LunaByte","QuasarKid"];
    const pick = () => names[Math.floor(Math.random() * names.length)];

    const t1 = setTimeout(() => {
      const name = pick();
      setOpponent(name);
      setPhase("found");
      setTimeout(() => onFound(name), 600);
    }, searchMs);

    return () => clearTimeout(t1);
  }, [open, onFound, searchMs]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
      <div className="w-[90%] max-w-md rounded-2xl border border-white/10 bg-[#1a1d2e]/95 p-6 text-center">
        {phase === "search" && (
          <>
            <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-cyan-400 rounded-full mx-auto mb-4" />
            <div className="font-bold">Looking for opponent…</div>
            <button className="mt-4 px-4 py-2 border border-white/20 rounded-lg text-sm hover:bg-white/10" onClick={onCancel}>
              Cancel
            </button>
          </>
        )}
        {phase === "found" && (
          <div className="font-bold text-green-400 text-lg">
            Opponent <span className="text-white">{opponent}</span> found!
          </div>
        )}
      </div>
    </div>
  );
}