import React from "react";
import wallet from "../lib/wallet";

type StatRow = {
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
};

export default function YourStats({ stats }: { stats: StatRow | null }) {
  const notLogged = !wallet.isConnected();

  const cell = (label: string, val: React.ReactNode) => (
    <div className="flex flex-col items-center rounded-xl border border-white/10 p-3">
      <div className="text-lg font-bold">{val}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  );

  if (notLogged || !stats) {
    return (
      <div className="grid grid-cols-3 gap-3 text-center text-xs opacity-80">
        {cell("Games", "–")}
        {cell("Winrate", "–")}
        {cell("Wagered", "–")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 text-center text-xs opacity-80">
      {cell("Games", stats.games_played)}
      {cell("Winrate", `${stats.winrate}%`)}
      {cell("Wagered", stats.total_wagered)}
    </div>
  );
}
