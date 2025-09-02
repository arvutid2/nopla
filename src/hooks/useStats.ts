import { useEffect, useState } from "react";
import { supabase, userId } from "../lib/supabaseClient";

export type Stats = {
  games_played: number;
  wins: number;
  losses: number;
  total_won: number;
  total_lost: number;
};

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    setLoading(true);

    // ensure rows exist
    await supabase.from("profiles").upsert({ id: userId }, { onConflict: "id" });
    await supabase.from("stats").upsert({ user_id: userId }, { onConflict: "user_id" });

    const { data, error } = await supabase
      .from("stats")
      .select("games_played,wins,losses,total_won,total_lost")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) console.error(error);
    setStats(
      data ?? {
        games_played: 0,
        wins: 0,
        losses: 0,
        total_won: 0,
        total_lost: 0,
      }
    );
    setLoading(false);
  }

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refresh: fetchStats };
}