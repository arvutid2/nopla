import React from "react";

export default function YourStats() {
  const stats = {
    gamesPlayed: 4,
    wins: 2,
    losses: 2,
    winrate: 50.0,
    biggestWin: 27.6,
    biggestLoss: 18.4,
    totalWon: 36.8,
    totalLost: 36.8,
  };

  const Item = ({ label, value, accent }: any) => (
    <div>
      <div className="text-white/70 text-sm">{label}</div>
      <div className={accent ? "text-emerald-300 text-lg font-semibold" : "text-lg font-semibold"}>
        {value}
      </div>
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
