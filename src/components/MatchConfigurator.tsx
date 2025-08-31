import React, { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { Pill } from "./uiBits";

type Props = {
  isAuthed?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  onStart: (p: { prize: number; buyIn: number }) => void;
};

export default function MatchConfigurator({ isAuthed, onLogin, onLogout, onStart }: Props) {
  const [buyIn, setBuyIn] = useState(5);
  const [prize, setPrize] = useState(10);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Find 1v1 match</h3>
        <p className="text-sm text-white/70">Choose buy-in and target prize. We’ll match you by region & skill.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm text-white/70">Buy-in</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={buyIn}
              onChange={(e) => setBuyIn(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="min-w-16 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1 text-center">
              {buyIn}
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm text-white/70">Prize</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={2}
              max={100}
              step={2}
              value={prize}
              onChange={(e) => setPrize(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="min-w-16 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1 text-center">
              {prize}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!isAuthed ? (
          <Pill variant="ghost" onClick={onLogin}>Connect wallet</Pill>
        ) : (
          <Pill variant="ghost" onClick={onLogout}>Disconnect</Pill>
        )}
        <Pill icon={Gamepad2} variant="accent" onClick={() => onStart({ prize, buyIn })}>
          Start Game
        </Pill>
      </div>
    </div>
  );
}
