// src/hooks/useWallet.ts
import { useEffect, useState } from "react";
import { wallet } from "../lib/wallet";

export function useWallet() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const off = wallet.onChange(() => setTick((t) => t + 1));
    // Tagasta cleanup, mis EI tagasta midagi:
    return () => {
      if (typeof off === "function") {
        off(); // ignore return value
      }
    };
  }, []);

  return {
    isConnected: wallet.isConnected(),
    id: wallet.getId(),
    username: wallet.getUsername(),
    connect: () => wallet.connect(),
    disconnect: () => wallet.disconnect(),
  };
}

export default useWallet;
