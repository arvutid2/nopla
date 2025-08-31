import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MatchmakingProvider, useMatchmaking } from "@modules/matchmaking/MatchmakingProvider";
import StartGame from "@modules/session/StartGame";

export default function FindMatch() {
  return (
    <MatchmakingProvider>
      <FindMatchInner />
    </MatchmakingProvider>
  );
}

function FindMatchInner() {
  const nav = useNavigate();
  const { status, findOpponent, cancel } = useMatchmaking();
  const [gameId, setGameId] = useState("rps");
  const [buyIn, setBuyIn] = useState(1);
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Find 1v1 Match</h1>
      <div className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid">
            <span className="text-sm mb-1">Game</span>
            <select value={gameId} onChange={(e) => setGameId(e.target.value)} className="border rounded-xl p-2">
              <option value="rps">Rock-Paper-Scissors</option>
              <option value="durak">Durak (stub)</option>
            </select>
          </label>
          <label className="grid">
            <span className="text-sm mb-1">Buy-in</span>
            <input type="number" min={1} value={buyIn} onChange={(e) => setBuyIn(Number(e.target.value))} className="border rounded-xl p-2" />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input id="w" type="checkbox" checked={walletConnected} onChange={(e) => setWalletConnected(e.target.checked)} />
          <label htmlFor="w">Wallet connected</label>
        </div>

        <StartGame
          gameId={gameId}
          buyIn={buyIn}
          walletConnected={walletConnected}
          onStart={async () => {
            const ok = await findOpponent({ gameId, buyIn });
            if (ok) nav(`/play/${gameId}`);
          }}
          status={status}
          onCancel={cancel}
        />
      </div>
    </main>
  );
}