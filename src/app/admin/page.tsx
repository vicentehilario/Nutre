"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  nome: string;
  email: string;
  plano: string;
  streak: number;
  fotos_hoje: number;
  ultimo_registro: string | null;
  created_at: string;
  refeicoes_7d: number;
  ativo_hoje: boolean;
}

interface Stats {
  total: number;
  gratis: number;
  premium: number;
  dieta_treino: number;
  pagantes: number;
  taxa_conversao: number;
  ativos_hoje: number;
  ativos_semana: number;
}

const planoLabel: Record<string, string> = {
  gratis: "Grátis",
  premium: "Premium",
  dieta_treino: "Dieta + Treino",
};

const planoBg: Record<string, string> = {
  gratis: "bg-[#f5f5f5] text-[#777]",
  premium: "bg-[#f0fdf4] text-[#16a34a]",
  dieta_treino: "bg-[#fff7ed] text-[#c2410c]",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "gratis" | "premium" | "dieta_treino">("todos");
  const [busca, setBusca] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.status === 403) { router.push("/app"); return; }
    if (!res.ok) { setError("Erro ao carregar dados"); setLoading(false); return; }
    const data = await res.json();
    setUsers(data.users);
    setStats(data.stats);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function doAction(userId: string, action: string, extra?: Record<string, string>) {
    setActionLoading(userId + action);
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, user_id: userId, ...extra }),
    });
    setActionLoading(null);
    load();
  }

  const filtered = users
    .filter((u) => filtro === "todos" || u.plano === filtro)
    .filter((u) =>
      busca === "" ||
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fafafa]">
        <p className="text-[#999] text-sm">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fafafa]">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-white border-b border-[#ebebeb] px-8 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[#111] tracking-tight">Painel Admin — Nutre</h1>
            <p className="text-xs text-[#999] mt-0.5">Visão geral dos usuários e conversões</p>
          </div>
          <button
            onClick={load}
            className="text-xs font-semibold text-[#555] border border-[#e5e5e5] rounded-lg px-3 py-2 bg-white hover:bg-[#fafafa]"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total de usuários" value={stats.total} />
            <StatCard label="Plano Grátis" value={stats.gratis} sub={`${stats.total > 0 ? Math.round((stats.gratis / stats.total) * 100) : 0}% do total`} />
            <StatCard
              label="Pagantes"
              value={stats.pagantes}
              sub={`${stats.premium} Premium · ${stats.dieta_treino} D+T`}
              highlight
            />
            <StatCard
              label="Taxa de conversão"
              value={`${stats.taxa_conversao}%`}
              sub={`${stats.ativos_hoje} ativos hoje · ${stats.ativos_semana} na semana`}
            />
          </div>
        )}

        {/* Conversion bar */}
        {stats && stats.total > 0 && (
          <div className="bg-white rounded-[16px] border border-[#ebebeb] p-5">
            <p className="text-xs font-bold text-[#111] mb-3 uppercase tracking-wide">Distribuição de planos</p>
            <div className="flex rounded-full overflow-hidden h-4">
              <div
                className="bg-[#16a34a] transition-all"
                style={{ width: `${Math.round((stats.premium / stats.total) * 100)}%` }}
                title={`Premium: ${stats.premium}`}
              />
              <div
                className="bg-[#ea580c] transition-all"
                style={{ width: `${Math.round((stats.dieta_treino / stats.total) * 100)}%` }}
                title={`Dieta+Treino: ${stats.dieta_treino}`}
              />
              <div
                className="bg-[#e5e5e5] flex-1"
                title={`Grátis: ${stats.gratis}`}
              />
            </div>
            <div className="flex gap-4 mt-2.5">
              <Legend color="#16a34a" label={`Premium (${stats.premium})`} />
              <Legend color="#ea580c" label={`Dieta + Treino (${stats.dieta_treino})`} />
              <Legend color="#e5e5e5" label={`Grátis (${stats.gratis})`} textColor="#999" />
            </div>
          </div>
        )}

        {/* Filters + search */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-xl p-1">
            {(["todos", "gratis", "premium", "dieta_treino"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filtro === f ? "bg-[#111] text-white" : "text-[#777] hover:text-[#111]"
                }`}
              >
                {f === "todos" ? "Todos" : planoLabel[f]}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 min-w-[220px] bg-white border border-[#ebebeb] rounded-xl px-4 py-2.5 text-sm text-[#111] placeholder-[#bbb] outline-none focus:border-[#ccc]"
          />
          <p className="text-xs text-[#aaa]">{filtered.length} usuário{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[16px] border border-[#ebebeb] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f5f5f5]">
                <th className="text-left px-5 py-3 text-xs font-bold text-[#aaa] uppercase tracking-wide">Usuário</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#aaa] uppercase tracking-wide">Plano</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#aaa] uppercase tracking-wide">Streak</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#aaa] uppercase tracking-wide">Fotos hoje</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#aaa] uppercase tracking-wide">Ref. 7d</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#aaa] uppercase tracking-wide">Último reg.</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-[#aaa] uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={`border-b border-[#f9f9f9] ${i % 2 === 0 ? "" : "bg-[#fdfdfd]"}`}>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#111] text-[13px]">{u.nome}</p>
                    <p className="text-[11px] text-[#aaa]">{u.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={u.plano}
                      disabled={actionLoading === u.id + "update_plan"}
                      onChange={(e) => doAction(u.id, "update_plan", { plano: e.target.value })}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${planoBg[u.plano] ?? "bg-[#f5f5f5] text-[#777]"}`}
                    >
                      <option value="gratis">Grátis</option>
                      <option value="premium">Premium</option>
                      <option value="dieta_treino">Dieta + Treino</option>
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-[13px] font-bold text-[#111]">🔥 {u.streak}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-[13px] font-bold ${u.fotos_hoje > 0 ? "text-[#111]" : "text-[#ccc]"}`}>
                      {u.fotos_hoje}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-[13px] font-bold ${u.refeicoes_7d > 0 ? "text-[#16a34a]" : "text-[#ccc]"}`}>
                      {u.refeicoes_7d}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] text-[#777]">
                      {u.ultimo_registro
                        ? new Date(u.ultimo_registro + "T12:00:00").toLocaleDateString("pt-BR")
                        : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => doAction(u.id, "reset_fotos")}
                      disabled={actionLoading === u.id + "reset_fotos" || u.fotos_hoje === 0}
                      className="text-[11px] font-semibold text-[#ea580c] hover:underline disabled:text-[#ccc] disabled:no-underline"
                    >
                      {actionLoading === u.id + "reset_fotos" ? "..." : "Resetar fotos"}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Excluir ${u.nome} (${u.email})?\n\nTodos os registros serão apagados. Esta ação não pode ser desfeita.`)) {
                          doAction(u.id, "delete_user");
                        }
                      }}
                      disabled={actionLoading === u.id + "delete_user"}
                      className="text-[11px] font-semibold text-[#dc2626] hover:underline disabled:text-[#ccc] disabled:no-underline ml-3"
                    >
                      {actionLoading === u.id + "delete_user" ? "..." : "Excluir"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#bbb] text-sm">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string | number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-[16px] border p-5 ${highlight ? "bg-[#0f2414] border-transparent" : "bg-white border-[#ebebeb]"}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${highlight ? "text-[#6db87a]" : "text-[#aaa]"}`}>{label}</p>
      <p className={`text-3xl font-black tracking-tight ${highlight ? "text-white" : "text-[#111]"}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${highlight ? "text-[#6db87a]" : "text-[#aaa]"}`}>{sub}</p>}
    </div>
  );
}

function Legend({ color, label, textColor }: { color: string; label: string; textColor?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
      <span className="text-xs" style={{ color: textColor ?? "#555" }}>{label}</span>
    </div>
  );
}
