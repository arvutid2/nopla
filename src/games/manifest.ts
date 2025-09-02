import React from "react";

/** Võtme nimed peavad kattuma sellega, mida GameHost ette annab. */
export type GameKey = "rps"; // lisa siia teisi mänge nt "ttt" jne

type Loader = () => Promise<{ default: React.ComponentType<any> }>;

const registry: Record<GameKey, Loader> = {
  // kui sinu RPS entry on teises failis, muuda rada (nt "./rps/OnlineRps")
  rps: () => import("./rps").then(m => ({ default: m.default })),
};

/** Kui tahad saada kohe komponendi (ilma React.lazy): */
export async function loadGame(key: GameKey) {
  const loader = registry[key as GameKey];
  if (!loader) throw new Error(`Unknown game key: ${key}`);
  const mod = await loader();
  return mod.default;
}

/** Kui GameHost eelistab lazy-komponenti: */
export function lazyGame(key: GameKey) {
  const loader = registry[key as GameKey];
  if (!loader) throw new Error(`Unknown game key: ${key}`);
  return React.lazy(loader);
}
