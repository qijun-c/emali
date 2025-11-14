"use client";
import React from "react";

export default function AddressBadge({ address }: { address: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {}
  };
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg neon-border bg-black/30">
      <span className="text-primary font-mono text-sm">{address}</span>
      <button onClick={copy} className="btn !py-1 !px-2 text-xs">复制</button>
    </div>
  );
}
