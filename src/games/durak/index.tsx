import React from "react";
import type { GameProps } from "@games/GameTypes";

const DurakGame: React.FC<GameProps> = ({ settings, onFinish }) => {
  return (
    <div className="p-6 max-w-md mx-auto rounded-2xl border">
      <div className="text-xl font-semibold mb-4">Durak (Prototype)</div>
      <div className="mb-2 text-sm opacity-70">Variant: {String(settings?.variant ?? "classic")}</div>
      <button
        className="px-4 py-2 rounded-xl border"
        onClick={() => onFinish({ outcome: "win", meta: { reason: "stub" } })}
      >
        End (Fake Win)
      </button>
    </div>
  );
};

export const meta = {
  id: "durak",
  name: "Durak (stub)",
  capabilities: { overlay: true, realtime: true, maxPlayers: 2 },
  defaultSettings: { variant: "classic" }
};

export default DurakGame;