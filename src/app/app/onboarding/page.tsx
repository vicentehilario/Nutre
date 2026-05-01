"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";

const ACTIVITY_OPTIONS = [
  { value: "sedentario",  label: "Sedentário",          desc: "Pouco ou nenhum exercício",       mult: 1.2   },
  { value: "leve",        label: "Levemente ativo",     desc: "Exercício 1–3x por semana",        mult: 1.375 },
  { value: "moderado",    label: "Moderadamente ativo", desc: "Exercício 3–5x por semana",        mult: 1.55  },
  { value: "muito_ativo", label: "Muito ativo",         desc: "Exercício intenso 6–7x por semana", mult: 1.725 },
];

function calcHarrisBenedict(sexo: string, peso: number, altura: number, idade: number): number {
  if (sexo === "masculino") return 88.36 + 13.4 * peso + 5.7 * altura - 5.4 * idade;
  return 447.6 + 9.25 * peso + 3.1 * altura - 4.3 * idade;
}

function calcGoals(bmr: number, actMult: number, objetivo: string, peso: number) {
  const tdee = Math.round(bmr * actMult);
  const caloriaMap: Record<string, number> = {
    perda_de_peso:  Math.max(1200, tdee - 500),
    manutencao:     tdee,
    ganho_de_massa: tdee + 300,
  };
  const protMultMap: Record<string, number> = {
    perda_de_peso:  2.0,
    manutencao:     1.7,
    ganho_de_massa: 2.2,
  };
  return {
    tdee,
    caloria: caloriaMap[objetivo] ?? tdee,
    proteina: Math.round(peso * (protMultMap[objetivo] ?? 1.8)),
  };
}

export default function Onboarding() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);

  // Step 0
  const [nome, setNome] = useState("");

  // Step 1
  const [objetivo, setObjetivo] = useState("perda_de_peso");

  // Step 2 — dados físicos
  const [sexo, setSexo] = useState("masculino");
  const [idade, setIdade] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [nivelAtividade, setNivelAtividade] = useState("moderado");

  // Step 3 — metas calculadas (ajustáveis)
  const [caloria, setCaloria] = useState(0);
  const [proteina, setProteina] = useState(0);
  const [tdee, setTdee] = useState(0);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    if (typeof window !== "undefined" && localStorage.getItem("nutre_onboarding_v1") === "done") {
      router.replace("/app");
    }
  }, [user, authLoading, router]);

  function handleAvancarDados() {
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    const i = parseInt(idade);
    if (!p || !a || !i || p < 30 || p > 250 || a < 100 || a > 250 || i < 10 || i > 100) return;

    const actMult = ACTIVITY_OPTIONS.find((o) => o.value === nivelAtividade)?.mult ?? 1.55;
    const bmr = calcHarrisBenedict(sexo, p, a, i);
    const goals = calcGoals(bmr, actMult, objetivo, p);
    setTdee(goals.tdee);
    setCaloria(goals.caloria);
    setProteina(goals.proteina);
    setStep(3);
  }

  async function handleFinalizar() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    const i = parseInt(idade);
    const actMult = ACTIVITY_OPTIONS.find((o) => o.value === nivelAtividade)?.mult ?? 1.55;
    const bmr = calcHarrisBenedict(sexo, p, a, i);

    await supabase.from("profiles").update({
      nome,
      objetivo,
      sexo,
      idade: i,
      altura_cm: a,
      peso_kg: p,
      nivel_atividade: nivelAtividade,
      get_kcal: tdee,
      meta_calorica: caloria,
      meta_proteina: proteina,
      bmr_kcal: Math.round(bmr),
      refeicoes_por_dia: 4,
    }).eq("id", user.id);

    localStorage.setItem("nutre_onboarding_v1", "done");
    setSaving(false);
    router.push("/app");
  }

  const TOTAL_STEPS = 4;
  const pct = ((step + 1) / TOTAL_STEPS) * 100;

  const dadosValidos = (() => {
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    const i = parseInt(idade);
    return p >= 30 && p <= 250 && a >= 100 && a <= 250 && i >= 10 && i <= 100;
  })();

  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col">
      <div className="h-1 bg-[#f0f0f0]">
        <div className="h-1 bg-[#16a34a] transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-10 pb-8">

        {/* ── Step 0: Boas-vindas + nome ── */}
        {step === 0 && (
          <div className="flex-1 flex flex-col">
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

            <div className="space-y-3 mb-6">
              {[
                { emoji: "📸", title: "Foto → Análise em segundos", desc: "Calorias, proteínas, carboidratos e gorduras — na hora." },
                { emoji: "🎯", title: "Meta calculada pra você", desc: "Baseada no seu peso, altura e nível de atividade." },
                { emoji: "💬", title: "Feedback do Vicente", desc: "Orientação real do nutricionista — sem culpa, com contexto." },
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
              <h1 className="text-[26px] font-extrabold text-[#111] leading-tight mb-2">Qual é o seu objetivo?</h1>
              <p className="text-[14px] text-[#888]">Isso define suas metas calóricas iniciais.</p>
            </div>

            <div className="space-y-3 flex-1">
              {[
                { value: "perda_de_peso",  emoji: "⚡", title: "Perda de peso",  desc: "Déficit calórico controlado para emagrecer com saúde e manter músculo." },
                { value: "manutencao",     emoji: "⚖️", title: "Manutenção",     desc: "Manter o peso atual com equilíbrio entre ingestão e gasto." },
                { value: "ganho_de_massa", emoji: "💪", title: "Ganho de massa", desc: "Superávit calórico com foco em proteína para ganhar músculo." },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setObjetivo(opt.value)}
                  className={`w-full text-left rounded-[18px] p-4 border-2 transition-all ${objetivo === opt.value ? "border-[#16a34a] bg-[#f0fdf4]" : "border-[#f0f0f0] bg-white"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <div>
                      <p className={`text-[14px] font-bold ${objetivo === opt.value ? "text-[#15803d]" : "text-[#111]"}`}>{opt.title}</p>
                      <p className="text-[12px] text-[#888] mt-0.5 leading-relaxed">{opt.desc}</p>
                    </div>
                    {objetivo === opt.value && <span className="ml-auto text-[#16a34a] font-bold text-lg flex-shrink-0">✓</span>}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={() => setStep(0)} className="flex-1 border border-[#e5e5e5] text-[#555] rounded-[14px] py-3.5 text-[13px] font-semibold bg-white">← Voltar</button>
              <button onClick={() => setStep(2)} className="flex-1 bg-[#16a34a] text-white rounded-[14px] py-3.5 text-[13px] font-bold">Continuar →</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Dados físicos ── */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <h1 className="text-[26px] font-extrabold text-[#111] leading-tight mb-2">Seus dados físicos</h1>
              <p className="text-[14px] text-[#888] leading-relaxed">
                Usamos a Fórmula de Harris-Benedict para calcular sua meta calórica real — baseada no seu corpo, não em uma média genérica.
              </p>
            </div>

            <div className="space-y-4 flex-1">
              {/* Sexo */}
              <div>
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-2">Sexo biológico</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: "masculino", l: "Masculino" }, { v: "feminino", l: "Feminino" }].map((s) => (
                    <button
                      key={s.v}
                      onClick={() => setSexo(s.v)}
                      className={`py-3 rounded-[14px] text-[14px] font-bold border-2 transition-all ${sexo === s.v ? "border-[#16a34a] bg-[#f0fdf4] text-[#15803d]" : "border-[#f0f0f0] bg-white text-[#555]"}`}
                    >
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Idade + Altura + Peso */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-1.5 block">Idade</label>
                  <div className="relative">
                    <input
                      type="number" inputMode="numeric" value={idade} onChange={(e) => setIdade(e.target.value)}
                      placeholder="25"
                      className="w-full border border-[#e5e5e5] rounded-[12px] px-3 py-3 text-[15px] font-semibold text-[#111] focus:outline-none focus:border-[#16a34a] pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#aaa] font-medium">anos</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-1.5 block">Altura</label>
                  <div className="relative">
                    <input
                      type="number" inputMode="numeric" value={altura} onChange={(e) => setAltura(e.target.value)}
                      placeholder="170"
                      className="w-full border border-[#e5e5e5] rounded-[12px] px-3 py-3 text-[15px] font-semibold text-[#111] focus:outline-none focus:border-[#16a34a] pr-6"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#aaa] font-medium">cm</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-1.5 block">Peso</label>
                  <div className="relative">
                    <input
                      type="number" inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)}
                      placeholder="70"
                      className="w-full border border-[#e5e5e5] rounded-[12px] px-3 py-3 text-[15px] font-semibold text-[#111] focus:outline-none focus:border-[#16a34a] pr-5"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#aaa] font-medium">kg</span>
                  </div>
                </div>
              </div>

              {/* Nível de atividade */}
              <div>
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-2">Nível de atividade física</p>
                <div className="space-y-2">
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setNivelAtividade(opt.value)}
                      className={`w-full text-left rounded-[14px] px-4 py-3 border-2 transition-all flex items-center gap-3 ${nivelAtividade === opt.value ? "border-[#16a34a] bg-[#f0fdf4]" : "border-[#f0f0f0] bg-white"}`}
                    >
                      <div className="flex-1">
                        <p className={`text-[13px] font-bold ${nivelAtividade === opt.value ? "text-[#15803d]" : "text-[#111]"}`}>{opt.label}</p>
                        <p className="text-[11px] text-[#888]">{opt.desc}</p>
                      </div>
                      {nivelAtividade === opt.value && <span className="text-[#16a34a] font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 border border-[#e5e5e5] text-[#555] rounded-[14px] py-3.5 text-[13px] font-semibold bg-white">← Voltar</button>
              <button
                onClick={handleAvancarDados}
                disabled={!dadosValidos}
                className="flex-1 bg-[#16a34a] text-white rounded-[14px] py-3.5 text-[13px] font-bold disabled:opacity-40"
              >
                Calcular meta →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Meta calculada ── */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <h1 className="text-[26px] font-extrabold text-[#111] leading-tight mb-2">Sua meta calórica</h1>
              <p className="text-[14px] text-[#888] leading-relaxed">
                Calculado pelo gasto energético total (GET) do seu corpo. Você pode ajustar a qualquer momento.
              </p>
            </div>

            <div className="space-y-4 flex-1">
              {/* GET info */}
              <div className="bg-[#f0fdf4] rounded-[16px] border border-[#bbf7d0] p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-[#166534] uppercase tracking-widest mb-1">Seu GET estimado</p>
                  <p className="text-[22px] font-extrabold text-[#15803d]">{tdee.toLocaleString("pt-BR")} kcal</p>
                  <p className="text-[11px] text-[#4ade80] mt-0.5">Gasto energético total diário</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#166534] font-semibold uppercase tracking-wide">Ajuste</p>
                  <p className="text-[13px] font-bold text-[#15803d]">
                    {objetivo === "perda_de_peso" ? "− 500 kcal" : objetivo === "ganho_de_massa" ? "+ 300 kcal" : "= GET"}
                  </p>
                </div>
              </div>

              {/* Calorie goal */}
              <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-5">
                <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-widest mb-3">Meta calórica diária</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 bg-[#f0fdf4] rounded-xl px-4 py-3 text-center">
                    <span className="text-[32px] font-extrabold text-[#16a34a]">{caloria.toLocaleString("pt-BR")}</span>
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

              {/* Protein */}
              <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-widest mb-1">Meta de proteína</p>
                    <p className="text-[22px] font-extrabold text-[#111]">{proteina}g<span className="text-[13px] text-[#aaa] font-medium ml-1">/ dia</span></p>
                    <p className="text-[11px] text-[#aaa] mt-1">{parseFloat(peso) > 0 ? `≈ ${(proteina / parseFloat(peso)).toFixed(1)}g por kg de peso` : "Baseado no seu peso"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setProteina((p) => Math.max(50, p - 10))} className="w-9 h-9 rounded-full bg-[#f0f0f0] text-[#555] font-bold text-lg flex items-center justify-center">−</button>
                    <button onClick={() => setProteina((p) => p + 10)} className="w-9 h-9 rounded-full bg-[#f0f0f0] text-[#555] font-bold text-lg flex items-center justify-center">+</button>
                  </div>
                </div>
              </div>

              <div className="bg-[#fffbeb] rounded-[16px] p-4 border border-[#fde68a]">
                <p className="text-[12px] text-[#92400e] leading-relaxed">
                  Se você tiver um plano prescrito pelo Vicente, pode importar o PDF em Metas e suas metas são atualizadas automaticamente.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 border border-[#e5e5e5] text-[#555] rounded-[14px] py-3.5 text-[13px] font-semibold bg-white">← Voltar</button>
              <button
                onClick={handleFinalizar}
                disabled={saving}
                className="flex-1 bg-[#16a34a] text-white rounded-[14px] py-3.5 text-[13px] font-bold disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Começar agora"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
