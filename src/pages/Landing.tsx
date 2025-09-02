import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import WalletAuthButton from "../components/WalletAuthButton";
import { ShieldCheck, Rocket, Trophy, Cpu } from "lucide-react";

import MatchConfigurator from "../components/matchmaking/MatchConfigurator";
import MatchmakingOverlay from "../components/matchmaking/MatchmakingOverlay";
import GameOverlay from "../components/game/GameOverlay";
import YourStats from "../components/YourStats";

import { supabase, userId } from "../lib/supabaseClient";
import wallet from "../lib/wallet";

/* ---- visuaalid ---- */
const Starfield = () => (
  <div className="pointer-events-none fixed inset-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08),transparent_60%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08),transparent_60%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.08),transparent_60%)]" />
  </div>
);

const GlowOrb = ({ className = "" }: { className?: string }) => (
  <div
    className={
      "pointer-events-none absolute aspect-square w-[380px] -translate-x-1/2 rounded-full blur-3xl " +
      className
    }
  />
);

/* ---- tüübid ---- */
type StatRow =
  | {
      games_played: number;
      wins: number;
      losses: number;
      draws: number;
      total_wagered: number;
      total_won: number;
      total_lost: number;
      biggest_win: number;
      biggest_loss: number;
      winrate: number;
    }
  | null;

export default function Landing() {
  const [mmOpen, setMmOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [pvp, setPvp] = useState<null | {
    mode: "pvp";
    matchId: string;
    role: "host" | "guest";
    opponentId: string;
    opponentName: string;
  }>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const [stats, setStats] = useState<StatRow>(null);
  const [playersOnline, setPlayersOnline] = useState<number>(0);
  const [duelsToday, setDuelsToday] = useState<number>(0);
  const [moneyWon, setMoneyWon] = useState<number>(0);

  const buyInRef = useRef<number>(5);

  useEffect(() => {
    const onRefresh = () => {
      refreshStats();
      refreshSiteMetrics();
    };
    window.addEventListener("stats-refresh", onRefresh as EventListener);
    return () => window.removeEventListener("stats-refresh", onRefresh as EventListener);
  }, []);

  useEffect(() => {
    refreshStats();
    refreshSiteMetrics();

    const ch = supabase?.channel("presence-online", { config: { presence: { key: userId } } });
    ch?.on("presence", { event: "sync" }, () => {
      const state = ch?.presenceState() || {};
      const count = Object.keys(state).length;
      setPlayersOnline(count);
    });
    ch?.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        ch.track({ online: true, t: Date.now() });
      }
    });
    return () => {
      ch?.unsubscribe();
    };
  }, []);

  async function refreshStats() {
    try {
      const wid = wallet.getId();
      if (!wid) {
        setStats(null);
        return;
      }
      const { data } = await supabase
        ?.from("matches")
        .select("buy_in,outcome,host_wallet,guest_wallet,winner_wallet")
        .or(`host_wallet.eq.${wid},guest_wallet.eq.${wid}`)!;
      if (Array.isArray(data)) {
        let games = 0,
          wins = 0,
          losses = 0,
          draws = 0;
        let total_wagered = 0,
          total_won = 0,
          total_lost = 0,
          biggest_win = 0,
          biggest_loss = 0;

        for (const m of data) {
          const b = Number((m as any).buy_in || 0);
          games += 1;
          total_wagered += b;
          if ((m as any).outcome === "draw") {
            draws += 1;
          } else {
            const iWon = (m as any).winner_wallet === wid;
            if (iWon) {
              wins += 1;
              const prizeNet = Math.floor(2 * b * 0.9) - b;
              total_won += Math.floor(2 * b * 0.9);
              biggest_win = Math.max(biggest_win, prizeNet);
            } else {
              losses += 1;
              total_lost += b;
              biggest_loss = Math.max(biggest_loss, b);
            }
          }
        }
        const winrate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
        setStats({
          games_played: games,
          wins,
          losses,
          draws,
          total_wagered,
          total_won,
          total_lost,
          biggest_win,
          biggest_loss,
          winrate,
        });
        return;
      }
      setStats(null);
    } catch {
      setStats(null);
    }
  }

  async function refreshSiteMetrics() {
    if (!supabase) return;
    let money = 0;
    let duels = 0;
    try {
      const { data, error } = await supabase.from("matches").select("buy_in,outcome");
      if (!error && Array.isArray(data)) {
        const sum = data.reduce((acc: number, m: any) => {
          if (m?.outcome === "draw") return acc;
          const b = Number(m?.buy_in || 0);
          return acc + 2 * b * 0.9;
        }, 0);
        money = Math.round(sum);
        duels = data.length;
      }
    } catch {}
    setMoneyWon(money || 0);
    setDuelsToday(duels || 0);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090e1a] text-white">
      <Starfield />
      <header className="relative z-10 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto flex w-[min(1200px,95vw)] items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-400/30">
              <Rocket size={18} />
            </div>
            <div className="text-lg font-semibold">Nopla</div>
            <div className="ml-3 hidden items-center gap-3 text-xs opacity-70 md:flex">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={14} /> Skill
              </span>
              <span className="inline-flex items-center gap-1">
                <Cpu size={14} /> Fair
              </span>
              <span className="inline-flex items-center gap-1">
                <Trophy size={14} /> PvP
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WalletAuthButton />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <GlowOrb className="left-[15%] top-[-120px] bg-indigo-500/25" />
        <GlowOrb className="left-[75%] top-[20px] bg-cyan-400/25" />
        <GlowOrb className="left-[55%] top-[200px] bg-pink-500/20" />

        <div className="relative mx-auto w-[min(1200px,95vw)] py-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-balance text-4xl font-extrabold leading-tight md:text-5xl"
              >
                Challenge the Galaxy.<br />
                <span className="bg-gradient-to-r from-indigo-300 via-cyan-200 to-pink-300 bg-clip-text text-transparent">
                  Skill-based PvP duels.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="mt-4 max-w-xl text-balance text-sm opacity-80 md:text-base"
              >
                Stake, play, win. Real-time match-making with provably fair mechanics.
                No bots — just you and your opponent.
              </motion.p>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/10 via-cyan-400/10 to-pink-500/10 blur-2xl" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="grid grid-cols-3 gap-3 text-center text-xs opacity-80">
                  <div className="rounded-xl border border-white/10 p-3">
                    <div className="text-lg font-bold">
                      {Intl.NumberFormat().format(moneyWon)}
                    </div>
                    <div>Money won</div>
                  </div>
                  <div className="rounded-xl border border-white/10 p-3">
                    <div className="text-lg font-bold">{playersOnline}</div>
                    <div>online</div>
                  </div>
                  <div className="rounded-xl border border-white/10 p-3">
                    <div className="text-lg font-bold">{duelsToday}</div>
                    <div>duels today</div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold">Your Stats</div>
                    <div className="text-xs opacity-70">
                      {wallet.isConnected() && stats ? `${stats.winrate}% winrate` : "—"}
                    </div>
                  </div>
                  <YourStats stats={stats} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Play section */}
      <section id="play" className="relative">
        <div className="mx-auto w-[min(1200px,95vw)] py-12">
          <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-lg font-bold">Find 1v1 Match</div>
                <div className="text-xs opacity-70">Rock–Paper–Scissors</div>
              </div>
              <MatchConfigurator
                onStart={({ buyIn }) => {
                  buyInRef.current = buyIn;
                  setMmOpen(true);
                }}
              />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-lg font-bold">Live Feed</div>
                <div className="text-xs opacity-70">Realtime updates</div>
              </div>
              <div className="space-y-2 text-sm opacity-80">
                <div>• Host advantage balanced at selection</div>
                <div>• Anti-bot heuristics active</div>
                <div>• Region-based matchmaking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overlays */}
      <MatchmakingOverlay
        open={mmOpen}
        onCancel={() => setMmOpen(false)}
        onFound={(payload) => {
          setMmOpen(false);
          setPvp({
            mode: "pvp",
            matchId: payload.matchId,
            role: payload.role,
            opponentId: payload.opponentId,
            opponentName: payload.opponentName,
          });
          setSessionKey((k) => k + 1);
          setOverlayOpen(true);
        }}
      />

      <GameOverlay
        key={pvp?.matchId || `ai-${sessionKey}`}
        open={overlayOpen}
        onClose={() => {
          setOverlayOpen(false);
        }}
        buyIn={buyInRef.current}
        mode={pvp ? "pvp" : "ai"}
        matchId={pvp?.matchId}
        role={pvp?.role}
        onReportResult={async ({ matchResult }) => {
          const wid = wallet.getId();
          const myWin = matchResult === "you_win";
          const hostWallet = pvp?.role === "host" ? wid : pvp?.opponentId;
          const guestWallet = pvp?.role === "guest" ? wid : pvp?.opponentId;
          const clientMatchId =
            pvp?.matchId || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
          const outcome =
            pvp?.role === "host"
              ? (myWin ? "host" : "guest")
              : (myWin ? "guest" : "host");

          let wrote = false;
          try {
            if (hostWallet && guestWallet) {
              const { error } = await supabase
                ?.rpc("record_match", {
                  p_client_match_id: clientMatchId,
                  p_game: "rps",
                  p_buy_in: buyInRef.current,
                  p_host_wallet: hostWallet,
                  p_guest_wallet: guestWallet,
                  p_outcome: outcome,
                  p_host_username:
                    pvp?.role === "host" ? wallet.getUsername() : pvp?.opponentName,
                  p_guest_username:
                    pvp?.role === "guest" ? wallet.getUsername() : pvp?.opponentName,
                })!;
              if (!error) wrote = true;
            }
          } catch {}

          if (!wrote && hostWallet && guestWallet) {
            try {
              await supabase!.from("wallets").upsert(
                [
                  {
                    wallet_id: hostWallet,
                    username:
                      pvp?.role === "host" ? wallet.getUsername() : pvp?.opponentName,
                  },
                  {
                    wallet_id: guestWallet,
                    username:
                      pvp?.role === "guest" ? wallet.getUsername() : pvp?.opponentName,
                  },
                ],
                { onConflict: "wallet_id" }
              );

              const fee = Math.round(buyInRef.current * 2 * 0.1);
              const winner_wallet = outcome === "host" ? hostWallet : guestWallet;

              await supabase!
                .from("matches")
                .upsert(
                  {
                    client_match_id: clientMatchId,
                    game: "rps",
                    buy_in: buyInRef.current,
                    host_wallet: hostWallet,
                    guest_wallet: guestWallet,
                    outcome,
                    winner_wallet,
                    fee,
                  },
                  { onConflict: "client_match_id" }
                );
            } catch (e) {
              console.error("fallback upsert failed", e);
            }
          }

          await refreshStats();
          await refreshSiteMetrics();
          window.dispatchEvent(new CustomEvent("stats-refresh"));
          setPvp(null);
        }}
      />
    </div>
  );
}
