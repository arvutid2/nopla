import React, { useState } from "react";

export default function AuthProbe() {
  const [out, setOut] = useState<string>("");

  const run = async () => {
    try {
      const url = (import.meta as any).env?.VITE_SUPABASE_URL;
      const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

      setOut(
        `ENV:\n  VITE_SUPABASE_URL=${url}\n  VITE_SUPABASE_ANON_KEY set=${!!key}\n\nPing: GET /rest/v1/profiles?select=id&limit=1`
      );

      if (!url || !key) {
        setOut((s) => s + `\n\n❌ ENV puudub — .env.local ei ole laetud (restart dev!).`);
        return;
      }

      const resp = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          // RLS jaoks pole GET-il vaja sb-user-id, aga lisame selguse mõttes
          "sb-user-id": (window as any).userId || "debug-no-user",
        },
      });

      const text = await resp.text();
      setOut(
        (s) =>
          s +
          `\n\nResult:\n  status=${resp.status}\n  apikey-present=${!!key}\n  body=${text.slice(0, 300)}`
      );
    } catch (e: any) {
      setOut((s) => s + `\n\nERROR: ${e?.message || e}`);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Auth Probe</div>
        <button
          onClick={run}
          className="px-3 py-1 rounded border border-white/15 hover:bg-white/10"
        >
          Test REST auth
        </button>
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap">
        {out || "—"}
      </pre>
    </div>
  );
}
