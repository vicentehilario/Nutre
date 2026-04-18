"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";

const STEPS = ["Enviando foto", "Analisando nutrição", "Salvando registro"];

interface Resultado {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  feedback: string;
  dentro_do_plano: boolean;
}

export default function Registrar() {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [modo, setModo] = useState<"foto" | "manual">("foto");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const converted = new File([blob], "foto.jpg", { type: "image/jpeg" });
        setFoto(converted);
        setPreview(URL.createObjectURL(converted));
        URL.revokeObjectURL(objectUrl);
      }, "image/jpeg", 0.85);
    };
    img.src = objectUrl;
  }

  async function handleEnviar() {
    if (modo === "foto" && !foto && !descricao) return;
    if (modo === "manual" && !descricao.trim()) return;
    if (!user) { window.location.href = "/login"; return; }

    setLoading(true);
    setStep(0);
    setErro(null);
    const userId = user.id;
    const supabase = createClient();
    let fotoUrl = null;

    if (foto) {
      const path = `${userId}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("refeicoes").upload(path, foto);
      if (!error) {
        const { data } = supabase.storage.from("refeicoes").getPublicUrl(path);
        fotoUrl = data.publicUrl;
      }
    }

    setStep(1);

    let analise: Resultado;
    try {
      const res = await fetch("/api/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotoUrl, descricao }),
      });
      if (!res.ok) {
        const text = await res.text();
        setErro(`Erro ${res.status}: ${text.slice(0, 200)}`);
        setLoading(false);
        return;
      }
      analise = await res.json();
    } catch {
      setErro("Falha na conexão. Verifique sua internet e tente novamente.");
      setLoading(false);
      return;
    }

    setStep(2);
    const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
    await supabase.from("refeicoes").insert({
      user_id: userId,
      foto_url: fotoUrl,
      descricao,
      data: hoje,
      calorias: analise.calorias,
      proteinas: analise.proteinas,
      carboidratos: analise.carboidratos,
      gorduras: analise.gorduras,
      feedback_ia: analise.feedback,
      dentro_do_plano: analise.dentro_do_plano,
    });
    await fetch("/api/atualizar-streak", { method: "POST" });

    setResultado(analise);
    setLoading(false);
  }

  /* ── Loading ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-8">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-[#f0f0f0]" />
          <div className="absolute inset-0 rounded-full border-4 border-[#16a34a] border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {step === 0 ? "📸" : step === 1 ? "🧠" : "✅"}
          </div>
        </div>
        <div className="space-y-2 w-full max-w-xs">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-all ${
                i < step ? "bg-[#16a34a] text-white" : i === step ? "bg-[#16a34a] text-white animate-pulse" : "bg-[#f0f0f0] text-[#ccc]"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[13px] font-medium transition-colors ${i <= step ? "text-[#111]" : "text-[#ccc]"}`}>{s}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#aaa]">Isso leva alguns segundos...</p>
      </div>
    );
  }

  /* ── Resultado ───────────────────────────────────────── */
  if (resultado) {
    const macros = [
      { label: "Proteínas", value: resultado.proteinas, unit: "g", color: "#3b82f6", emoji: "💪" },
      { label: "Carboidratos", value: resultado.carboidratos, unit: "g", color: "#f59e0b", emoji: "🌾" },
      { label: "Gorduras", value: resultado.gorduras, unit: "g", color: "#f97316", emoji: "🥑" },
    ];
    return (
      <div className="bg-[#fafafa] min-h-screen">
        <div className="bg-white px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
          <h1 className="text-2xl font-bold text-[#111] tracking-tight">Análise pronta</h1>
          <p className="text-xs text-[#999] mt-1 font-medium">Refeição registrada com sucesso</p>
        </div>

        <div className="px-4 pt-4 pb-8 space-y-3">
          {/* Status */}
          <div className={`rounded-[20px] p-5 ${resultado.dentro_do_plano ? "bg-[#f0fdf4] border border-[#bbf7d0]" : "bg-[#fffbeb] border border-[#fde68a]"}`}>
            <p className="text-[15px] font-bold mb-2 text-[#111]">
              {resultado.dentro_do_plano ? "✅ Dentro do plano!" : "⚠️ Atenção"}
            </p>
            <p className="text-[13px] text-[#444] leading-relaxed">{resultado.feedback}</p>
          </div>

          {/* Calorias destaque */}
          <div className="bg-[#111] rounded-[20px] p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#888] font-semibold uppercase tracking-widest mb-1">Calorias</p>
              <p className="text-[36px] font-extrabold text-white tracking-tight leading-none">{resultado.calorias.toLocaleString("pt-BR")}</p>
            </div>
            <span className="text-5xl">🔥</span>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-2">
            {macros.map((m) => (
              <div key={m.label} className="bg-white rounded-[16px] p-4 border border-[#f0f0f0] flex flex-col items-center gap-1">
                <span className="text-2xl">{m.emoji}</span>
                <p className="text-[18px] font-extrabold text-[#111]">{m.value}<span className="text-[12px] font-semibold text-[#aaa]">{m.unit}</span></p>
                <p className="text-[10px] text-[#aaa] font-semibold uppercase tracking-wide">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Preview foto se houver */}
          {preview && (
            <div className="rounded-[16px] overflow-hidden border border-[#f0f0f0]">
              <img src={preview} alt="refeição" className="w-full h-48 object-cover" />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { setResultado(null); setFoto(null); setPreview(null); setDescricao(""); }}
              className="flex-1 border border-[#e5e5e5] bg-white text-[#555] rounded-[14px] py-3.5 text-[13px] font-semibold"
            >
              Registrar outra
            </button>
            <button
              onClick={() => router.push("/app")}
              className="flex-1 bg-[#16a34a] text-white rounded-[14px] py-3.5 text-[13px] font-bold"
            >
              Ir para início
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Formulário ──────────────────────────────────────── */
  const podeEnviar = modo === "foto" ? (!!foto || !!descricao.trim()) : !!descricao.trim();

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="bg-white px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
        <h1 className="text-2xl font-bold text-[#111] tracking-tight">Registrar refeição</h1>
        <p className="text-xs text-[#999] mt-1 font-medium">Por foto ou descrição manual</p>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-4">
        {/* Toggle modo */}
        <div className="bg-white rounded-[16px] p-1.5 border border-[#f0f0f0] flex gap-1">
          {(["foto", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`flex-1 py-2.5 rounded-[12px] text-[13px] font-bold transition-all ${
                modo === m ? "bg-[#111] text-white shadow-sm" : "text-[#aaa]"
              }`}
            >
              {m === "foto" ? "📷 Por foto" : "✏️ Descrição"}
            </button>
          ))}
        </div>

        {/* Área foto */}
        {modo === "foto" && (
          <div
            onClick={() => fileRef.current?.click()}
            className={`rounded-[20px] h-52 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden border-2 ${
              preview ? "border-transparent" : "border-dashed border-[#d1fae5]"
            }`}
          >
            {preview ? (
              <div className="relative h-full w-full">
                <img src={preview} alt="preview" className="h-full w-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); setFoto(null); setPreview(null); setTimeout(() => fileRef.current?.click(), 50); }}
                  className="absolute top-3 right-3 bg-black/60 text-white text-[12px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm"
                >
                  Refazer
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-[#f0fdf4] flex items-center justify-center text-3xl">📷</div>
                <p className="text-[13px] font-semibold text-[#555]">Toque para tirar foto</p>
                <p className="text-[11px] text-[#aaa]">ou escolher da galeria</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFoto} className="hidden" />
          </div>
        )}

        {/* Descrição */}
        <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-2">
              {modo === "foto" ? "Complementar com descrição (opcional)" : "Descreva o que comeu"}
            </p>
          </div>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={modo === "manual" ? 5 : 3}
            className="w-full px-4 pb-4 text-[14px] text-[#111] focus:outline-none resize-none bg-transparent"
            placeholder={
              modo === "foto"
                ? "Ex: porção grande, comi tudo..."
                : "Ex: arroz integral 150g, frango grelhado 120g, salada com azeite..."
            }
          />
        </div>

        {modo === "manual" && (
          <div className="bg-[#f0fdf4] rounded-[16px] p-4 border border-[#bbf7d0]">
            <p className="text-[12px] text-[#166534] leading-relaxed">
              💡 Quanto mais detalhada a descrição (alimento + quantidade), mais precisa será a análise da IA.
            </p>
          </div>
        )}

        {erro && (
          <div className="bg-[#fff5f5] border border-[#fecaca] rounded-[16px] p-4 text-[13px] text-[#dc2626]">
            {erro}
          </div>
        )}

        <button
          onClick={handleEnviar}
          disabled={!podeEnviar}
          className="w-full bg-[#16a34a] text-white rounded-[14px] py-4 text-[14px] font-bold disabled:opacity-40 transition-opacity"
        >
          {modo === "foto" ? "🧠 Analisar refeição" : "🧠 Calcular nutrição"}
        </button>
      </div>
    </div>
  );
}
