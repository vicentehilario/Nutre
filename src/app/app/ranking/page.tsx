"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

interface RankItem {
  pos: number;
  nome: string;
  streak: number;
  plano: string;
  is_me: boolean;
}

interface RankingData {
  ranking: RankItem[];
  minha_posicao: number;
  meus_streak: number;
  total_ativos: number;
}

const MEDAL = ["🥇", "🥈", "🥉"];

const planoColor: Record<string, string> = {
  premium:      "#22c55e",
  dieta_treino: "#f97316",
  gratis:       "transparent",
};

export default function RankingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#f0f0f0]" />
          <div className="absolute inset-0 rounded-full border-4 border-[#16a34a] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const top3 = data.ranking.slice(0, 3);
  const resto = data.ranking.slice(3);
  const euEstouNoTop = data.minha_posicao > 0 && data.minha_posicao <= data.ranking.length;
  const semStreak = data.meus_streak === 0;

  return (
    <div className="bg-[#fafafa] min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
        <h1 className="text-2xl font-bold text-[#111] tracking-tight">Ranking de sequências</h1>
        <p className="text-xs text-[#999] mt-1 font-medium">
          {data.total_ativos} {data.total_ativos === 1 ? "pessoa ativa" : "pessoas ativas"} em sequência agora
        </p>
      </div>

      <div className="px-4 pt-4 space-y-3">

        {/* Card da minha posição */}
        {semStreak ? (
          <div className="bg-[#fffbeb] rounded-[20px] border border-[#fde68a] p-5">
            <p className="text-[14px] font-bold text-[#92400e] mb-1">Você ainda não está no ranking</p>
            <p className="text-[13px] text-[#b45309] leading-relaxed">
              Registre sua refeição hoje para começar sua sequência e entrar na disputa. 🔥
            </p>
          </div>
        ) : euEstouNoTop ? (
          <div className="bg-[#111] rounded-[20px] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#888] font-semibold uppercase tracking-widest mb-1">Sua posição</p>
                <p className="text-[32px] font-extrabold text-white leading-none">
                  {data.minha_posicao === 1 ? "🥇 " : data.minha_posicao === 2 ? "🥈 " : data.minha_posicao === 3 ? "🥉 " : ""}
                  {data.minha_posicao}°
                </p>
                <p className="text-[13px] text-[#888] mt-1">entre {data.total_ativos} participantes</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#888] font-semibold uppercase tracking-widest mb-1">Sequência</p>
                <p className="text-[36px] font-extrabold text-[#22c55e] leading-none">{data.meus_streak}</p>
                <p className="text-[13px] text-[#888] mt-1">{data.meus_streak === 1 ? "dia" : "dias"} 🔥</p>
              </div>
            </div>
            {data.minha_posicao > 1 && (
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.07)]">
                <p className="text-[12px] text-[#888]">
                  {data.ranking[data.minha_posicao - 2]
                    ? `Faltam ${data.ranking[data.minha_posicao - 2].streak - data.meus_streak} ${data.ranking[data.minha_posicao - 2].streak - data.meus_streak === 1 ? "dia" : "dias"} para alcançar ${data.ranking[data.minha_posicao - 2].nome} (${data.minha_posicao - 1}° lugar)`
                    : "Continue registrando para subir no ranking!"}
                </p>
              </div>
            )}
            {data.minha_posicao === 1 && (
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.07)]">
                <p className="text-[12px] text-[#22c55e] font-semibold">
                  👑 Você está liderando! Registre hoje para manter a posição.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Pódio top 3 */}
        {top3.length > 0 && (
          <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-5">
            <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-widest mb-4">Pódio</p>
            <div className="flex gap-3">
              {top3.map((item) => (
                <div
                  key={item.pos}
                  className={`flex-1 flex flex-col items-center gap-2 rounded-[16px] p-3 ${item.is_me ? "bg-[#f0fdf4] border-2 border-[#22c55e]" : "bg-[#fafafa] border border-[#f0f0f0]"}`}
                >
                  <span className="text-3xl">{MEDAL[item.pos - 1]}</span>
                  <p className={`text-[13px] font-extrabold text-center leading-tight ${item.is_me ? "text-[#15803d]" : "text-[#111]"}`}>
                    {item.nome}{item.is_me ? " (eu)" : ""}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-base">🔥</span>
                    <span className="text-[13px] font-bold text-[#111]">{item.streak}d</span>
                  </div>
                  {item.plano !== "gratis" && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: planoColor[item.plano] }} title={item.plano} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista geral */}
        {resto.length > 0 && (
          <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
            <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-widest px-5 py-3.5 border-b border-[#f5f5f5]">
              Classificação completa
            </p>
            {resto.map((item, i) => (
              <div
                key={item.pos}
                className={`flex items-center gap-4 px-5 py-3.5 ${i < resto.length - 1 ? "border-b border-[#f9f9f9]" : ""} ${item.is_me ? "bg-[#f0fdf4]" : ""}`}
              >
                <span className="text-[13px] font-bold text-[#aaa] w-6 text-center flex-shrink-0">{item.pos}</span>
                <div className="flex-1 flex items-center gap-2">
                  <p className={`text-[14px] font-bold ${item.is_me ? "text-[#15803d]" : "text-[#111]"}`}>
                    {item.nome}{item.is_me ? " (eu)" : ""}
                  </p>
                  {item.plano !== "gratis" && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: planoColor[item.plano] }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span>🔥</span>
                  <span className="text-[13px] font-bold text-[#111]">{item.streak}</span>
                  <span className="text-[11px] text-[#aaa]">{item.streak === 1 ? "dia" : "dias"}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.ranking.length === 0 && (
          <div className="text-center py-16 text-[#bbb]">
            <p className="text-4xl mb-3">🔥</p>
            <p className="text-[15px] font-bold text-[#333] mb-1">Sem ninguém em sequência ainda</p>
            <p className="text-[13px]">Seja o primeiro a registrar e liderar!</p>
          </div>
        )}

        {/* Legenda */}
        {data.ranking.length > 0 && (
          <div className="flex items-center gap-4 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span className="text-[11px] text-[#aaa]">Premium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f97316]" />
              <span className="text-[11px] text-[#aaa]">Dieta & Treino</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
