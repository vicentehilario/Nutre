"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

export default function MeSalva() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [vontade, setVontade] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    mensagem: string;
    substituicoes: string[];
  } | null>(null);

  if (authLoading) return null;
  if (!user) { router.push("/login"); return null; }

  async function handleEnviar() {
    if (!vontade.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/momento-critico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vontade }),
      });
      const data = await res.json();
      setResultado(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="bg-[#ea580c] px-6 pt-5 pb-5">
        <p className="text-[11px] font-bold text-orange-200 uppercase tracking-widest mb-1">Vicente Hilário · Nutricionista</p>
        <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-tight">
          Bateu a vontade?
        </h1>
        <p className="text-[13px] text-orange-100 mt-1.5 leading-relaxed opacity-90">
          Sem julgamento. Conta o que você quer comer — vamos resolver juntos.
        </p>
      </div>

      {/* Pill identidade */}
      <div className="px-4 -mt-3 mb-1">
        <div className="bg-white rounded-[14px] border border-[#fed7aa] px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center text-lg flex-shrink-0">
            🆘
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#c2410c]">Modo Me Salva</p>
            <p className="text-[11px] text-[#aaa]">Não proibimos — encontramos a dose certa</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-8 space-y-3">

        {!resultado ? (
          <>
            {/* Sugestões rápidas */}
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

            {loading ? (
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
                onClick={handleEnviar}
                disabled={!vontade.trim()}
                className="w-full bg-[#ea580c] text-white rounded-[14px] py-4 text-[14px] font-bold disabled:opacity-40 transition-opacity"
              >
                🆘 Me salva, Vicente!
              </button>
            )}
          </>
        ) : (
          <>
            {/* Mensagem do Vicente */}
            <div className="bg-[#ea580c] rounded-[20px] p-5">
              <p className="text-[11px] font-bold text-orange-200 uppercase tracking-widest mb-2">Vicente diz</p>
              <p className="text-[15px] text-white leading-relaxed font-medium">{resultado.mensagem}</p>
            </div>

            {/* Alternativas */}
            <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#f5f5f5]">
                <p className="text-[13px] font-bold text-[#111]">Suas opções agora</p>
              </div>
              {resultado.substituicoes.map((s, i) => (
                <div key={i} className={`flex items-start gap-3 px-5 py-4 ${i < resultado.substituicoes.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                  <div className="w-6 h-6 rounded-full bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center text-[11px] font-extrabold text-[#ea580c] flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-[13px] text-[#333] leading-relaxed">{s}</p>
                </div>
              ))}
            </div>

            {/* Lembrete */}
            <div className="bg-[#fff7ed] rounded-[16px] p-4 border border-[#fed7aa]">
              <p className="text-[12px] text-[#c2410c] leading-relaxed font-medium">
                💡 Lembra: comer não é o problema. Comer sem controle é. Dose a quantidade, curte sem culpa e segue em frente.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setResultado(null); setVontade(""); }}
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
      </div>
    </div>
  );
}
