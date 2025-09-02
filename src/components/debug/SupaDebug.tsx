import React, { useState } from "react";
import { supabase, userId } from "../../lib/supabaseClient";

export default function SupaDebug() {
  const [log, setLog] = useState<string>("");

  const add = (msg: any) => setLog((s) => s + (typeof msg === "string" ? msg : JSON.stringify(msg)) + "\n");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Supabase Debug</div>
        <div className="opacity-70 text-xs">userId: {userId}</div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          className="px-3 py-1 rounded border border-white/15 hover:bg-white/10"
          onClick={async () => {
            add("PING: select 1");
            const { data, error } = await supabase.rpc("record_match", {
              p_user_id: userId,
              p_buy_in: 0,
              p_prize: 0,
              p_result: "you_win",
              p_rounds: [],
            });
            if (error) add({ rpc_error: error });
            else add({ rpc_ok: true, data });
          }}
        >
          Test RPC (record_match)
        </button>

        <button
          className="px-3 py-1 rounded border border-white/15 hover:bg-white/10"
          onClick={async () => {
            add("Ensure rows + read stats");
            await supabase.from("profiles").upsert({ id: userId }, { onConflict: "id" });
            await supabase.from("stats").upsert({ user_id: userId }, { onConflict: "user_id" });
            const sel = await supabase.from("stats").select("*").eq("user_id", userId).maybeSingle();
            add(sel);
          }}
        >
          Ensure & Read stats
        </button>
      </div>
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-white/80">{log || "—"}</pre>
    </div>
  );
}