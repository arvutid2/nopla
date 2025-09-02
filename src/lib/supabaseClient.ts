// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/** -- helpers ------------------------------------------------------------- */
function parseQuery() {
  const qs = new URLSearchParams(globalThis.location?.search || "");
  return { tab: qs.get("tab"), uid: qs.get("uid") };
}
function makeUuid() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * Reegel:
 * - ?uid=<uuid>  → kasuta täpselt seda (hea testimiseks)
 * - ?tab=1       → sessionStorage (per-tab ID)
 * - muidu        → localStorage (püsiv külaline)
 */
function resolveUserId(): string {
  const { tab, uid } = parseQuery();

  if (uid) {
    (window as any).userId = uid;
    return uid;
  }

  if (tab === "1") {
    const k = "astra_user_id_tab";
    let v = sessionStorage.getItem(k);
    if (!v) {
      v = makeUuid();
      sessionStorage.setItem(k, v);
    }
    (window as any).userId = v;
    return v;
  }

  const k = "astra_user_id";
  let v = localStorage.getItem(k);
  if (!v) {
    v = makeUuid();
    localStorage.setItem(k, v);
  }
  (window as any).userId = v;
  return v;
}

export const userId = resolveUserId();

/** -- singleton client (vältida HMR kaose) -------------------------------- */
const GLOBAL_KEY = "__ASTRA_SUPABASE_CLIENT__";

let supabaseInst: SupabaseClient;

if ((globalThis as any)[GLOBAL_KEY]) {
  supabaseInst = (globalThis as any)[GLOBAL_KEY] as SupabaseClient;
} else {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.error(
      "[supabaseClient] Missing env vars. Add to .env.local and restart dev:",
      { VITE_SUPABASE_URL: !!url, VITE_SUPABASE_ANON_KEY: !!anon }
    );
  }

  supabaseInst = createClient(url!, anon!, {
    auth: {
      // me ei kasuta GoTrue sessioneid; väldib “Multiple GoTrueClient …”
      persistSession: false,
      autoRefreshToken: false,
      storageKey: "astra_guest",
    },
    global: {
      // RLS poliitikad loevad seda headerit
      headers: { "sb-user-id": userId },
    },
  });

  (globalThis as any)[GLOBAL_KEY] = supabaseInst;
}

export const supabase = supabaseInst;

/** -- debug: kasuta konsoolis window.supabase / window.userId -------------- */
// @ts-ignore
if (typeof window !== "undefined") {
  // @ts-ignore
  window.supabase = supabaseInst;
}
