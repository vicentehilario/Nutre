"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";

const CALORIAS_SUGERIDAS: Record<string, number> = {
  perda_de_peso: 1600,
  manutencao: 2100,
  ganho_de_massa: 2700,
};

const PROTEINA_SUGERIDA: Record<string, number> = {
  perda_de_peso: 130,
  manutencao: 120,
  ganho_de_massa: 160,
};

export default function Onboarding() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [nome, setNome] = useState("");
  const [objetivo, setObjetivo] = useState("perda_de_peso");
  const [caloria, setCaloria] = useState(1600);
  const [proteina, setProteina] = useState(130);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    // Se já fez onboarding, redireciona
    if (typeof window !== "undefined" && localStorage.getItem("nutre_onboarding_v1") === "done") {
      router.replace("/app");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    setCaloria(CALORIAS_SUGERIDAS[objetivo]);
    setProteina(PROTEINA_SUGERIDA[objetivo]);
  }, [objetivo]);

  async function handleFinalizar() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      nome,
      objetivo,
      meta_calorica: caloria,
      meta_proteina: proteina,
      refeicoes_por_dia: 4,
    }).eq("id", user.id);
    localStorage.setItem("nutre_onboarding_v1", "done");
    setSaving(false);
    router.push("/app");
  }

  const TOTAL_STEPS = 3;
  const pct = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-[#f0f0f0]">
        <div
          className="h-1 bg-[#16a34a] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-10 pb-8">

        {/* ── Step 0: Boas-vindas + nome ── */}
        {step === 0 && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-[18px] bg-[#1a3a20] flex items-center justify-center mb-6">
                <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
                  <path d="M 18,18 L 31,18 L 68,82 L 82,82 L 82,18 L 69,18 L 32,82 L 18,82 Z" fill="white"/>
                </svg>
              </div>
              <h1 className="text-[28px] font-extrabold text-[#111] leading-tight mb-3">
                Bem-vindo ao Nutre
              </h1>
              <p className="text-[15px] text-[#666] leading-relaxed">
                Seu nutricionista pessoal com inteligência artificial. Tire foto da sua refeição e a IA analisa os nutrientes em segundos.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {[
                { emoji: "📷", title: "Foto → Nutrição", desc: "Tire foto e receba análise completa de calorias, proteínas, carboidratos e gorduras." },
                { emoji: "🎯", title: "Metas personalizadas", desc: "Defina sua meta calórica e acompanhe o saldo do dia em tempo real." },
                { emoji: "📈", title: "Evolução semana a semana", desc: "Veja gráficos, histórico e compare com semanas anteriores." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 bg-white rounded-[16px] p-4 border border-[#f0f0f0]">
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <p className="text-[13px] font-bold text-[#111]">{item.title}</p>
                    <p className="text-[12px] text-[#888] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <label className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-2 block">Como posso te chamar?</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu primeiro nome"
                className="w-full border border-[#e5e5e5] rounded-[14px] px-4 py-3.5 text-[15px] font-semibold text-[#111] focus:outline-none focus:border-[#16a34a] mb-4"
              />
              <button
                onClick={() => setStep(1)}
                disabled={!nome.trim()}
                className="w-full bg-[#16a34a] text-white rounded-[14px] py-4 text-[14px] font-bold disabled:opacity-40"
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Objetivo ── */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <p className="text-[13px] font-semibold text-[#16a34a] mb-2">Olá, {nome.split(" ")[0]}!</p>
              <h1 className="text-[26px] font-extrabold text-[#111] leading-tight mb-2">
                Qual é o seu objetivo?
              </h1>
              <p className="text-[14px] text-[#888]">Isso define suas metas calóricas iniciais.</p>
            </div>

            <div className="space-y-3 flex-1">
              {[
                { value: "perda_de_peso", emoji: "⚡", title: "Perda de peso", desc: "Déficit calórico controlado para emagrecer com saúde e manter músculo." },
                { value: "manutencao",    emoji: "⚖️", title: "Manutenção",    desc: "Manter o peso atual com equilíbrio entre ingestão e gasto." },
                { value: "ganho_de_massa", emoji: "💪", title: "Ganho de massa", desc: "Superávit calórico com foco em proteína para ganhar músculo." },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setObjetivo(opt.value)}
                  className={`w-full text-left rounded-[18px] p-4 border-2 transition-all ${
                    objetivo === opt.value
                      ? "border-[#16a34a] bg-[#f0fdf4]"
                      : "border-[#f0f0f0] bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <div>
                      <p className={`text-[14px] font-bold ${objetivo === opt.value ? "text-[#15803d]" : "text-[#111]"}`}>{opt.title}</p>
                      <p className="text-[12px] text-[#888] mt-0.5 leading-relaxed">{opt.desc}</p>
                    </div>
                    {objetivo === opt.value && (
                      <span className="ml-auto text-[#16a34a] font-bold text-lg flex-shrink-0">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={() => setStep(0)} className="flex-1 border border-[#e5e5e5] text-[#555] rounded-[14px] py-3.5 text-[13px] font-semibold bg-white">
                ← Voltar
              </button>
              <button onClick={() => setStep(2)} className="flex-1 bg-[#16a34a] text-white rounded-[14px] py-3.5 text-[13px] font-bold">
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Meta calórica ── */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <h1 className="text-[26px] font-extrabold text-[#111] leading-tight mb-2">
                Sua meta calórica
              </h1>
              <p className="text-[14px] text-[#888] leading-relaxed">
                Calculei uma sugestão com base no seu objetivo. Você pode ajustar a qualquer momento nas Metas.
              </p>
            </div>

            <div className="space-y-4 flex-1">
              {/* Calorias */}
              <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-5">
                <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-widest mb-3">Meta calórica diária</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 bg-[#f0fdf4] rounded-xl px-4 py-3 text-center">
                    <span className="text-[28px] font-extrabold text-[#16a34a]">{caloria.toLocaleString("pt-BR")}</span>
                    <span className="text-[14px] text-[#aaa] ml-1">kcal</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {([-100, -50, 50, 100] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setCaloria((c) => Math.max(800, c + d))}
                      className="bg-[#f5f5f5] rounded-xl py-2.5 text-[13px] font-bold text-[#555]"
                    >
                      {d > 0 ? `+${d}` : d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Proteína */}
              <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-widest mb-1">Meta de proteína</p>
                    <p className="text-[22px] font-extrabold text-[#111]">{proteina}g<span className="text-[13px] text-[#aaa] font-medium ml-1">/ dia</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setProteina((p) => Math.max(50, p - 10))} className="w-9 h-9 rounded-full bg-[#f0f0f0] text-[#555] font-bold text-lg flex items-center justify-center">−</button>
                    <button onClick={() => setProteina((p) => p + 10)} className="w-9 h-9 rounded-full bg-[#f0f0f0] text-[#555] font-bold text-lg flex items-center justify-center">+</button>
                  </div>
                </div>
              </div>

              <div className="bg-[#f0fdf4] rounded-[16px] p-4 border border-[#bbf7d0]">
                <p className="text-[12px] text-[#166534] leading-relaxed">
                  💡 Se você tiver um plano prescrito pelo nutricionista, pode importar o PDF na aba Metas e suas metas são preenchidas automaticamente.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 border border-[#e5e5e5] text-[#555] rounded-[14px] py-3.5 text-[13px] font-semibold bg-white">
                ← Voltar
              </button>
              <button
                onClick={handleFinalizar}
                disabled={saving}
                className="flex-1 bg-[#16a34a] text-white rounded-[14px] py-3.5 text-[13px] font-bold disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Começar 🎉"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
