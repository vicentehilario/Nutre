"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ⚠️ Troque pelo número do WhatsApp de suporte (somente dígitos, com DDI)
const WHATSAPP_NUMBER = "5528999888498";
const WHATSAPP_MSG = encodeURIComponent("Olá! Preciso de ajuda com o Nutre.");

const tabs = [
  { href: "/app", label: "Início", icon: "🏠" },
  { href: "/app/historico", label: "Histórico", icon: "📊" },
  { href: "/app/metas", label: "Metas", icon: "⚙️" },
  { href: "/app/perfil", label: "Perfil", icon: "👤" },
];

const menuItems = [
  { href: "/app", label: "Início", icon: "🏠", desc: "Resumo do dia" },
  { href: "/app/registrar", label: "Registrar refeição", icon: "📷", desc: "Foto ou descrição" },
  { href: "/app/historico", label: "Histórico", icon: "📊", desc: "Refeições e peso" },
  { href: "/app/metas", label: "Metas", icon: "⚙️", desc: "Calorias e proteína" },
  { href: "/app/momento-critico", label: "Me Salva", icon: "🆘", desc: "Bateu a vontade? Vicente te ajuda" },
  { href: "/app/perfil", label: "Perfil", icon: "👤", desc: "Conta e plano" },
];

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4.5" width="16" height="1.8" rx="0.9" fill="currentColor"/>
      <rect x="2" y="9.1" width="16" height="1.8" rx="0.9" fill="currentColor"/>
      <rect x="2" y="13.7" width="16" height="1.8" rx="0.9" fill="currentColor"/>
    </svg>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-[#fafafa]">
      {/* ─── TOP BAR ─── */}
      <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-30 bg-white border-b border-[#f0f0f0] flex items-center justify-between px-4 h-12">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 flex items-center justify-center text-[#333] active:text-[#16a34a] rounded-full"
          aria-label="Menu"
        >
          <HamburgerIcon />
        </button>
        <div className="flex items-center gap-1.5">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="22" fill="#1a3a20"/>
            <path d="M 18,18 L 31,18 L 68,82 L 82,82 L 82,18 L 69,18 L 32,82 L 18,82 Z" fill="white"/>
          </svg>
          <span className="text-[15px] font-extrabold text-[#1a3a20] tracking-tight">Nutre</span>
        </div>
        <div className="w-9" />
      </div>

      <main className="flex-1 overflow-y-auto pt-12 pb-20">{children}</main>

      {/* ─── BOTTOM NAV ─── */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-[#f0f0f0] z-30">
        <div className="flex pb-safe">
          {tabs.map((tab) => {
            const active = pathname === tab.href || (tab.href !== "/app" && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center py-3 gap-1 text-[10px] font-semibold tracking-wide transition ${
                  active ? "text-[#16a34a]" : "text-[#bbb]"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ─── SIDE DRAWER OVERLAY ─── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          onClick={() => setDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Drawer panel — abre pela ESQUERDA */}
          <div
            className="relative mr-auto w-[80%] max-w-[320px] h-full bg-white flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 pt-12 pb-5 bg-[#1a3a20]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-extrabold text-lg tracking-tight">Nutre</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-white/60 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto py-3 px-3">
              {menuItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3.5 rounded-[14px] mb-1 transition ${
                      active
                        ? "bg-[#f0fdf4] text-[#16a34a]"
                        : "text-[#333] hover:bg-[#f9f9f9]"
                    }`}
                  >
                    <span className="text-xl w-8 text-center">{item.icon}</span>
                    <div>
                      <p className={`text-[14px] font-bold ${active ? "text-[#16a34a]" : "text-[#111]"}`}>
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[#aaa]">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Suporte */}
            <div className="px-4 pb-10 pt-3 border-t border-[#f0f0f0]">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-[14px] bg-[#f0fdf4] border border-[#bbf7d0]"
              >
                <span className="text-xl">💬</span>
                <div>
                  <p className="text-[14px] font-bold text-[#16a34a]">Falar com suporte</p>
                  <p className="text-[11px] text-[#86efac]">WhatsApp · resposta rápida</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
