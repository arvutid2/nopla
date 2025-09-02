import React from "react";
import { cn } from "./utils";
import { ChevronRight } from "lucide-react";

export function Starfield() {
  return (
    <div className="pointer-events-none fixed inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08),transparent_60%)]" />
    </div>
  );
}

export function GlowOrb({ className = "" }: { className?: string }) {
  return <div className={cn("pointer-events-none absolute rounded-full blur-3xl", className)} />;
}

export function Pill({
  children,
  icon: Icon,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: any;
  variant?: "primary" | "accent" | "ghost";
}) {
  const base = "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition";
  const style =
    variant === "primary"
      ? "bg-indigo-600/90 hover:bg-indigo-600"
      : variant === "accent"
      ? "bg-cyan-500/90 hover:bg-cyan-500"
      : "bg-white/[0.06] hover:bg-white/[0.12] border border-white/10";
  return (
    <button className={cn(base, style, className)} {...rest}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-white/70 text-sm">
        {Icon && <Icon className="h-4 w-4" />} {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export function LbRow({ i, name, rating, winrate }: any) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="min-w-8 text-center text-sm opacity-70">#{i}</div>
        <div className="font-semibold">{name}</div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="opacity-80">Rating: <b>{rating}</b></div>
        <div className="opacity-80">WR: <b>{winrate}%</b></div>
        <ChevronRight className="h-4 w-4 opacity-60" />
      </div>
    </div>
  );
}
