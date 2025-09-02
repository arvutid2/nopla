import { supabase } from "../lib/supabaseClient";
import { wallet } from "../lib/wallet";

export type WalletStats = {
  wallet_id: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  total_wagered: number;
  profit: number;
  biggest_win: number;
  biggest_loss: number;
  last_played: string | null;
};

export async function fetchYourStats(): Promise<WalletStats | null> {
  const walletId = wallet.getId?.() ?? null;
  if (!walletId) return null;

  if (supabase) {
    // Kui kasutad vaadet:
    // const { data, error } = await supabase.from("v_wallet_stats").select("*").eq("wallet_id", walletId).maybeSingle();
    const { data, error } = await supabase
      .from("wallet_stats")
      .select("*")
      .eq("wallet_id", walletId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return {
        wallet_id: walletId, games: 0, wins: 0, losses: 0, draws: 0,
        total_wagered: 0, profit: 0, biggest_win: 0, biggest_loss: 0, last_played: null
      };
    }
    return data as WalletStats;
  } else {
    // dev fallback ilma supabase’ita
    const raw = localStorage.getItem(`stats_${walletId}`);
    return raw ? JSON.parse(raw) : {
      wallet_id: walletId, games: 0, wins: 0, losses: 0, draws: 0,
      total_wagered: 0, profit: 0, biggest_win: 0, biggest_loss: 0, last_played: null
    };
  }
}
