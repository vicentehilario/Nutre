"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const QUESTIONS = [
  {
    id: "sabotador",
    pergunta: "Qual é o seu maior sabotador alimentar?",
    opcoes: [
      { id: "a", texto: "Como sem perceber o quanto",    icon: "👁️" },
      { id: "b", texto: "Estresse e impulsividade",      icon: "🔥" },
      { id: "c", texto: "Não sei o que é saudável de verdade", icon: "❓" },
      { id: "d", texto: "Começo bem, mas perco a consistência", icon: "📉" },
    ],
  },
  {
    id: "historico",
    pergunta: "Já tentou seguir alguma dieta antes?",
    opcoes: [
      { id: "a", texto: "Sim, várias vezes — sem sucesso duradouro", icon: "😔" },
      { id: "b", texto: "Comecei, mas abandonei em menos de 1 mês",  icon: "🏳️" },
      { id: "c", texto: "Nunca tentei de verdade",                    icon: "🤷" },
      { id: "d", texto: "Estou seguindo uma agora",                   icon: "✅" },
    ],
  },
  {
    id: "objetivo",
    pergunta: "O que você mais quer conquistar?",
    opcoes: [
      { id: "a", texto: "Emagrecer e me sentir bem no espelho", icon: "⚡" },
      { id: "b", texto: "Ganhar massa e definição muscular",     icon: "💪" },
      { id: "c", texto: "Me alimentar com mais equilíbrio",     icon: "⚖️" },
      { id: "d", texto: "Ter mais energia e disposição no dia", icon: "🌟" },
    ],
  },
];

const PERFIS: Record<string, { titulo: string; desc: string; cor: string }> = {
  inconsciente: {
    titulo: "O Comedor Inconsciente",
    desc: "Você come mais do que percebe — beliscadas, porções maiores, calorias invisíveis nos molhos e óleos. Não é falta de força de vontade: é falta de visibilidade. Quando você começa a enxergar o que come, tudo muda.",
    cor: "#3b82f6",
  },
  estresse: {
    titulo: "O Comedor Emocional",
    desc: "Você usa comida para gerenciar emoções — e não tem problema nenhum nisso. O segredo é ter contexto: saber o quanto comeu e o que aquilo representa no seu plano. Com informação, você escolhe com mais consciência.",
    cor: "#f97316",
  },
  perdido: {
    titulo: "O Perdido nos Rótulos",
    desc: "Tem muita informação por aí e a maioria é contraditória. Você não sabe no que acreditar — e faz sentido, porque 90% do que está na internet é genérico. O que você precisa é de orientação personalizada, não de mais regras.",
    cor: "#8b5cf6",
  },
  recomeçador: {
    titulo: "O Eterno Recomeçador",
    desc: "Segunda-feira começa. Quarta-feira para. Você sabe o que fazer — o problema é a consistência. E a consistência vem de sistemas simples, não de força de vontade. Quando registrar fica fácil e rápido, você mantém.",
    cor: "#22c55e",
  },
};

function getPerfil(respostas: Record<string, string>) {
  const sab = respostas["sabotador"];
  const hist = respostas["historico"];
  if (sab === "a") return "inconsciente";
  if (sab === "b") return "estresse";
  if (sab === "c") return "perdido";
  if (hist === "a" || hist === "b" || sab === "d") return "recomeçador";
  return "recomeçador";
}

export default function QuizPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<"intro" | "quiz" | "loading" | "resultado">("intro");
  const [qIdx, setQIdx] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [perfil, setPerfil] = useState<string | null>(null);

  function handleResposta(qId: string, optId: string) {
    const novas = { ...respostas, [qId]: optId };
    setRespostas(novas);

    if (qIdx < QUESTIONS.length - 1) {
      setTimeout(() => setQIdx((i) => i + 1), 300);
    } else {
      setEtapa("loading");
      const p = getPerfil(novas);
      setPerfil(p);
      setTimeout(() => setEtapa("resultado"), 2200);
    }
  }

  const q = QUESTIONS[qIdx];
  const progresso = ((qIdx + 1) / QUESTIONS.length) * 100;
  const perfilData = perfil ? PERFIS[perfil] : null;

  return (
    <div className="min-h-screen bg-[#080e09] text-white flex flex-col">

      {/* Barra de progresso */}
      {etapa === "quiz" && (
        <div className="h-0.5 bg-[#1a2a1c]">
          <div
            className="h-0.5 bg-[#22c55e] transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
      )}

      {/* ── INTRO ── */}
      {etapa === "intro" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
          <div
            className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-8"
            style={{ background: "linear-gradient(145deg, #1c2b1e, #0d1a0f)" }}
          >
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <path d="M 18,18 L 31,18 L 68,82 L 82,82 L 82,18 L 69,18 L 32,82 L 18,82 Z" fill="white"/>
            </svg>
          </div>

          <p className="text-[12px] font-bold text-[#22c55e] tracking-[3px] uppercase mb-4">
            Quiz de 3 perguntas
          </p>

          <h1 className="text-[36px] font-extrabold leading-[1.05] tracking-[-2px] mb-5 max-w-sm">
            Por que a sua dieta{" "}
            <span className="text-[#22c55e]">sempre falha?</span>
          </h1>

          <p className="text-[16px] text-[rgba(255,255,255,0.45)] leading-relaxed max-w-xs mb-10">
            Responda 3 perguntas rápidas. Descubra seu padrão alimentar e como corrigi-lo.
          </p>

          <button
            onClick={() => setEtapa("quiz")}
            className="bg-[#22c55e] text-[#040a05] px-8 py-4 rounded-[14px] text-[15px] font-extrabold tracking-[-0.3px] mb-6"
          >
            Descobrir agora →
          </button>

          <p className="text-[12px] text-[rgba(255,255,255,0.2)]">Leva menos de 1 minuto</p>
        </div>
      )}

      {/* ── QUIZ ── */}
      {etapa === "quiz" && (
        <div className="flex-1 flex flex-col px-6 pt-10 pb-8 max-w-lg mx-auto w-full">
          <p className="text-[12px] text-[rgba(255,255,255,0.3)] font-semibold mb-6">
            {qIdx + 1} / {QUESTIONS.length}
          </p>

          <h2 className="text-[24px] font-extrabold leading-[1.15] tracking-[-1px] mb-8">
            {q.pergunta}
          </h2>

          <div className="space-y-3">
            {q.opcoes.map((opt) => {
              const selecionado = respostas[q.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleResposta(q.id, opt.id)}
                  className={`w-full text-left rounded-[16px] p-4 border transition-all duration-200 flex items-center gap-4 ${
                    selecionado
                      ? "border-[#22c55e] bg-[rgba(34,197,94,0.1)]"
                      : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)]"
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                  <span className={`text-[14px] font-semibold leading-snug ${selecionado ? "text-[#22c55e]" : "text-[rgba(255,255,255,0.8)]"}`}>
                    {opt.texto}
                  </span>
                  {selecionado && <span className="ml-auto text-[#22c55e] font-bold flex-shrink-0">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {etapa === "loading" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#1a2a1c]" />
            <div className="absolute inset-0 rounded-full border-2 border-[#22c55e] border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-bold text-white mb-1">Analisando suas respostas...</p>
            <p className="text-[13px] text-[rgba(255,255,255,0.35)]">Identificando seu perfil alimentar</p>
          </div>
        </div>
      )}

      {/* ── RESULTADO ── */}
      {etapa === "resultado" && perfilData && (
        <div className="flex-1 flex flex-col px-6 pt-10 pb-8 max-w-lg mx-auto w-full">

          <p className="text-[11px] font-bold text-[#22c55e] tracking-[3px] uppercase mb-3">Seu perfil</p>

          <h2 className="text-[28px] font-extrabold leading-tight tracking-[-1.5px] mb-4">
            {perfilData.titulo}
          </h2>

          <p className="text-[15px] text-[rgba(255,255,255,0.55)] leading-relaxed mb-8">
            {perfilData.desc}
          </p>

          {/* Separador */}
          <div className="h-px bg-[rgba(255,255,255,0.07)] mb-8" />

          <p className="text-[13px] font-bold text-white mb-4">O Nutre resolve exatamente isso:</p>

          <div className="space-y-3 mb-8">
            {[
              { icon: "📸", titulo: "Foto → análise em 5 segundos", desc: "Calorias e macros da refeição — sem tabela, sem pesagem." },
              { icon: "🎯", titulo: "Meta calculada pelo seu corpo", desc: "Fórmula de Harris-Benedict com seu peso, altura e rotina." },
              { icon: "💬", titulo: "Feedback do nutricionista Vicente", desc: "Orientação real — sem culpa, com contexto." },
            ].map((item) => (
              <div key={item.titulo} className="flex gap-4 rounded-[16px] p-4 border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-[13px] font-bold text-white">{item.titulo}</p>
                  <p className="text-[12px] text-[rgba(255,255,255,0.4)] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-[12px] bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.15)]">
            <div className="flex -space-x-2 flex-shrink-0">
              {["#16a34a", "#22c55e", "#4ade80"].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#080e09]" style={{ background: c }} />
              ))}
            </div>
            <p className="text-[12px] text-[rgba(255,255,255,0.5)]">
              <span className="text-white font-semibold">+240 pessoas</span> começaram essa semana
            </p>
          </div>

          <button
            onClick={() => router.push("/cadastro")}
            className="w-full bg-[#22c55e] text-[#040a05] py-4 rounded-[14px] text-[15px] font-extrabold tracking-[-0.3px] mb-3"
          >
            Quero começar grátis →
          </button>

          <p className="text-center text-[12px] text-[rgba(255,255,255,0.25)]">
            Grátis para sempre · Sem cartão de crédito
          </p>
        </div>
      )}
    </div>
  );
}
