"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

type Modo = "vontade" | "receita";

type ResultadoVontade = { mensagem: string; substituicoes: string[] };
type ResultadoReceita = {
  nome: string;
  porque: string;
  ingredientes: string[];
  preparo: string[];
  dica: string;
};

export default function MeSalva() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [modo, setModo] = useState<Modo>("vontade");

  // --- modo vontade ---
  const [vontade, setVontade] = useState("");
  const [loadingVontade, setLoadingVontade] = useState(false);
  const [resultadoVontade, setResultadoVontade] = useState<ResultadoVontade | null>(null);

  // --- modo receita ---
  const [contexto, setContexto] = useState("");
  const [loadingReceita, setLoadingReceita] = useState(false);
  const [resultadoReceita, setResultadoReceita] = useState<ResultadoReceita | null>(null);

  if (authLoading) return null;
  if (!user) { router.push("/login"); return null; }

  async function handleEnviarVontade() {
    if (!vontade.trim()) return;
    setLoadingVontade(true);
    try {
      const res = await fetch("/api/momento-critico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vontade }),
      });
      const data = await res.json();
      setResultadoVontade(data);
    } catch {
      // silent
    } finally {
      setLoadingVontade(false);
    }
  }

  async function handleEnviarReceita() {
    setLoadingReceita(true);
    try {
      const res = await fetch("/api/receita-diferente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contexto }),
      });
      const data = await res.json();
      setResultadoReceita(data);
    } catch {
      // silent
    } finally {
      setLoadingReceita(false);
    }
  }

  function trocarModo(novoModo: Modo) {
    setModo(novoModo);
    setResultadoVontade(null);
    setResultadoReceita(null);
    setVontade("");
    setContexto("");
  }

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="bg-[#ea580c] px-6 pt-5 pb-5">
        <p className="text-[11px] font-bold text-orange-200 uppercase tracking-widest mb-1">Vicente Hilário · Nutricionista</p>
        <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-tight">
          Me Salva!
        </h1>
        <p className="text-[13px] text-orange-100 mt-1.5 leading-relaxed opacity-90">
          Sem julgamento — vamos resolver juntos.
        </p>
      </div>

      {/* Seletor de modo */}
      <div className="px-4 -mt-3 mb-1">
        <div className="bg-white rounded-[16px] border border-[#f0f0f0] p-1.5 flex gap-1.5 shadow-sm">
          <button
            onClick={() => trocarModo("vontade")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-[12px] transition-all ${
              modo === "vontade"
                ? "bg-[#ea580c] text-white"
                : "bg-transparent text-[#777]"
            }`}
          >
            <span className="text-xl">🤤</span>
            <span className="text-[11px] font-bold leading-tight text-center">
              Tá com vontade<br />de quê?
            </span>
          </button>
          <button
            onClick={() => trocarModo("receita")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-[12px] transition-all ${
              modo === "receita"
                ? "bg-[#ea580c] text-white"
                : "bg-transparent text-[#777]"
            }`}
          >
            <span className="text-xl">🍳</span>
            <span className="text-[11px] font-bold leading-tight text-center">
              Quero comer<br />algo diferente
            </span>
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 pb-8 space-y-3">

        {/* ========== MODO: TÁ COM VONTADE ========== */}
        {modo === "vontade" && (
          <>
            {!resultadoVontade ? (
              <>
                <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-4">
                  <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-widest mb-3">Qual é a vontade agora?</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["🍫 Chocolate", "🍕 Pizza", "🍦 Sorvete", "🍟 Salgadinho", "🍰 Doce", "🍺 Bebida"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setVontade(s.slice(3))}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition ${
                          vontade.includes(s.slice(3))
                            ? "bg-[#ea580c] text-white border-[#ea580c]"
                            : "bg-[#fafafa] text-[#555] border-[#e5e5e5]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={vontade}
                    onChange={(e) => setVontade(e.target.value)}
                    rows={3}
                    className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-[14px] px-4 py-3 text-[14px] text-[#111] focus:outline-none focus:border-[#ea580c] resize-none"
                    placeholder="Ex: tô com vontade de um chocolate, uma pizza, sorvete..."
                  />
                </div>

                {loadingVontade ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-4">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full border-4 border-[#fed7aa]" />
                      <div className="absolute inset-0 rounded-full border-4 border-[#ea580c] border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-xl">🧠</div>
                    </div>
                    <p className="text-[13px] text-[#aaa]">Vicente está pensando...</p>
                  </div>
                ) : (
                  <button
                    onClick={handleEnviarVontade}
                    disabled={!vontade.trim()}
                    className="w-full bg-[#ea580c] text-white rounded-[14px] py-4 text-[14px] font-bold disabled:opacity-40 transition-opacity"
                  >
                    🆘 Me salva, Vicente!
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="bg-[#ea580c] rounded-[20px] p-5">
                  <p className="text-[11px] font-bold text-orange-200 uppercase tracking-widest mb-2">Vicente diz</p>
                  <p className="text-[15px] text-white leading-relaxed font-medium">{resultadoVontade.mensagem}</p>
                </div>

                <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#f5f5f5]">
                    <p className="text-[13px] font-bold text-[#111]">Suas opções agora</p>
                  </div>
                  {resultadoVontade.substituicoes.map((s, i) => (
                    <div key={i} className={`flex items-start gap-3 px-5 py-4 ${i < resultadoVontade.substituicoes.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                      <div className="w-6 h-6 rounded-full bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center text-[11px] font-extrabold text-[#ea580c] flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-[13px] text-[#333] leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#fff7ed] rounded-[16px] p-4 border border-[#fed7aa]">
                  <p className="text-[12px] text-[#c2410c] leading-relaxed font-medium">
                    💡 Lembra: comer não é o problema. Comer sem controle é. Dose a quantidade, curte sem culpa e segue em frente.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setResultadoVontade(null); setVontade(""); }}
                    className="flex-1 border border-[#e5e5e5] bg-white text-[#555] rounded-[14px] py-3.5 text-[13px] font-semibold"
                  >
                    Nova situação
                  </button>
                  <button
                    onClick={() => router.push("/app")}
                    className="flex-1 bg-[#111] text-white rounded-[14px] py-3.5 text-[13px] font-bold"
                  >
                    Voltar ao início
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ========== MODO: QUERO COMER ALGO DIFERENTE ========== */}
        {modo === "receita" && (
          <>
            {!resultadoReceita ? (
              <>
                <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-4">
                  <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-widest mb-3">Me conta um pouco (opcional)</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["🥩 Proteico", "🥗 Leve", "🍫 Docinho fit", "⚡ Rápido", "🫙 Fácil de fazer", "💪 Pós-treino"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setContexto((prev) => prev ? `${prev}, ${s.slice(3)}` : s.slice(3))}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition ${
                          contexto.includes(s.slice(3))
                            ? "bg-[#ea580c] text-white border-[#ea580c]"
                            : "bg-[#fafafa] text-[#555] border-[#e5e5e5]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={contexto}
                    onChange={(e) => setContexto(e.target.value)}
                    rows={3}
                    className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-[14px] px-4 py-3 text-[14px] text-[#111] focus:outline-none focus:border-[#ea580c] resize-none"
                    placeholder="Ex: quero algo proteico, tenho ovos e frango em casa, não quero passar muito tempo cozinhando..."
                  />
                </div>

                {loadingReceita ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-4">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full border-4 border-[#fed7aa]" />
                      <div className="absolute inset-0 rounded-full border-4 border-[#ea580c] border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-xl">👨‍🍳</div>
                    </div>
                    <p className="text-[13px] text-[#aaa]">Vicente está criando uma receita...</p>
                  </div>
                ) : (
                  <button
                    onClick={handleEnviarReceita}
                    className="w-full bg-[#ea580c] text-white rounded-[14px] py-4 text-[14px] font-bold transition-opacity"
                  >
                    🍳 Quero uma ideia, Vicente!
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Nome e benefício */}
                <div className="bg-[#ea580c] rounded-[20px] p-5">
                  <p className="text-[11px] font-bold text-orange-200 uppercase tracking-widest mb-1">Receita do Vicente</p>
                  <p className="text-[20px] font-extrabold text-white leading-tight mb-2">{resultadoReceita.nome}</p>
                  <p className="text-[13px] text-orange-100 leading-relaxed">{resultadoReceita.porque}</p>
                </div>

                {/* Ingredientes */}
                <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#f5f5f5] flex items-center gap-2">
                    <span className="text-base">🛒</span>
                    <p className="text-[13px] font-bold text-[#111]">Ingredientes</p>
                  </div>
                  {resultadoReceita.ingredientes.map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 px-5 py-3 ${i < resultadoReceita.ingredientes.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ea580c] flex-shrink-0" />
                      <p className="text-[13px] text-[#333]">{item}</p>
                    </div>
                  ))}
                </div>

                {/* Modo de preparo */}
                <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#f5f5f5] flex items-center gap-2">
                    <span className="text-base">📋</span>
                    <p className="text-[13px] font-bold text-[#111]">Como fazer</p>
                  </div>
                  {resultadoReceita.preparo.map((passo, i) => (
                    <div key={i} className={`flex items-start gap-3 px-5 py-4 ${i < resultadoReceita.preparo.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                      <div className="w-6 h-6 rounded-full bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center text-[11px] font-extrabold text-[#ea580c] flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-[13px] text-[#333] leading-relaxed">{passo}</p>
                    </div>
                  ))}
                </div>

                {/* Dica do Vicente */}
                <div className="bg-[#fff7ed] rounded-[16px] p-4 border border-[#fed7aa]">
                  <p className="text-[11px] font-bold text-[#ea580c] uppercase tracking-widest mb-1">💡 Dica do Vicente</p>
                  <p className="text-[13px] text-[#c2410c] leading-relaxed font-medium">{resultadoReceita.dica}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setResultadoReceita(null); setContexto(""); }}
                    className="flex-1 border border-[#e5e5e5] bg-white text-[#555] rounded-[14px] py-3.5 text-[13px] font-semibold"
                  >
                    Outra receita
                  </button>
                  <button
                    onClick={() => router.push("/app")}
                    className="flex-1 bg-[#111] text-white rounded-[14px] py-3.5 text-[13px] font-bold"
                  >
                    Voltar ao início
                  </button>
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
