"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Refeicao {
  id: string;
  data: string;
  descricao: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  dentro_do_plano: boolean;
  created_at: string;
}

interface DayEntry {
  data: string;
  refeicoes: Refeicao[];
  totais: { calorias: number; proteinas: number; carboidratos: number; gorduras: number };
}

interface Medias {
  calorias: number;
  proteinas: number;
}

function isoWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return `${d.getUTCFullYear()}-W${String(Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)).padStart(2, "0")}`;
}

function weekLabel(isoW: string) {
  const [year, week] = isoW.split("-W").map(Number);
  const jan4 = new Date(year, 0, 4);
  const dow = jan4.getDay() || 7;
  const start = new Date(jan4);
  start.setDate(jan4.getDate() - dow + 1 + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
  const thisWeek = isoWeek(new Date());
  const lastWeek = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return isoWeek(d); })();
  if (isoW === thisWeek) return "Esta semana";
  if (isoW === lastWeek) return "Semana passada";
  return `${fmt(start)} – ${fmt(end)}`;
}

function dayLabel(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const fmt = date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "");
  if (dateStr === today) return `Hoje, ${fmt}`;
  if (dateStr === yesterday) return `Ontem, ${fmt}`;
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "");
}

export default function Historico() {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<DayEntry[]>([]);
  const [medias, setMedias] = useState<Medias>({ calorias: 0, proteinas: 0 });
  const [meta, setMeta] = useState(2000);
  const [activeTab, setActiveTab] = useState(() => isoWeek(new Date()));
  const [tabs, setTabs] = useState<string[]>([isoWeek(new Date())]);

  const loadData = useCallback(async (semana: string) => {
    setLoading(true);
    const res = await fetch(`/api/refeicoes?semana=${semana}`);
    const json = await res.json();
    setDays(json.days ?? []);
    setMedias(json.medias ?? { calorias: 0, proteinas: 0 });
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }

      // Carrega meta do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("meta_calorica")
        .eq("id", session.user.id)
        .single();
      if (profile?.meta_calorica) setMeta(profile.meta_calorica);

      // Busca semanas disponíveis
      const { data: allDates } = await supabase
        .from("refeicoes")
        .select("data")
        .eq("user_id", session.user.id)
        .order("data", { ascending: false });

      const weeks = new Set<string>([isoWeek(new Date())]);
      for (const r of allDates ?? []) {
        if (r.data) weeks.add(isoWeek(new Date(r.data + "T12:00:00")));
      }
      setTabs(Array.from(weeks));

      await loadData(isoWeek(new Date()));
    }
    init();
  }, [loadData]);

  const handleTab = (tab: string) => {
    setActiveTab(tab);
    loadData(tab);
  };

  const diasNoPlano = days.filter((d) => d.totais.calorias <= meta).length;

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
        <h1 className="text-2xl font-bold text-[#111] tracking-tight">Histórico</h1>
        <p className="text-xs text-[#999] mt-1 font-medium">Refeições e médias por semana</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3.5 overflow-x-auto bg-[#fafafa] no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTab(tab)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
              activeTab === tab
                ? "bg-[#111] text-white border-[#111]"
                : "bg-white text-[#aaa] border-[#ebebeb]"
            }`}
          >
            {weekLabel(tab)}
          </button>
        ))}
      </div>

      {/* Banner médias */}
      <div className="mx-4 bg-[#111] rounded-[20px] p-5">
        <p className="text-[11px] text-[#888] font-semibold uppercase tracking-widest mb-2.5">Média da semana</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[22px] font-extrabold text-white tracking-tight">{medias.calorias.toLocaleString("pt-BR")}</p>
            <p className="text-[11px] text-[#666] font-medium mt-0.5">kcal / dia</p>
          </div>
          <div>
            <p className="text-[22px] font-extrabold text-white tracking-tight">{medias.proteinas}g</p>
            <p className="text-[11px] text-[#666] font-medium mt-0.5">proteína / dia</p>
          </div>
          <div>
            <p className="text-[22px] font-extrabold text-white tracking-tight">{diasNoPlano}/{days.length || 7}</p>
            <p className="text-[11px] text-[#666] font-medium mt-0.5">dias no plano</p>
          </div>
          <div>
            <p className={`text-[22px] font-extrabold tracking-tight ${medias.calorias <= meta ? "text-[#22c55e]" : "text-[#f87171]"}`}>
              {medias.calorias <= meta ? "−" : "+"}{Math.abs(meta - medias.calorias).toLocaleString("pt-BR")}
            </p>
            <p className="text-[11px] text-[#666] font-medium mt-0.5">kcal saldo médio</p>
          </div>
        </div>
      </div>

      {/* Lista de dias */}
      <div className="px-4 pt-3 pb-4 space-y-3">
        {loading && (
          <div className="text-center py-8 text-[#aaa] text-sm">Carregando...</div>
        )}

        {!loading && days.length === 0 && (
          <div className="bg-white rounded-[20px] p-6 border border-[#f0f0f0] text-center">
            <p className="text-2xl mb-2">🥗</p>
            <p className="text-[14px] font-semibold text-[#111] mb-1">Nenhum registro nessa semana</p>
            <p className="text-xs text-[#aaa]">Registre suas refeições na aba Início.</p>
          </div>
        )}

        {!loading && days.map((day) => {
          const saldo = day.totais.calorias - meta;
          const noPlano = day.totais.calorias <= meta;
          const pct = Math.min(100, Math.round((day.totais.calorias / meta) * 100));
          const barColor = pct < 80 ? "#16a34a" : pct < 100 ? "#f59e0b" : "#ef4444";

          return (
            <div key={day.data} className="bg-white rounded-[18px] p-4 border border-[#f0f0f0]">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[13px] font-bold text-[#111]">{dayLabel(day.data)}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${noPlano ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#fff1f2] text-[#e11d48]"}`}>
                  {noPlano ? `−${Math.abs(saldo).toLocaleString("pt-BR")} kcal` : `+${Math.abs(saldo).toLocaleString("pt-BR")} kcal`}
                </span>
              </div>

              <div className="divide-y divide-[#f5f5f5]">
                {day.refeicoes.map((r) => (
                  <div key={r.id} className="flex justify-between items-center py-2">
                    <span className="text-xs text-[#555] font-medium truncate max-w-[200px]">{r.descricao || "Refeição"}</span>
                    <span className="text-xs text-[#aaa] font-semibold ml-2 flex-shrink-0">{r.calorias} kcal</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex-1 bg-[#f0f0f0] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)` }}
                  />
                </div>
                <span className="text-[10px] text-[#bbb] font-semibold whitespace-nowrap">
                  {day.totais.calorias.toLocaleString("pt-BR")} / {meta.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
