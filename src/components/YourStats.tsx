// src/components/YourStats.tsx
import React, { useEffect, useState } from "react";
import { supabase, userId } from "../lib/supabaseClient";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type Stats = {
  games_played: number;
  wins: number;
  losses: number;
  total_won: number;
  total_lost: number;
};

const EMPTY: Stats = {
  games_played: 0,
  wins: 0,
  losses: 0,
  total_won: 0,
  total_lost: 0,
};

const YourStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [loading, setLoading] = useState(true);

  async function fetchStatsOnce() {
    setLoading(true);

    // loe läbi RPC, mööda RLS-ist
    const { data, error } = await supabase.rpc("get_stats", { p_user_id: userId });
    if (error) {
      console.error("[YourStats] get_stats error:", error);
      setStats(EMPTY);
    } else if (Array.isArray(data) && data.length > 0) {
      const row = data[0] as Stats;
      setStats({
        games_played: row.games_played ?? 0,
        wins: row.wins ?? 0,
        losses: row.losses ?? 0,
        total_won: Number(row.total_won ?? 0),
        total_lost: Number(row.total_lost ?? 0),
      });
    } else {
      setStats(EMPTY);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchStatsOnce();

    // Kui Realtime on lubatud stats tabelil, võime kuulata ka muudatusi.
    // Kui pole lubatud, jääb toimima 'stats-refresh' fallback.
    const ch = supabase
      .channel(`stats-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stats", filter: `user_id=eq.${userId}` },
        (_payload: RealtimePostgresChangesPayload<any>) => {
          // lihtsalt loe RPC-ga uuesti – töökindel
          fetchStatsOnce();
        }
      )
      .subscribe();

    const handler = () => fetchStatsOnce();
    window.addEventListener("stats-refresh", handler as EventListener);

    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener("stats-refresh", handler as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = stats;
  const winrate = s.games_played ? (s.wins / s.games_played) * 100 : 0;

  const Item = ({
    label,
    value,
    accent = false,
  }: {
    label: string;
    value: React.ReactNode;
    accent?: boolean;
  }) => (
    <div>
      <div className="text-white/70 text-sm">{label}</div>
      <div className={accent ? "text-emerald-300 text-lg font-semibold" : "text-lg font-semibold"}>
        {loading ? "…" : value}
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        <Item label="Games Played" value={s.games_played} />
        <Item label="Winrate" value={`${winrate.toFixed(1)}%`} />
        <Item label="Wins" value={s.wins} accent />
        <Item label="Losses" value={s.losses} />
        <Item label="Total Won" value={`${s.total_won} Pi`} accent />
        <Item label="Total Lost" value={`${s.total_lost} Pi`} />
      </div>
    </div>
  );
};

export default YourStats;
