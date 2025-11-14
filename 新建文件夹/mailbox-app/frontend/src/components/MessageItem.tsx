import React from "react";
import { MessageOut } from "../lib/api";

export default function MessageItem({ m, active, onClick }: { m: MessageOut; active?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-md border cursor-pointer ${active ? "border-primary/70 bg-primary/5" : "border-white/10 hover:border-white/20"}`}
    >
      <div className="text-white/80 text-sm truncate">{m.subject || "(无主题)"}</div>
      <div className="text-white/50 text-xs mt-1 truncate">{m.from_address}</div>
      <div className="text-white/40 text-[11px] mt-1">{new Date(m.created_at).toLocaleString()}</div>
    </div>
  );
}
