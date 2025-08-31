import type { GameMeta, GameModule } from "@games/GameTypes";

export const gameManifest: Array<{
  meta: GameMeta;
  load: () => Promise<GameModule>;
}> = [
  {
    meta: {
      id: "rps",
      name: "Rock-Paper-Scissors",
      capabilities: { overlay: true, bestOf: true, drawRefund: true, ai: true, maxPlayers: 2 },
      defaultSettings: { bestOf: 3, drawRefund: true }
    },
    load: () => import("@games/rps").then((m) => m as unknown as GameModule)
  },
  {
    meta: {
      id: "durak",
      name: "Durak (stub)",
      capabilities: { overlay: true, realtime: true, maxPlayers: 2 },
      defaultSettings: { variant: "classic" }
    },
    load: () => import("@games/durak").then((m) => m as unknown as GameModule)
  }
];

export async function loadGame(gameId: string): Promise<GameModule> {
  const item = gameManifest.find((g) => g.meta.id === gameId);
  if (!item) throw new Error(`Unknown game: ${gameId}`);
  return item.load();
}