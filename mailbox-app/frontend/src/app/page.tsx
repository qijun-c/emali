"use client";
import React, { useMemo, useState } from "react";
import { generateAddress, getInfo } from "../lib/api";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AddressBadge from "../components/AddressBadge";

export default function HomePage() {
  const [info, setInfo] = useState<{ public_domain: string; base_url: string } | null>(null);
  const [addr, setAddr] = useState<{ address: string; local: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getInfo().then(setInfo).catch(() => {});
  }, []);

  const onGen = async () => {
    setLoading(true);
    try {
      const r = await generateAddress();
      setAddr(r);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="card">
        <h1 className="text-2xl font-semibold">Nebula Mail</h1>
        <p className="text-white/70 mt-2 text-sm">公开临时邮箱 · 即时接收与查看邮件 · 一键生成随机地址</p>
        <div className="mt-5 flex items-center gap-4">
          <button className="btn" onClick={onGen} disabled={loading}>{loading ? "生成中..." : "生成随机地址"}</button>
          {addr && <AddressBadge address={addr.address} />}
          {addr && (
            <button className="btn" onClick={() => router.push(`/inbox/${addr.local}`)}>进入收件箱</button>
          )}
        </div>
        {info && (
          <div className="text-white/40 text-xs mt-4">当前域名：{info.public_domain}</div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-2">如何使用</h2>
          <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
            <li>点击“生成随机地址”。</li>
            <li>复制地址，在任意网站/服务中作为邮箱使用。</li>
            <li>进入收件箱，实时查看邮件与附件。</li>
          </ol>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-2">注意</h2>
          <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
            <li>公开临时邮箱，谨慎使用重要账号。</li>
            <li>发送功能需正确配置 Mailgun 域名与权限。</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
