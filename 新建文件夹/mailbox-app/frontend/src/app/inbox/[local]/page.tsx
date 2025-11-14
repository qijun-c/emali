"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { attachmentDownloadUrl, getMessage, listMessages, MessageOut, sendEmail } from "../../../lib/api";
import { useSSE } from "../../../lib/useSSE";
import AddressBadge from "../../../components/AddressBadge";

export default function InboxPage({ params }: { params: { local: string } }) {
  const local = params.local;
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [active, setActive] = useState<MessageOut | null>(null);
  const [sending, setSending] = useState(false);
  const [fromAddr, setFromAddr] = useState("");
  const [toAddr, setToAddr] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");

  const load = useCallback(async () => {
    const rows = await listMessages(local);
    setMessages(rows);
    if (rows.length && !active) setActive(rows[0]);
  }, [local, active]);

  useEffect(() => {
    load();
  }, [load]);

  useSSE(local, (e) => {
    if (e?.type === "new_message") {
      load();
    }
  });

  const onOpen = async (id: number) => {
    const m = await getMessage(id);
    setActive(m);
  };

  const onSend = async () => {
    setSending(true);
    try {
      await sendEmail({ from_address: fromAddr, to: toAddr, subject, text });
      setSubject("");
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        <div className="card flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-white/60 text-sm">你的地址</div>
            <AddressBadge address={`${local}@${typeof window !== 'undefined' ? window.location.host : ''}`} />
          </div>
          <div className="text-white/40 text-xs">实时更新 · 无需刷新</div>
        </div>

        <div className="card grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2 md:col-span-1">
            {messages.map((m) => (
              <div key={m.id}>
                <button className="w-full text-left" onClick={() => onOpen(m.id)}>
                  <div className="">
                    <div className={`p-3 rounded-md border ${active?.id === m.id ? "border-primary/70 bg-primary/5" : "border-white/10 hover:border-white/20"}`}>
                      <div className="text-white/80 text-sm truncate">{m.subject || "(无主题)"}</div>
                      <div className="text-white/50 text-xs mt-1 truncate">{m.from_address}</div>
                      <div className="text-white/40 text-[11px] mt-1">{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
            {!messages.length && <div className="text-white/40 text-sm">暂无邮件，发送一封试试。</div>}
          </div>

          <div className="md:col-span-2 space-y-3">
            {active ? (
              <div className="space-y-3">
                <div className="text-xl font-semibold">{active.subject || "(无主题)"}</div>
                <div className="text-white/60 text-sm">来自：{active.from_address}</div>
                <div className="prose prose-invert max-w-none">
                  {active.html_body ? (
                    <div dangerouslySetInnerHTML={{ __html: active.html_body }} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-white/80">{active.text_body || "(无正文)"}</pre>
                  )}
                </div>
                {active.attachments?.length ? (
                  <div className="space-y-2">
                    <div className="text-white/70 text-sm">附件</div>
                    <div className="flex flex-wrap gap-2">
                      {active.attachments.map((a) => (
                        <a key={a.id} className="btn" href={attachmentDownloadUrl(a.id)}>
                          {a.filename}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-white/50">选择一封邮件查看详情</div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card">
          <div className="font-semibold mb-2">发送测试邮件</div>
          <div className="space-y-2">
            <input className="input" placeholder="From (发件人)" value={fromAddr} onChange={(e) => setFromAddr(e.target.value)} />
            <input className="input" placeholder="To (收件人)" value={toAddr} onChange={(e) => setToAddr(e.target.value)} />
            <input className="input" placeholder="Subject (主题)" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <textarea className="input h-32" placeholder="Text (纯文本内容)" value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn" onClick={onSend} disabled={sending}>{sending ? "发送中..." : "发送"}</button>
            <div className="text-white/40 text-xs">注意：需要在后端配置 Mailgun 才能成功发送。</div>
          </div>
        </div>
      </div>
    </div>
  );
}
