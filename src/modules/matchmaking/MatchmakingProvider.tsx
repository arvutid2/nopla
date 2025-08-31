import React, {
  createContext, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { supabase } from "../../lib/supabase";

export type MatchStatus = "idle" | "searching" | "found" | "cancelled" | "timeout" | "error";
export type FindParams = { gameId: string; buyIn: number };

type Ctx = {
  status: MatchStatus;
  queuePos?: number;
  matchId?: string;
  opponentId?: string;
  error?: string;
  findOpponent: (p: FindParams) => Promise<boolean>;
  cancel: () => Promise<void>;
};

const MMContext = createContext<Ctx | null>(null);

function getOrSetClientId() {
  const KEY = "mm_client_id";
  let v = sessionStorage.getItem(KEY);
  if (!v) { v = crypto.randomUUID(); sessionStorage.setItem(KEY, v); }
  return v;
}

export function MatchmakingProvider({ children }: { children: React.ReactNode }) {
  const clientId = useRef<string>(getOrSetClientId());
  const [status, setStatus] = useState<MatchStatus>("idle");
  const [queuePos, setQueuePos] = useState<number>();
  const [matchId, setMatchId] = useState<string>();
  const [opponentId, setOpponentId] = useState<string>();
  const [error, setError] = useState<string>();
  const myQueueId = useRef<string | null>(null);

  const queueChRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const partChRef  = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const posTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      queueChRef.current?.unsubscribe();
      partChRef.current?.unsubscribe();
      if (posTimerRef.current) window.clearInterval(posTimerRef.current);
    };
  }, []);

  const startPositionPolling = (gameId: string, buyIn: number) => {
    if (posTimerRef.current) window.clearInterval(posTimerRef.current);
    posTimerRef.current = window.setInterval(async () => {
      try {
        if (!myQueueId.current) return;
        const { data: me } = await supabase
          .from("queue").select("created_at").eq("id", myQueueId.current).maybeSingle();
        if (!me?.created_at) return;
        const { count } = await supabase
          .from("queue").select("*", { count: "exact", head: true })
          .eq("game_id", gameId).eq("buy_in", buyIn).eq("status", "queued")
          .lt("created_at", me.created_at);
        setQueuePos((count ?? 0) + 1);
      } catch {}
    }, 1000);
  };

  const subscribeToQueueRow = (queueId: string) => {
    queueChRef.current?.unsubscribe();
    const ch = supabase.channel(`mm_queue_${queueId}`);
    ch.on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "queue", filter: `id=eq.${queueId}` },
      async (payload) => {
        const row: any = payload.new;
        if (!row) return;
        if (row.status === "matched" && row.match_id) {
          setMatchId(row.match_id);
          setStatus("found");
          const { data: parts } = await supabase
            .from("match_participants").select("client_id").eq("match_id", row.match_id);
          const opp = (parts || []).find((p) => p.client_id !== clientId.current);
          setOpponentId(opp?.client_id);
        } else if (row.status === "cancelled") {
          setStatus("cancelled");
        }
      });
    ch.subscribe();
    queueChRef.current = ch;
  };

  const subscribeToMyParticipantInserts = () => {
    partChRef.current?.unsubscribe();
    const ch = supabase.channel(`mm_part_${clientId.current}`);
    ch.on("postgres_changes",
      { event: "INSERT", schema: "public", table: "match_participants", filter: `client_id=eq.${clientId.current}` },
      async (payload) => {
        const row: any = payload.new;
        if (!row?.match_id) return;
        setMatchId(row.match_id);
        setStatus("found");
        const { data: parts } = await supabase
          .from("match_participants").select("client_id").eq("match_id", row.match_id);
        const opp = (parts || []).find((p) => p.client_id !== clientId.current);
        setOpponentId(opp?.client_id);
      });
    ch.subscribe();
    partChRef.current = ch;
  };

  const findOpponent = async ({ gameId, buyIn }: FindParams) => {
    try {
      setError(undefined);
      setStatus("searching");
      setQueuePos(undefined);
      setMatchId(undefined);
      setOpponentId(undefined);

      // puhasta võimalik eelmise katse "queued"
      await supabase.from("queue")
        .delete().eq("client_id", clientId.current).eq("status", "queued");

      const { data, error: insErr } = await supabase
        .from("queue")
        .insert({ client_id: clientId.current, game_id: gameId, buy_in: buyIn, status: "queued" })
        .select("id")
        .maybeSingle();

      if (insErr || !data?.id) {
        console.error("QUEUE INSERT ERROR:", insErr?.message, insErr);
        setStatus("error");
        setError(insErr?.message || "Failed to enqueue");
        return false;
      }

      myQueueId.current = data.id as string;
      subscribeToQueueRow(myQueueId.current);
      subscribeToMyParticipantInserts();
      startPositionPolling(gameId, buyIn);
      return true;
    } catch (e: any) {
      console.error("findOpponent error:", e?.message || e, e);
      setStatus("error");
      setError(String(e?.message || e));
      return false;
    }
  };

  const cancel = async () => {
    try {
      if (myQueueId.current) {
        await supabase.from("queue").update({ status: "cancelled" }).eq("id", myQueueId.current);
      }
    } finally {
      setStatus("cancelled");
      queueChRef.current?.unsubscribe();
      partChRef.current?.unsubscribe();
      if (posTimerRef.current) window.clearInterval(posTimerRef.current);
      queueChRef.current = null;
      partChRef.current = null;
      myQueueId.current = null;
      setQueuePos(undefined);
    }
  };

  const value: Ctx = useMemo(() => ({
    status, queuePos, matchId, opponentId, error, findOpponent, cancel,
  }), [status, queuePos, matchId, opponentId, error]);

  return <MMContext.Provider value={value}>{children}</MMContext.Provider>;
}

export function useMatchmaking() {
  const ctx = useContext(MMContext);
  if (!ctx) throw new Error("useMatchmaking must be used inside MatchmakingProvider");
  return ctx;
}