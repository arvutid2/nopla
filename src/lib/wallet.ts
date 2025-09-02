// src/lib/wallet.ts
// Minimal wallet adapter: mock nüüd; Pi Browseris kasutab Pi SDK-d.
// UI-d ei muuda. Kasuta named või default importi.

export type WalletInfo = { id: string; username?: string; provider: "mock" | "pi" };
type Listener = (w: WalletInfo | null) => void;

const LS_KEY = "wallet.current";
const VERIFY_URL = (import.meta as any).env?.VITE_PI_VERIFY_URL || ""; // valikuline serveri verify

function load(): WalletInfo | null {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch { return null; }
}
function save(w: WalletInfo | null) {
  if (!w) localStorage.removeItem(LS_KEY);
  else localStorage.setItem(LS_KEY, JSON.stringify(w));
}

class BaseProvider {
  protected listeners = new Set<Listener>();
  get current(): WalletInfo | null { return load(); }
  isConnected() { return !!this.current; }
  getId() { return this.current?.id ?? null; }
  getUsername() { return this.current?.username ?? null; }
  onChange(fn: Listener) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  protected emit() { const w = this.current; this.listeners.forEach(fn => fn(w)); }
}

class MockWalletProvider extends BaseProvider {
  async connect() {
    const existing = this.current;
    const id = existing?.id ?? `mock_${crypto.randomUUID().slice(0,8)}`;
    const username = existing?.username ?? `MockUser-${id.slice(-4)}`;
    const w: WalletInfo = { id, username, provider: "mock" };
    save(w); this.emit(); return w;
  }
  async disconnect() { save(null); this.emit(); }
}

class PiWalletProvider extends BaseProvider {
  async connect() {
    const Pi = (window as any).Pi;
    if (!Pi) throw new Error("Pi SDK not found. Open in Pi Browser.");
    try { Pi.init({ version: "2.0" }); } catch {}

    // ainult identiteet testimiseks (payments scope’i pole vaja)
    const scopes = ["username"];
    const auth = await Pi.authenticate(scopes, (_p:any)=>{});
    const accessToken: string | undefined = auth?.accessToken;
    const sdkUser = auth?.user;

    // Sandboxi jaoks piisab SDK tagastusest:
    let uid = sdkUser?.uid as string | undefined;
    let username = (sdkUser as any)?.username as string | undefined;

    // Kui sead panusena serveri verify (Edge Function /v2/me), proovime seda—kuid see POLE kohustuslik:
    if (VERIFY_URL && accessToken) {
      try {
        const res = await fetch(VERIFY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });
        if (res.ok) {
          const j = await res.json();
          uid = j.uid || uid;
          username = j.username || username;
        }
      } catch { /* ignore, sandboxis jätkub SDK kasutajast */ }
    }

    if (!uid) throw new Error("Pi user uid not available");
    const w: WalletInfo = { id: uid, username, provider: "pi" };
    save(w); this.emit(); return w;
  }
  async disconnect() { save(null); this.emit(); }
}

export const wallet = (typeof window !== "undefined" && (window as any).Pi)
  ? new PiWalletProvider()
  : new MockWalletProvider();

export default wallet;
