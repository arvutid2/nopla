import { useParams } from "react-router-dom";
import { GameHost } from "@modules/session/GameHost";
import { payoutConfig } from "@lib/payouts";

export default function Play() {
  const params = useParams();
  const gameId = (params.gameId as string | undefined) ?? "rps";
  return (
    <main className="max-w-3xl mx-auto p-6">
      <GameHost
        gameId={gameId}
        players={2}
        buyIn={1}
        payoutConfig={payoutConfig}
        onComplete={(r) => {
          alert(`Result: ${r.outcome} | You get: ${r.payout.you}`);
        }}
      />
    </main>
  );
}