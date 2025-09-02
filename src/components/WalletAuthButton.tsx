// src/components/WalletAuthButton.tsx
import React, { useState } from "react";
import wallet from "../lib/wallet";

export default function WalletAuthButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const connected = wallet.isConnected();
  const username = wallet.getUsername();

  const handle = async () => {
    try {
      setBusy(true);
      if (!connected) {
        await wallet.connect();
      } else {
        await wallet.disconnect();
      }
      // Teavita "Your Stats" kaarti, et ta uuendaks
      window.dispatchEvent(new CustomEvent("stats-refresh"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={busy}
      className={[
        "rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs backdrop-blur",
        "hover:border-white/20 disabled:opacity-60",
        className
      ].join(" ")}
      title={connected ? "Log out" : "Log in"}
    >
      {busy ? "…" : (connected ? `Log out${username ? ` (${username})` : ""}` : "Log in")}
    </button>
  );
}
