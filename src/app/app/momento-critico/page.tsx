"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

type Modo = "vontade" | "receita";

type ResultadoVontade = { mensagem: string; substituicoes: string[] };
type Macros = { kcal: number; proteina: number | null; carbo: number | null; gordura: number | null } | null;
type ResultadoReceita = {
  nome: string;
  porque: string;
  ingredientes: string[];
  preparo: string[];
  dica: string;
  tags?: string[];
  macros: Macros;
};

// Imagens por categoria de receita (Unsplash, free to use)
const TAG_IMAGE_MAP: Record<string, string> = {
  "cafe-da-manha": "https://images.unsplash.com/photo-1484723091739-30990a9d8f90?w=600&h=240&fit=crop&q=75",
  "proteico":      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=240&fit=crop&q=75",
  "doce":          "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=240&fit=crop&q=75",
  "leve":          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=240&fit=crop&q=75",
  "pos-treino":    "https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=600&h=240&fit=crop&q=75",
  "salgado":       "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=240&fit=crop&q=75",
  "bebida":        "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&h=240&fit=crop&q=75",
  "lanche":        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=240&fit=crop&q=75",
  "baixo-carb":    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=240&fit=crop&q=75",
  "vegetariano":   "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=240&fit=crop&q=75",
  "almoco":        "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=240&fit=crop&q=75",
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=240&fit=crop&q=75";

function getRecipeImage(tags?: string[]): string {
  if (!tags) return DEFAULT_IMAGE;
  for (const tag of tags) {
    if (TAG_IMAGE_MAP[tag]) return TAG_IMAGE_MAP[tag];
  }
  return DEFAULT_IMAGE;
}

const CONTEXTO_TAGS = [
  { label: "🥩 Proteico", value: "Proteico" },
  { label: "🥗 Leve", value: "Leve" },
  { label: "🍫 Docinho fit", value: "Docinho fit" },
  { label: "⚡ Rápido", value: "Rápido" },
  { label: "🫙 Fácil de fazer", value: "Fácil de fazer" },
  { label: "💪 Pós-treino", value: "Pós-treino" },
];

function ReceitaCard({ receita, index }: { receita: ResultadoReceita; index: number }) {
  const [expandido, setExpandido] = useState(false);
  const imgUrl = getRecipeImage(receita.tags);
  return (
    <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
      {/* Foto da categoria */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={imgUrl}
          alt={receita.nome}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#ea580c]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6">
          <span className="text-[10px] font-bold text-orange-200 uppercase tracking-widest block mb-0.5">
            Ideia {index + 1}
          </span>
          <p className="text-[16px] font-extrabold text-white leading-tight">{receita.nome}</p>
        </div>
        {receita.macros && (
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 flex gap-2">
            <span className="text-[11px] font-bold text-white">{receita.macros.kcal} kcal</span>
            {receita.macros.proteina && (
              <span className="text-[11px] text-orange-200">P {receita.macros.proteina}g</span>
            )}
          </div>
        )}
      </div>
      {/* Porque */}
      <div className="bg-[#ea580c] px-5 pt-3 pb-3">
        <p className="text-[12px] text-orange-100 leading-snug">{receita.porque}</p>
      </div>

      {/* Macros completos */}
      {receita.macros && (receita.macros.proteina || receita.macros.carbo || receita.macros.gordura) && (
        <div className="flex gap-0 border-b border-[#f5f5f5]">
          {receita.macros.proteina != null && (
            <div className="flex-1 flex flex-col items-center py-2.5 border-r border-[#f5f5f5]">
              <span className="text-[13px] font-bold text-[#111]">{receita.macros.proteina}g</span>
              <span className="text-[10px] text-[#aaa] uppercase tracking-wide">Proteína</span>
            </div>
          )}
          {receita.macros.carbo != null && (
            <div className="flex-1 flex flex-col items-center py-2.5 border-r border-[#f5f5f5]">
              <span className="text-[13px] font-bold text-[#111]">{receita.macros.carbo}g</span>
              <span className="text-[10px] text-[#aaa] uppercase tracking-wide">Carbo</span>
            </div>
          )}
          {receita.macros.gordura != null && (
            <div className="flex-1 flex flex-col items-center py-2.5">
              <span className="text-[13px] font-bold text-[#111]">{receita.macros.gordura}g</span>
              <span className="text-[10px] text-[#aaa] uppercase tracking-wide">Gordura</span>
            </div>
          )}
        </div>
      )}

      {/* Ingredientes */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">🛒</span>
          <p className="text-[12px] font-bold text-[#111] uppercase tracking-wide">Ingredientes</p>
        </div>
        {receita.ingredientes.map((item, i) => (
          <div key={i} className="flex items-start gap-2 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ea580c] flex-shrink-0 mt-1.5" />
            <p className="text-[13px] text-[#333] leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      {/* Preparo - expansível */}
      <div className="border-t border-[#f5f5f5]">
        <button
          onClick={() => setExpandido(!expandido)}
          className="w-full flex items-center justify-between px-5 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">📋</span>
            <p className="text-[12px] font-bold text-[#111] uppercase tracking-wide">Como fazer</p>
          </div>
          <span className="text-[#ea580c] text-[18px] leading-none">{expandido ? "−" : "+"}</span>
        </button>
        {expandido && (
          <div className="px-5 pb-3 space-y-2">
            {receita.preparo.map((passo, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center text-[10px] font-extrabold text-[#ea580c] flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-[13px] text-[#333] leading-relaxed">{passo}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dica */}
      <div className="mx-4 mb-4 bg-[#fff7ed] rounded-[12px] p-3 border border-[#fed7aa]">
        <p className="text-[11px] font-bold text-[#ea580c] uppercase tracking-widest mb-1">💡 Dica</p>
        <p className="text-[12px] text-[#c2410c] leading-relaxed">{receita.dica}</p>
      </div>
    </div>
  );
}

export default function MeSalva() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [modo, setModo] = useState<Modo>("vontade");

  // --- modo vontade ---
  const [vontade, setVontade] = useState("");
  const [loadingVontade, setLoadingVontade] = useState(false);
  const [resultadoVontade, setResultadoVontade] = useState<ResultadoVontade | null>(null);

  // --- modo receita ---
  const [tagsAtivas, setTagsAtivas] = useState<string[]>([]);
  const [textoExtra, setTextoExtra] = useState("");
  const [loadingReceita, setLoadingReceita] = useState(false);
  const [resultadoReceitas, setResultadoReceitas] = useState<ResultadoReceita[] | null>(null);

  if (authLoading) return null;
  if (!user) { router.push("/login"); return null; }

  function toggleTag(tag: string) {
    setTagsAtivas(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function buildContexto() {
    const parts = [...tagsAtivas, textoExtra.trim()].filter(Boolean);
    return parts.join(", ");
  }

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
        body: JSON.stringify({ contexto: buildContexto() }),
      });
      const data = await res.json();
      // API agora retorna array de 2
      setResultadoReceitas(Array.isArray(data) ? data : [data]);
    } catch {
      // silent
    } finally {
      setLoadingReceita(false);
    }
  }

  function trocarModo(novoModo: Modo) {
    setModo(novoModo);
    setResultadoVontade(null);
    setResultadoReceitas(null);
    setVontade("");
    setTagsAtivas([]);
    setTextoExtra("");
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
              modo === "vontade" ? "bg-[#ea580c] text-white" : "bg-transparent text-[#777]"
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
              modo === "receita" ? "bg-[#ea580c] text-white" : "bg-transparent text-[#777]"
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
            {!resultadoReceitas ? (
              <>
                <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-4">
                  <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-widest mb-3">O que você está precisando?</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {CONTEXTO_TAGS.map((tag) => (
                      <button
                        key={tag.value}
                        onClick={() => toggleTag(tag.value)}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition ${
                          tagsAtivas.includes(tag.value)
                            ? "bg-[#ea580c] text-white border-[#ea580c]"
                            : "bg-[#fafafa] text-[#555] border-[#e5e5e5]"
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={textoExtra}
                    onChange={(e) => setTextoExtra(e.target.value)}
                    rows={2}
                    className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-[14px] px-4 py-3 text-[14px] text-[#111] focus:outline-none focus:border-[#ea580c] resize-none"
                    placeholder="Detalhe mais (opcional): tenho ovos e frango em casa, não quero cozinhar muito..."
                  />
                </div>

                {loadingReceita ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-4">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full border-4 border-[#fed7aa]" />
                      <div className="absolute inset-0 rounded-full border-4 border-[#ea580c] border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-xl">👨‍🍳</div>
                    </div>
                    <p className="text-[13px] text-[#aaa]">Buscando 2 ideias para você...</p>
                  </div>
                ) : (
                  <button
                    onClick={handleEnviarReceita}
                    className="w-full bg-[#ea580c] text-white rounded-[14px] py-4 text-[14px] font-bold transition-opacity"
                  >
                    🍳 Quero 2 ideias, Vicente!
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-widest px-1">
                  2 ideias para você agora
                </p>

                {resultadoReceitas.map((receita, i) => (
                  <ReceitaCard key={i} receita={receita} index={i} />
                ))}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setResultadoReceitas(null); }}
                    className="flex-1 border border-[#e5e5e5] bg-white text-[#555] rounded-[14px] py-3.5 text-[13px] font-semibold"
                  >
                    Outras 2 ideias
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
