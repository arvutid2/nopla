import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, ShieldCheck, Sparkles, Rocket, Trophy, Cpu, ChevronRight } from "lucide-react";
import MatchConfigurator from "../components/matchmaking/MatchConfigurator";
import MatchmakingOverlay from "../components/matchmaking/MatchmakingOverlay";
import GameOverlay from "../components/game/GameOverlay";

/* UI abid */
const Starfield = () => (
  <div className="pointer-events-none fixed inset-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08),transparent_60%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08),transparent_60%)]" />
  </div>
);
const GlowOrb = ({ className = "" }: { className?: string }) => (
  <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />
);
function Pill(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: any; variant?: "primary"|"accent"|"ghost" }
) {
  const Icon = (props as any).icon;
  const v = (props as any).variant ?? "primary";
  const base = "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition";
  const style =
    v==="primary" ? "bg-indigo-600/90 hover:bg-indigo-600"
    : v==="accent" ? "bg-cyan-500/90 hover:bg-cyan-500"
    : "bg-white/[0.06] hover:bg-white/[0.12] border border-white/10";
  const { icon, variant, ...rest } = props as any;
  return <button className={`${base} ${style}`} {...rest}>{Icon && <Icon className="h-4 w-4" />}{props.children}</button>;
}
const StatCard = ({ icon:Icon, label, value }: any) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
    <div className="flex items-center gap-2 text-white/70 text-sm">{Icon && <Icon className="h-4 w-4" />} {label}</div>
    <div className="mt-1 text-2xl font-semibold">{value}</div>
  </div>
);
const LbRow = ({ i, name, rating, winrate }: any) => (
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

/* Your Stats (mock) */
function YourStats() {
  const stats = { gamesPlayed: 4, wins: 2, losses: 2, winrate: 50.0, biggestWin: 27.6, biggestLoss: 18.4, totalWon: 36.8, totalLost: 36.8 };
  const Item = ({ label, value, accent }: any) => (
    <div>
      <div className="text-white/70 text-sm">{label}</div>
      <div className={accent ? "text-emerald-300 text-lg font-semibold" : "text-lg font-semibold"}>{value}</div>
    </div>
  );
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        <Item label="Games Played" value={stats.gamesPlayed} />
        <Item label="Winrate" value={`${stats.winrate.toFixed(1)}%`} />
        <Item label="Wins" value={stats.wins} accent />
        <Item label="Losses" value={stats.losses} />
        <Item label="Biggest Win" value={`${stats.biggestWin} Pi`} accent />
        <Item label="Biggest Loss" value={`${stats.biggestLoss} Pi`} />
        <Item label="Total Won" value={`${stats.totalWon} Pi`} accent />
        <Item label="Total Lost" value={`${stats.totalLost} Pi`} />
      </div>
    </div>
  );
}

export default function Landing() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [buyIn, setBuyIn] = useState(5); // hoia viimane valik landingus

  const scrollToMatch = () => document.getElementById("match")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative min-h-screen w-full overflow-clip bg-[#060b1a] text-white">
      <Starfield />
      <GlowOrb className="left-1/4 top-24 h-64 w-64 bg-cyan-500/30" />
      <GlowOrb className="right-10 top-1/3 h-72 w-72 bg-indigo-600/30" />
      <GlowOrb className="bottom-10 left-1/3 h-80 w-80 bg-fuchsia-600/20" />

      {/* Nav */}
      <motion.nav initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-wide">ASTRA 1v1</span>
        </div>
      </motion.nav>

      {/* Hero */}
      <header className="container mx-auto max-w-6xl px-4 mb-12">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.12),transparent_40%)]" />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="relative z-10 grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Star-Atlas-vibe · Cosmic 1v1 Arena
              </div>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">
                Challenge the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-400 to-fuchsia-400">Galaxy</span>
              </h1>
              <p className="mt-4 text-white/70 md:text-lg">
                Instant 1v1 duels. Secure escrow with Pi. Neon-lit space vibes, buttery animations, zero friction.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href="#match" onClick={(e)=>{ e.preventDefault(); scrollToMatch(); }} className="no-underline">
                  <Pill icon={Gamepad2} variant="accent">Find 1v1 Match</Pill>
                </a>
                <Pill icon={ShieldCheck} variant="ghost">Provably fair</Pill>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <StatCard icon={Cpu} label="Players online" value={"128"} />
                <StatCard icon={Trophy} label="Duels today" value={"342"} />
                <StatCard icon={Rocket} label="Tickrate" value={"60 Hz"} />
              </div>
            </div>

            {/* Decorative holo planet */}
            <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9 }} className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-indigo-500/30 via-cyan-400/20 to-fuchsia-400/20 blur-2xl" />
              <div className="relative flex h-full w-full items-center justify-center rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                  className="absolute h-[80%] w-[80%] rounded-full border border-white/10" style={{ boxShadow: "0 0 60px rgba(99,102,241,.25) inset" }} />
                <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                  className="absolute h-[55%] w-[55%] rounded-full border border-white/10" style={{ boxShadow: "0 0 40px rgba(34,211,238,.25) inset" }} />
                <div className="relative z-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
                    <Rocket className="h-7 w-7" />
                  </div>
                  <p className="mt-3 text-sm text-white/70">Holographic Arena</p>
                  <p className="text-white/90">Synced · Smooth · Secure</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Your Stats */}
      <section className="container mx-auto max-w-6xl px-4 pb-12">
        <YourStats />
      </section>

      {/* Match Configurator (Lobby) */}
      <section id="match" className="container mx-auto max-w-6xl px-4 pb-14">
        <MatchConfigurator
          onStart={({ buyIn }) => {
            setBuyIn(buyIn);
            setOverlayOpen(true); // alustame matchmakingut
          }}
        />
      </section>

      {/* Leaderboard */}
      <section className="container mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-white/60">Top pilots</p>
            <h3 className="text-2xl font-semibold">Leaderboard</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[
            { n: "NovaPrime", r: 2412, wr: 78 },
            { n: "VoidWalker", r: 2320, wr: 74 },
            { n: "Starling", r: 2275, wr: 69 },
            { n: "NebulaFox", r: 2201, wr: 66 },
            { n: "CosmoKat", r: 2144, wr: 62 },
          ].map((p, i) => (
            <LbRow key={p.n} i={i + 1} name={p.n} rating={p.r} winrate={p.wr} />
          ))}
        </div>
      </section>

      {/* Footer CTA — kerib lobby juurde */}
      <footer className="relative border-t border-white/10 bg-white/[0.02]">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h4 className="text-2xl font-semibold">Ready to duel?</h4>
              <p className="mt-1 text-white/70">Create a lobby, set a buy-in and invite a friend.</p>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
              <Pill icon={ChevronRight} variant="primary" onClick={scrollToMatch}>Get started</Pill>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row">
            <p>© {new Date().getFullYear()} Astra 1v1. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a className="hover:text-white/90" href="#">Privacy</a>
              <a className="hover:text-white/90" href="#">Terms</a>
              <a className="hover:text-white/90" href="#">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Overlays */}
      <MatchmakingOverlay
        open={overlayOpen}
        onCancel={()=>setOverlayOpen(false)}
        onFound={()=>{
          setOverlayOpen(false);
          setGameOpen(true); // avame mängu hüpikuna
        }}
      />
      <GameOverlay open={gameOpen} onClose={()=>setGameOpen(false)} buyIn={buyIn} />
    </div>
  );
}