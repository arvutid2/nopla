import React, { useEffect, useRef } from "react";
import { useMatchmaking } from "@modules/matchmaking/MatchmakingProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  prize: number;
  buyIn: number;
  gameId?: string; // vaikimisi "rps"
};

export default function RPSOverlay({
  open,
  onClose,
  prize,
  buyIn,
  gameId = "rps",
}: Props) {
  const { status, queuePos, findOpponent, cancel } = useMatchmaking();
  const startedRef = useRef(false);

  // Alusta matchmakingut, kui overlay avatakse
  useEffect(() => {
    if (!open) {
      startedRef.current = false;
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;
    void findOpponent({ gameId, buyIn });
  }, [open, gameId, buyIn, findOpponent]);

  // Unmount/sulgemisel puhasta (kui veel "searching")
  useEffect(() => {
    return () => {
      if (status === "searching") void cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Auto-sulge, kui matched
  useEffect(() => {
    if (status === "found") onClose();
  }, [status, onClose]);

  const handleClose = async () => {
    if (status === "searching") await cancel();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,20,0.6)" }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1);opacity:1;} 50%{ transform:scale(1.06);opacity:.9;} }
        @keyframes blink { 0%{opacity:.2;} 20%{opacity:1;} 100%{opacity:.2;} }
        .mm-card{ width:min(92vw,520px); background:linear-gradient(135deg,rgba(28,33,58,.8),rgba(18,22,42,.9));
          border:1px solid rgba(255,255,255,.12); border-radius:18px; box-shadow:0 12px 38px rgba(0,0,0,.5);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding:24px; color:white; text-align:center; }
        .mm-title{ font-size:20px; font-weight:800; letter-spacing:.2px; }
        .mm-sub{ opacity:.9; margin-top:6px; font-size:14px; }
        .mm-spinner{ width:58px; height:58px; border-radius:999px; border:4px solid rgba(255,255,255,.18);
          border-top-color:#7dd3fc; margin:0 auto 16px; animation:spin 1s linear infinite; }
        .mm-dots span{ display:inline-block; width:6px; height:6px; border-radius:999px; background:#93c5fd; margin-left:6px; }
        .mm-dots span:nth-child(1){ animation:blink 1s infinite; }
        .mm-dots span:nth-child(2){ animation:blink 1s infinite .2s; }
        .mm-dots span:nth-child(3){ animation:blink 1s infinite .4s; }
        .mm-success{ display:inline-flex; align-items:center; justify-content:center; width:76px; height:76px; border-radius:50%;
          background:linear-gradient(135deg, rgba(34,197,94,0.9), rgba(16,185,129,0.9)); margin:0 auto 16px; animation:pulse 1.4s ease-in-out infinite; }
        .mm-check{ font-size:38px; line-height:1; }
        .mm-row{ display:flex; gap:10px; justify-content:center; margin-top:16px; }
        .mm-pill{ padding:8px 12px; border-radius:999px; border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.04); font-size:12px; }
        .mm-btnrow{ margin-top:18px; display:flex; gap:12px; justify-content:center; }
        .mm-btn{ padding:10px 16px; border-radius:10px; border:1px solid rgba(255,255,255,.28); background:transparent; color:white; cursor:pointer; }
        .mm-btn:hover{ background:rgba(255,255,255,.08); }
      `}</style>

      <div className="mm-card">
        <div className="mm-row">
          <div className="mm-pill">Game: <b className="ml-1">{gameId.toUpperCase()}</b></div>
          <div className="mm-pill">Buy-in: <b className="ml-1">{buyIn}</b></div>
          <div className="mm-pill">Prize: <b className="ml-1">{prize}</b></div>
        </div>

        {status === "searching" && (
          <>
            <div className="mm-spinner" />
            <div className="mm-title">Looking for opponent</div>
            <div className="mm-sub">Matching by region, buy-in & skill</div>
            <div className="mm-sub" style={{ marginTop: 10 }}>
              <span>Searching</span>
              <span className="mm-dots" style={{ marginLeft: 8 }}>
                <span></span><span></span><span></span>
              </span>
            </div>
            <div className="mm-sub" style={{ marginTop: 6 }}>
              Queue position: {typeof queuePos === "number" ? queuePos : "…"}
            </div>
            <div className="mm-btnrow">
              <button className="mm-btn" onClick={handleClose}>Cancel</button>
            </div>
          </>
        )}

        {status === "found" && (
          <>
            <div className="mm-success"><span className="mm-check">✓</span></div>
            <div className="mm-title">Opponent found!</div>
            <div className="mm-sub">Preparing game session…</div>
            <div className="mm-btnrow" style={{ marginTop: 14 }}>
              <button className="mm-btn" onClick={onClose}>Close</button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mm-title" style={{ color: "#fecaca" }}>Connection error</div>
            <div className="mm-btnrow" style={{ marginTop: 14 }}>
              <button className="mm-btn" onClick={handleClose}>Close</button>
            </div>
          </>
        )}

        {status === "cancelled" && (
          <>
            <div className="mm-title">Cancelled</div>
            <div className="mm-btnrow" style={{ marginTop: 14 }}>
              <button className="mm-btn" onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
