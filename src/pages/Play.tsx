import React from "react";

export default function Play() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060b1a] text-white">
      <div className="rounded-2xl border border-white/10 p-8 bg-white/[0.03]">
        <h1 className="text-2xl font-bold mb-2">Game session</h1>
        <p className="text-white/70">
          Opponent connected. (Siia tuleb päris mäng / RPS / jne.)
        </p>
      </div>
    </div>
  );
}