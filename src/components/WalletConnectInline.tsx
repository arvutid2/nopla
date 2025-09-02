// src/components/WalletConnectInline.tsx
import React, { useState } from "react";
import wallet from "../lib/wallet";

export default function WalletConnectInline({ onConnected }: { onConnected?: () => void }) {
  const [busy, setBusy] = useState(false);

  if (wallet.isConnected()) return null;

  return (
    <button
      onClick={async () => {
        try {
          setBusy(true);
          await wallet.connect();
          onConnected?.();
        } finally {
          setBusy(false);
        }
      }}
      className="rounded-full border border-white/10 px-3 py-1 text-xs hover:border-white/20 disabled:opacity-50"
      disabled={busy}
      title="Connect your wallet to view stats"
    >
      {busy ? "Connecting…" : "Connect wallet"}
    </button>
  );
}
