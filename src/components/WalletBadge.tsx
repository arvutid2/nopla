import React from "react";
import { useWallet } from "../hooks/useWallet";

function short(id?: string | null) {
  if (!id) return "-";
  return id.length <= 10 ? id : `${id.slice(0, 6)}…${id.slice(-4)}`;
}

export default function WalletBadge() {
  const w = useWallet();
  return (
    <div className="fixed right-4 top-4 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur">
      {w.isConnected ? (
        <>
          <span className="text-xs opacity-80">{w.username ?? "Wallet"}</span>
          <span className="text-xs font-mono">{short(w.id)}</span>
          <button onClick={w.disconnect} className="rounded-full border border-white/10 px-2 py-1 text-xs hover:border-white/20">
            Disconnect
          </button>
        </>
      ) : (
        <button onClick={w.connect} className="rounded-full border border-white/10 px-3 py-1 text-xs hover:border-white/20">
          Connect Wallet
        </button>
      )}
    </div>
  );
}
