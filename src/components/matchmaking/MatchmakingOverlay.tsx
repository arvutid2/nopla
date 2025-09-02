import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase, userId } from "../../lib/supabaseClient";

type FoundPayload = {
  mode: "pvp";
  matchId: string;
  role: "host" | "guest";
  opponentId: string;
  opponentName: string;
};

export default function MatchmakingOverlay({
  open,
  onCancel,
  onFound,
  buyIn = 5,
}: {
  open: boolean;
  onCancel: () => void;
  onFound: (p: FoundPayload) => void;
  buyIn?: number;
}) {
  const [status, setStatus] = useState<"idle" | "joining" | "looking" | "found">("idle");
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const queueChannelName = useMemo(() => `queue-${buyIn}`, [buyIn]);

  useEffect(() => {
    if (!open) {
      // cleanup
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setStatus("idle");
      setOpponentName(null);
      return;
    }

    setStatus("joining");
    const ch = supabase.channel(queueChannelName, {
      config: { presence: { key: userId } }
    });

    channelRef.current = ch;

    ch
      .on("presence", { event: "sync" }, () => {
        const state = ch.presenceState();
        const ids = Object.keys(state);
        // Otsime teist mängijat
        if (ids.length >= 2) {
          const others = ids.filter((id) => id !== userId);
          const opponent = others[0];
          setOpponentName(opponent);
          // Rolli otsustame deterministlikult userId alusel
          const both = [userId, opponent].sort();
          const role: "host" | "guest" = both[0] === userId ? "host" : "guest";
          // Host genereerib matchId ja teatab
          if (role === "host") {
            const matchId = crypto.randomUUID();
            ch.send({
              type: "broadcast",
              event: "start",
              payload: { matchId, host: userId, guest: opponent }
            });
            setStatus("found");
            onFound({
              mode: "pvp",
              matchId,
              role,
              opponentId: opponent,
              opponentName: opponent
            });
          }
        } else {
          setStatus("looking");
        }
      })
      .on("broadcast", { event: "start" }, (m) => {
        // Guest saab starti hostilt
        const { matchId, host, guest } = m.payload as any;
        if (guest === userId) {
          setStatus("found");
          onFound({
            mode: "pvp",
            matchId,
            role: "guest",
            opponentId: host,
            opponentName: host
          });
        }
      })
      .subscribe(async (s) => {
        if (s === "SUBSCRIBED") {
          // liitu presencega
          await ch.track({ uid: userId, ts: Date.now() });
          setStatus("looking");
        }
      });

    return () => {
      if (ch) supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [open, queueChannelName, onFound]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70">
      <div className="w-[92%] max-w-md rounded-2xl border border-white/10 bg-[#11162a]/95 p-6 text-center">
        <div className="text-lg font-semibold mb-1">Matchmaking</div>
        {status === "looking" && (
          <div className="text-white/80">Looking for opponent (buy-in {buyIn})…</div>
        )}
        {status === "joining" && (
          <div className="text-white/80">Connecting to queue…</div>
        )}
        {status === "found" && (
          <div className="text-emerald-300 font-semibold">
            Opponent {opponentName ?? ""} found! Starting match…
          </div>
        )}
        <div className="mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
        <p className="text-xs text-white/50 mt-3">
          Queue: <span className="opacity-80">{queueChannelName}</span>
        </p>
      </div>
    </div>
  );
}