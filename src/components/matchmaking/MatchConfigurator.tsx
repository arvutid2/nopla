import React, { useState } from "react";
import { Gamepad2 } from "lucide-react";

function Pill(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: any;
    variant?: "primary" | "accent" | "ghost";
  }
) {
  const Icon = (props as any).icon;
  const v = (props as any).variant ?? "primary";
  const base = "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition";
  const style =
    v === "primary" ? "bg-indigo-600/90 hover:bg-indigo-600"
    : v === "accent" ? "bg-cyan-500/90 hover:bg-cyan-500"
    : "bg-white/[0.06] hover:bg-white/[0.12] border border-white/10";
  const { icon, variant, ...rest } = props as any;
  return <button className={`${base} ${style}`} {...rest}>{Icon && <Icon className="h-4 w-4" />}{props.children}</button>;
}

export default function MatchConfigurator({ onStart }: { onStart: (p:{ buyIn:number })=>void }) {
  const [buyIn, setBuyIn] = useState(5); // alg 5
  const winnerGets = Math.round(buyIn * 1.9 * 100) / 100; // 1.9 × buy-in

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Find 1v1 match</h3>
        <p className="text-sm text-white/70">Choose your buy-in. Winner takes the pot minus 10% platform fee.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="text-sm text-white/70">Buy-in</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range" min={5} max={100} step={5}
              value={buyIn} onChange={(e)=>setBuyIn(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="min-w-16 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1 text-center">{buyIn}</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 text-center">
          <div className="text-sm text-white/70">Winner gets</div>
          <div className="text-3xl md:text-4xl font-extrabold text-cyan-300 mt-2">{winnerGets}</div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Pill icon={Gamepad2} variant="accent" onClick={()=>onStart({ buyIn })}>Start Game</Pill>
      </div>
    </div>
  );
}