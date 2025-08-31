import React, { useEffect, useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Swords,
  Rocket,
  Wallet,
  ShieldCheck,
  Trophy,
  Sparkles,
  Cpu,
  ChevronRight,
} from "lucide-react";

/********************
 * Background visuals
 ********************/
function Starfield({ density = 280, speed = 0.25 }) {
  const canvasRef = useRef(null);
  const stars = useMemo(
    () =>
      Array.from({ length: density }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random(),
        r: Math.random() * 1.2 + 0.2,
      })),
    [density]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    const onResize = () => requestAnimationFrame(resize);
    resize();
    window.addEventListener("resize", onResize);

    const loop = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "rgba(10,16,36,0.95)");
      grad.addColorStop(1, "rgba(4,8,20,0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      stars.forEach((s) => {
        s.z -= speed * 0.002;
        if (s.z <= 0) s.z = 1;

        const sx = (s.x - 0.5) * width * (1 / s.z) + width / 2;
        const sy = (s.y - 0.5) * height * (1 / s.z) + height / 2;
        const a = Math.max(0.2, 1 - s.z);

        ctx.beginPath();
        ctx.arc(sx, sy, s.r * (1 / s.z), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 2 * (1 / s.z), sy);
        ctx.strokeStyle = `rgba(180,200,255,${a * 0.4})`;
        ctx.lineWidth = 0.8 * (1 / s.z);
        ctx.stroke();
      });

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [stars, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 h-full w-full"
      style={{ filter: "saturate(1.1)" }}
    />
  );
}

function GlowOrb({ className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.45, scale: 1 }}
      transition={{ duration: 2, delay }}
      className={"pointer-events-none absolute rounded-full blur-3xl " + className}
    />
  );
}

/********************
 * UI bits
 ********************/
function Pill({ icon: Icon, children, onClick, variant = "primary", disabled = false }) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-0";
  const variants = {
    primary: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md ring-indigo-300",
    accent: "bg-indigo-500/90 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30",
    ghost: "bg-white/5 hover:bg-white/10 text-white/80",
  };
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 blur-2xl" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/10 p-2">
          <Icon className="h-5 w-5 text-indigo-300" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/60">{label}</p>
          <p className="text-xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md"
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-white/10 p-3">
          <Icon className="h-6 w-6 text-cyan-200" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">{title}</h4>
          <p className="mt-1 text-sm text-white/70">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

function LbRow({ i, name, rating, winrate }) {
  return (
    <div className="grid grid-cols-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="col-span-1 text-center text-white/60">#{i}</div>
      <div className="col-span-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/40 to-cyan-500/40 text-white">
          {name[0]}
        </div>
        <span className="text-white/90">{name}</span>
      </div>
      <div className="col-span-2 text-white/80">{rating}</div>
      <div className="col-span-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
            style={{ width: `${winrate}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-white/60">{winrate}% WR</p>
      </div>
    </div>
  );
}

/********************
 * Main Landing Page
 ********************/
export default function Landing() {
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-clip bg-[#060b1a] text-white">
      {/* Background */}
      <Starfield />
      <GlowOrb className="left-1/4 top-24 h-64 w-64 bg-cyan-500/30" />
      <GlowOrb className="right-10 top-1/3 h-72 w-72 bg-indigo-600/30" />
      <GlowOrb className="bottom-10 left-1/3 h-80 w-80 bg-fuchsia-600/20" />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-6"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-wide">ASTRA 1v1</span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Pill
            icon={Wallet}
            variant={walletConnected ? "primary" : "accent"}
            onClick={() => setWalletConnected(!walletConnected)}
          >
            {walletConnected ? "Wallet connected" : "Sign in with Pi"}
          </Pill>
        </div>
      </motion.nav>

      {/* Hero */}
      <header className="container mx-auto max-w-6xl px-4">
        <h1 className="text-5xl font-extrabold">Challenge the Galaxy</h1>
      </header>

      {/* Features */}
      <section className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Feature
            icon={Swords}
            title="Instant 1v1"
            desc="Jump into duels in seconds with latency-aware matchmaking."
          />
          <Feature
            icon={ShieldCheck}
            title="Escrow & Fairness"
            desc="Funds locked until verified result. Anti-cheat & audit log."
          />
          <Feature
            icon={Wallet}
            title="Pi-native"
            desc="Login & payouts via Pi. Transparent fees and on-chain receipts."
          />
        </div>
      </section>
    </div>
  );
}
