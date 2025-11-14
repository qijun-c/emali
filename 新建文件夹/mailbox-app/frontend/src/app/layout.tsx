import "../styles/globals.css";
import React from "react";

export const metadata = {
  title: "Nebula Mail",
  description: "A sci‑fi themed infinite mailbox",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen">
        <header className="sticky top-0 z-20 bg-black/40 backdrop-blur border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-primary font-semibold tracking-wide">NEBULA MAIL</div>
            <nav className="text-sm text-white/70">公开临时邮箱 · 科幻风界面</nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-white/10 text-white/50 text-sm py-6 text-center">由 Mailgun 入站驱动 · FastAPI + Next.js</footer>
      </body>
    </html>
  );
}
