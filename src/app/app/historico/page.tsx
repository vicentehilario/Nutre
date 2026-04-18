"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";

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
  foto_url?: string | null;
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

interface EditState {
  id: string;
  descricao: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
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

/* ── Mini gráfico de barras SVG ── */
/* ── Gráfico de linha de peso ── */
interface PesoEntry { id: string; peso: number; data: string }

function WeightChart({ entries }: { entries: PesoEntry[] }) {
  if (entries.length < 2) return null;

  const W = 320;
  const H = 80;
  const pesos = entries.map((e) => e.peso);
  const minP = Math.min(...pesos);
  const maxP = Math.max(...pesos);
  const range = maxP - minP || 1;
  const pad = 6;

  const points = entries.map((e, i) => {
    const x = pad + (i / (entries.length - 1)) * (W - pad * 2);
    const y = H - pad - ((e.peso - minP) / range) * (H - pad * 2);
    return { x, y, peso: e.peso, data: e.data };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} width="100%" style={{ overflow: "visible" }}>
      <polyline points={points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinejoin="round" />
      <path d={pathD} fill="none" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill="#16a34a" />
          {(i === 0 || i === points.length - 1 || entries.length <= 8) && (
            <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="8" fill="#16a34a" fontWeight="700">
              {p.peso}
            </text>
          )}
        </g>
      ))}
      <text x={pad} y={H + 14} fontSize="8" fill="#bbb">{new Date(points[0].data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")}</text>
      <text x={W - pad} y={H + 14} fontSize="8" fill="#bbb" textAnchor="end">{new Date(points[points.length - 1].data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")}</text>
    </svg>
  );
}

function BarChart({ days, meta }: { days: DayEntry[]; meta: number }) {
  // Pega os últimos 7 dias disponíveis (ou preenche com zeros)
  const today = new Date();
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d));
  }

  const dataByDate: Record<string, number> = {};
  for (const day of days) dataByDate[day.data] = day.totais.calorias;
  const values = labels.map((l) => dataByDate[l] ?? 0);
  const maxVal = Math.max(meta * 1.3, ...values);

  const W = 320;
  const H = 90;
  const barW = 32;
  const gap = (W - barW * 7) / 6;
  const shortDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-5">
      <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-widest mb-4">Últimos 7 dias</p>
      <svg viewBox={`0 0 ${W} ${H + 24}`} width="100%" style={{ overflow: "visible" }}>
        {/* Linha de meta */}
        <line
          x1={0} y1={H - (meta / maxVal) * H}
          x2={W} y2={H - (meta / maxVal) * H}
          stroke="#16a34a" strokeWidth="1" strokeDasharray="4 3" opacity="0.4"
        />
        {values.map((v, i) => {
          const x = i * (barW + gap);
          const barH = maxVal > 0 ? Math.max(3, (v / maxVal) * H) : 3;
          const y = H - barH;
          const color = v === 0 ? "#f0f0f0" : v <= meta ? "#16a34a" : "#ef4444";
          const dayIdx = new Date(labels[i] + "T12:00:00").getDay();
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={6} fill={color} opacity={v === 0 ? 1 : 0.85} />
              {v > 0 && (
                <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="8" fill={color} fontWeight="700">
                  {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                </text>
              )}
              <text x={x + barW / 2} y={H + 16} textAnchor="middle" fontSize="9" fill="#bbb" fontWeight="600">
                {shortDays[dayIdx]}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-3 h-px bg-[#16a34a] opacity-40" style={{ borderTop: "1px dashed #16a34a" }} />
        <p className="text-[10px] text-[#aaa]">Meta: {meta.toLocaleString("pt-BR")} kcal</p>
      </div>
    </div>
  );
}

export default function Historico() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<DayEntry[]>([]);
  const [medias, setMedias] = useState<Medias>({ calorias: 0, proteinas: 0 });
  const [mediasAnterior, setMediasAnterior] = useState<Medias | null>(null);
  const [meta, setMeta] = useState(2000);
  const [activeTab, setActiveTab] = useState(() => isoWeek(new Date()));
  const [tabs, setTabs] = useState<string[]>([isoWeek(new Date())]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [weightEntries, setWeightEntries] = useState<PesoEntry[]>([]);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  const loadData = useCallback(async (semana: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/refeicoes?semana=${semana}`);
      const json = await res.json();
      setDays(json.days ?? []);
      setMedias(json.medias ?? { calorias: 0, proteinas: 0 });
    } catch {
      setDays([]);
    }
    setLoading(false);
  }, []);

  const loadMediasAnterior = useCallback(async () => {
    const lastWeek = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return isoWeek(d); })();
    try {
      const res = await fetch(`/api/refeicoes?semana=${lastWeek}`);
      const json = await res.json();
      setMediasAnterior(json.medias ?? null);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { window.location.href = "/login"; return; }
    const userId = user.id;

    async function init() {
      const supabase = createClient();
      const { data: profile } = await supabase.from("profiles").select("meta_calorica").eq("id", userId).single();
      if (profile?.meta_calorica) setMeta(profile.meta_calorica);

      const { data: allDates } = await supabase.from("refeicoes").select("data").eq("user_id", userId).order("data", { ascending: false });
      const weeks = new Set<string>([isoWeek(new Date())]);
      for (const r of allDates ?? []) {
        if (r.data) weeks.add(isoWeek(new Date(r.data + "T12:00:00")));
      }
      setTabs(Array.from(weeks));

      await Promise.all([
        loadData(isoWeek(new Date())),
        loadMediasAnterior(),
      ]);

      // Carrega histórico de peso
      fetch("/api/peso")
        .then((r) => r.json())
        .then((d) => { if (d.registros) setWeightEntries(d.registros); })
        .catch(() => {});
    }
    init();
  }, [user, authLoading, loadData, loadMediasAnterior]);

  const handleTab = (tab: string) => {
    setActiveTab(tab);
    setExpandedDay(null);
    loadData(tab);
  };

  async function handleDelete(refeicaoId: string) {
    if (!confirm("Remover este registro?")) return;
    setDeletingId(refeicaoId);
    const supabase = createClient();
    await supabase.from("refeicoes").delete().eq("id", refeicaoId);
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        refeicoes: day.refeicoes.filter((r) => r.id !== refeicaoId),
        totais: day.refeicoes
          .filter((r) => r.id !== refeicaoId)
          .reduce((acc, r) => ({
            calorias: acc.calorias + r.calorias,
            proteinas: acc.proteinas + r.proteinas,
            carboidratos: acc.carboidratos + r.carboidratos,
            gorduras: acc.gorduras + r.gorduras,
          }), { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }),
      })).filter((day) => day.refeicoes.length > 0)
    );
    setDeletingId(null);
  }

  async function handleSaveWeight() {
    const pesoNum = parseFloat(newWeight.replace(",", "."));
    if (!pesoNum || pesoNum <= 0 || pesoNum > 500) return;
    setSavingWeight(true);
    const res = await fetch("/api/peso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ peso: pesoNum }),
    });
    if (res.ok) {
      const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
      setWeightEntries((prev) => {
        const sem = prev.filter((e) => e.data !== hoje);
        return [...sem, { id: Date.now().toString(), peso: pesoNum, data: hoje }].sort((a, b) => a.data.localeCompare(b.data));
      });
      setNewWeight("");
      setShowWeightInput(false);
    }
    setSavingWeight(false);
  }

  async function handleSaveEdit() {
    if (!editState) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("refeicoes").update({
      descricao: editState.descricao,
      calorias: editState.calorias,
      proteinas: editState.proteinas,
      carboidratos: editState.carboidratos,
      gorduras: editState.gorduras,
    }).eq("id", editState.id);

    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        refeicoes: day.refeicoes.map((r) => r.id === editState.id ? { ...r, ...editState } : r),
        totais: day.refeicoes.map((r) => r.id === editState.id ? { ...r, ...editState } : r).reduce(
          (acc, r) => ({ calorias: acc.calorias + r.calorias, proteinas: acc.proteinas + r.proteinas, carboidratos: acc.carboidratos + r.carboidratos, gorduras: acc.gorduras + r.gorduras }),
          { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
        ),
      }))
    );
    setSaving(false);
    setEditState(null);
  }

  const isCurrentWeek = activeTab === isoWeek(new Date());
  const diasNoPlano = days.filter((d) => d.totais.calorias <= meta).length;

  const diffCal = mediasAnterior ? medias.calorias - mediasAnterior.calorias : null;
  const diffProt = mediasAnterior ? medias.proteinas - mediasAnterior.proteinas : null;

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* Modal edição */}
      {editState && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setEditState(null)}>
          <div className="bg-white w-full max-w-md rounded-t-[28px] p-6 pb-10 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#e0e0e0] rounded-full mx-auto" />
            <p className="text-[17px] font-bold text-[#111]">Editar registro</p>

            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wide mb-1">Descrição</p>
                <input
                  value={editState.descricao}
                  onChange={(e) => setEditState((s) => s ? { ...s, descricao: e.target.value } : s)}
                  className="w-full border border-[#e5e5e5] rounded-[12px] px-4 py-2.5 text-[14px] text-[#111] focus:outline-none focus:border-[#16a34a]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["calorias", "proteinas", "carboidratos", "gorduras"] as const).map((field) => (
                  <div key={field}>
                    <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wide mb-1">
                      {field === "calorias" ? "Calorias (kcal)" : field === "proteinas" ? "Proteínas (g)" : field === "carboidratos" ? "Carboidratos (g)" : "Gorduras (g)"}
                    </p>
                    <input
                      type="number"
                      value={editState[field]}
                      onChange={(e) => setEditState((s) => s ? { ...s, [field]: Number(e.target.value) } : s)}
                      className="w-full border border-[#e5e5e5] rounded-[12px] px-3 py-2.5 text-[14px] font-bold text-[#111] focus:outline-none focus:border-[#16a34a]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditState(null)} className="flex-1 border border-[#e5e5e5] text-[#555] rounded-[12px] py-3 text-[13px] font-semibold">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 bg-[#16a34a] text-white rounded-[12px] py-3 text-[13px] font-bold disabled:opacity-60">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
        <h1 className="text-2xl font-bold text-[#111] tracking-tight">Histórico</h1>
        <p className="text-xs text-[#999] mt-1 font-medium">Refeições e médias por semana</p>
      </div>

      {/* Tabs semanas */}
      <div className="flex gap-2 px-4 py-3.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => handleTab(tab)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
              activeTab === tab ? "bg-[#111] text-white border-[#111]" : "bg-white text-[#aaa] border-[#ebebeb]"
            }`}>
            {weekLabel(tab)}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3 pb-8">
        {/* Gráfico 7 dias — só na semana atual */}
        {isCurrentWeek && !loading && <BarChart days={days} meta={meta} />}

        {/* Banner médias + comparativo */}
        <div className="bg-[#111] rounded-[20px] p-5">
          <p className="text-[11px] text-[#888] font-semibold uppercase tracking-widest mb-3">Média da semana</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[22px] font-extrabold text-white tracking-tight">{medias.calorias.toLocaleString("pt-BR")}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[11px] text-[#666]">kcal / dia</p>
                {diffCal !== null && isCurrentWeek && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${diffCal <= 0 ? "bg-[rgba(34,197,94,0.2)] text-[#22c55e]" : "bg-[rgba(248,113,113,0.2)] text-[#f87171]"}`}>
                    {diffCal > 0 ? "+" : ""}{diffCal.toFixed(0)}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-white tracking-tight">{medias.proteinas}g</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[11px] text-[#666]">proteína / dia</p>
                {diffProt !== null && isCurrentWeek && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${diffProt >= 0 ? "bg-[rgba(34,197,94,0.2)] text-[#22c55e]" : "bg-[rgba(248,113,113,0.2)] text-[#f87171]"}`}>
                    {diffProt > 0 ? "+" : ""}{diffProt.toFixed(0)}g
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-white tracking-tight">{diasNoPlano}/{days.length || 7}</p>
              <p className="text-[11px] text-[#666] mt-0.5">dias no plano</p>
            </div>
            <div>
              <p className={`text-[22px] font-extrabold tracking-tight ${medias.calorias <= meta ? "text-[#22c55e]" : "text-[#f87171]"}`}>
                {medias.calorias <= meta ? "−" : "+"}{Math.abs(meta - medias.calorias).toLocaleString("pt-BR")}
              </p>
              <p className="text-[11px] text-[#666] mt-0.5">kcal saldo médio</p>
            </div>
          </div>
          {isCurrentWeek && mediasAnterior && mediasAnterior.calorias > 0 && (
            <div className="mt-3 pt-3 border-t border-[#222]">
              <p className="text-[10px] text-[#555] font-semibold uppercase tracking-widest">vs semana passada</p>
              <p className="text-[11px] text-[#666] mt-1">
                {diffCal! <= 0
                  ? `Você consumiu ${Math.abs(diffCal!).toFixed(0)} kcal a menos por dia`
                  : `Você consumiu ${diffCal!.toFixed(0)} kcal a mais por dia`}
                {" · "}
                {diffProt! >= 0
                  ? `+${diffProt!.toFixed(0)}g proteína`
                  : `${diffProt!.toFixed(0)}g proteína`}
              </p>
            </div>
          )}
        </div>

        {/* Lista de dias */}
        {loading && <div className="text-center py-8 text-[#aaa] text-sm">Carregando...</div>}

        {!loading && days.length === 0 && (
          <div className="bg-white rounded-[20px] p-8 border border-[#f0f0f0] text-center">
            <span className="text-4xl block mb-3">🥗</span>
            <p className="text-[15px] font-bold text-[#111] mb-1">Nenhum registro nessa semana</p>
            <p className="text-xs text-[#aaa] leading-relaxed">Registre suas refeições na aba Início para ver o histórico aqui.</p>
          </div>
        )}

        {!loading && days.map((day) => {
          const saldo = day.totais.calorias - meta;
          const noPlano = day.totais.calorias <= meta;
          const pct = Math.min(100, Math.round((day.totais.calorias / meta) * 100));
          const barColor = pct < 80 ? "#16a34a" : pct < 100 ? "#f59e0b" : "#ef4444";
          const expanded = expandedDay === day.data;

          return (
            <div key={day.data} className="bg-white rounded-[18px] border border-[#f0f0f0] overflow-hidden">
              {/* Cabeçalho do dia — clicável para expandir */}
              <button
                className="w-full text-left px-4 pt-4 pb-3"
                onClick={() => setExpandedDay(expanded ? null : day.data)}
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[13px] font-bold text-[#111]">{dayLabel(day.data)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${noPlano ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#fff1f2] text-[#e11d48]"}`}>
                      {noPlano ? `−${Math.abs(saldo).toLocaleString("pt-BR")}` : `+${Math.abs(saldo).toLocaleString("pt-BR")}`} kcal
                    </span>
                    <span className="text-[#ccc] text-sm">{expanded ? "▲" : "▼"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#f0f0f0] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <span className="text-[10px] text-[#bbb] font-semibold whitespace-nowrap">
                    {day.totais.calorias.toLocaleString("pt-BR")} / {meta.toLocaleString("pt-BR")} kcal
                  </span>
                </div>
              </button>

              {/* Refeições expandidas */}
              {expanded && (
                <div className="border-t border-[#f5f5f5]">
                  {/* Totais de macro do dia */}
                  <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-[#fafafa]">
                    {[
                      { label: "Proteínas", value: `${day.totais.proteinas}g` },
                      { label: "Carbos", value: `${day.totais.carboidratos}g` },
                      { label: "Gorduras", value: `${day.totais.gorduras}g` },
                    ].map((m) => (
                      <div key={m.label} className="text-center">
                        <p className="text-[13px] font-bold text-[#111]">{m.value}</p>
                        <p className="text-[10px] text-[#aaa] font-semibold">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Lista de refeições */}
                  <div className="divide-y divide-[#f5f5f5]">
                    {day.refeicoes.map((r) => (
                      <div key={r.id} className="flex items-start px-4 py-3 gap-3">
                        {r.foto_url && (
                          <img src={r.foto_url} alt="refeição" className="w-12 h-12 rounded-[10px] object-cover flex-shrink-0 border border-[#f0f0f0] mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#111] truncate">{r.descricao || "Refeição"}</p>
                          <p className="text-[11px] text-[#aaa] mt-0.5">
                            {r.calorias} kcal · {r.proteinas}g prot · {r.carboidratos}g carbo · {r.gorduras}g gord
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setEditState({ id: r.id, descricao: r.descricao, calorias: r.calorias, proteinas: r.proteinas, carboidratos: r.carboidratos, gorduras: r.gorduras })}
                            className="w-7 h-7 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[12px]"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            disabled={deletingId === r.id}
                            className="w-7 h-7 rounded-full bg-[#fff5f5] flex items-center justify-center text-[12px] disabled:opacity-50"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Seção de peso */}
        <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden mt-1">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#111]">Evolução do peso</p>
              {weightEntries.length > 0 && (
                <p className="text-[11px] text-[#aaa] mt-0.5">
                  Último: {weightEntries[weightEntries.length - 1].peso} kg
                </p>
              )}
            </div>
            <button
              onClick={() => setShowWeightInput((v) => !v)}
              className="bg-[#f0fdf4] text-[#16a34a] text-[12px] font-bold px-3 py-1.5 rounded-full border border-[#bbf7d0]"
            >
              {showWeightInput ? "Cancelar" : "+ Registrar"}
            </button>
          </div>

          {showWeightInput && (
            <div className="px-5 pb-4 flex gap-2">
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Ex: 75.4"
                className="flex-1 border border-[#e5e5e5] rounded-[12px] px-3 py-2.5 text-[15px] font-bold text-[#111] focus:outline-none focus:border-[#16a34a]"
              />
              <span className="flex items-center text-[13px] text-[#aaa] font-semibold">kg</span>
              <button
                onClick={handleSaveWeight}
                disabled={savingWeight || !newWeight}
                className="bg-[#16a34a] text-white px-4 py-2.5 rounded-[12px] text-[13px] font-bold disabled:opacity-50"
              >
                {savingWeight ? "..." : "Salvar"}
              </button>
            </div>
          )}

          {weightEntries.length >= 2 ? (
            <div className="px-5 pb-4">
              <WeightChart entries={weightEntries} />
            </div>
          ) : weightEntries.length === 0 ? (
            <div className="px-5 pb-5 text-center">
              <p className="text-[12px] text-[#aaa]">Registre seu peso diariamente para ver a evolução.</p>
            </div>
          ) : (
            <div className="px-5 pb-4 text-center">
              <p className="text-[12px] text-[#aaa]">Registre pelo menos 2 dias para ver o gráfico.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
