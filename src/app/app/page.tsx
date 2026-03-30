"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  nome: string;
  streak: number;
  fotos_hoje: number;
  plano: string;
  meta_calorica: number;
}

interface DailySummary {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  count: number;
}

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia,";
  if (h < 18) return "Boa tarde,";
  return "Boa noite,";
}

export default function AppHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [daily, setDaily] = useState<DailySummary>({ calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }

      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

      const [profileRes, refeicoesRes] = await Promise.all([
        supabase.from("profiles").select("nome, streak, fotos_hoje, plano, meta_calorica").eq("id", session.user.id).single(),
        supabase.from("refeicoes").select("calorias, proteinas, carboidratos, gorduras").eq("user_id", session.user.id).eq("data", today),
      ]);

      setProfile(profileRes.data);

      if (refeicoesRes.data && refeicoesRes.data.length > 0) {
        const sum = refeicoesRes.data.reduce<DailySummary>(
          (acc, r) => ({
            calorias: acc.calorias + (r.calorias ?? 0),
            proteinas: acc.proteinas + (r.proteinas ?? 0),
            carboidratos: acc.carboidratos + (r.carboidratos ?? 0),
            gorduras: acc.gorduras + (r.gorduras ?? 0),
            count: acc.count + 1,
          }),
          { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, count: 0 }
        );
        setDaily(sum);
      }

      setLoading(false);
    }
    load();
  }, []);

  const meta = profile?.meta_calorica ?? 2000;
  const pct = Math.min(100, Math.round((daily.calorias / meta) * 100));
  const restantes = Math.max(0, meta - daily.calorias);
  const acima = daily.calorias > meta;

  const limitefotos = profile?.plano === "gratis" ? 2 : 999;
  const fotosRestantes = Math.max(0, limitefotos - (profile?.fotos_hoje ?? 0));

  const barColor = pct < 80 ? "#16a34a" : pct < 100 ? "#f59e0b" : "#ef4444";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#999] text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
        <p className="text-xs text-[#999] font-medium">{saudacao()}</p>
        <h1 className="text-2xl font-bold text-[#111] tracking-tight mt-0.5">
          {profile?.nome?.split(" ")[0] ?? "bem-vindo"} 👋
        </h1>
        <p className="text-xs text-[#22c55e] font-semibold mt-1">
          🔥 {profile?.streak ?? 0} {profile?.streak === 1 ? "dia" : "dias"} de consistência
        </p>
      </div>

      <div className="px-4 pt-4 space-y-3">

        {/* Card saldo do dia */}
        <div className="bg-white rounded-[20px] p-5 border border-[#f0f0f0]">
          <div className="flex justify-between items-center mb-3.5">
            <span className="text-[13px] font-bold text-[#111]">Saldo de hoje</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${acima ? "bg-[#fff1f2] text-[#e11d48]" : "bg-[#f0fdf4] text-[#16a34a]"}`}>
              {acima ? "Acima da meta" : daily.calorias === 0 ? "Sem registros" : "✓ No plano"}
            </span>
          </div>

          <div className="flex items-baseline gap-1 mb-2.5">
            <span className="text-[32px] font-extrabold text-[#111] tracking-tight">
              {daily.calorias.toLocaleString("pt-BR")}
            </span>
            <span className="text-[16px] text-[#ccc]">/</span>
            <span className="text-[16px] font-semibold text-[#999]">{meta.toLocaleString("pt-BR")}</span>
            <span className="text-xs text-[#aaa] font-medium ml-1">kcal</span>
          </div>

          <div className="bg-[#f0f0f0] rounded-full h-1.5 mb-3">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "PROTEÍNA", value: `${daily.proteinas}g` },
              { label: "CARBO", value: `${daily.carboidratos}g` },
              { label: "GORDURA", value: `${daily.gorduras}g` },
            ].map((m) => (
              <div key={m.label} className="bg-[#fafafa] rounded-xl py-2.5 text-center">
                <p className="text-[15px] font-bold text-[#111]">{m.value}</p>
                <p className="text-[10px] text-[#aaa] font-semibold tracking-wide mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card registrar */}
        <div className="bg-white rounded-[20px] p-5 border border-[#f0f0f0]">
          <p className="text-[13px] font-bold text-[#111] mb-1">Registrar refeição</p>
          <p className="text-xs text-[#aaa] mb-3.5">
            {daily.count} {daily.count === 1 ? "registro" : "registros"} hoje
            {restantes > 0 && ` · ${restantes.toLocaleString("pt-BR")} kcal restantes`}
          </p>
          <Link
            href={fotosRestantes === 0 ? "/app/perfil" : "/app/registrar"}
            className={`block w-full py-3.5 rounded-[14px] text-center text-[13px] font-bold transition ${
              fotosRestantes === 0
                ? "bg-[#f5f5f5] text-[#aaa]"
                : "bg-[#16a34a] text-white"
            }`}
          >
            {fotosRestantes === 0 ? "Limite atingido — fazer upgrade" : "📷 Tirar foto da refeição"}
          </Link>
        </div>

        {/* Card socorro */}
        <div className="bg-[#fff7ed] rounded-[20px] p-5 border border-[#fed7aa]">
          <p className="text-[13px] font-bold text-[#c2410c] mb-1">Bateu aquela vontade?</p>
          <p className="text-xs text-[#ea580c] opacity-80 mb-3.5">
            Me conta o que você quer comer — vamos resolver sem culpa.
          </p>
          <Link
            href="/app/momento-critico"
            className="block w-full py-3.5 rounded-[14px] text-center text-[13px] font-bold bg-[#ea580c] text-white transition"
          >
            🆘 Preciso de ajuda agora
          </Link>
        </div>

      </div>
    </div>
  );
}
