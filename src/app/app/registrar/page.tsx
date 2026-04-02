"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";

export default function Registrar() {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    feedback: string;
    dentro_do_plano: boolean;
  } | null>(null);

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Converte para JPEG via canvas (resolve HEIC do iPhone e outros formatos)
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
    if (!foto && !descricao) return;
    setLoading(true);

    if (!user) { window.location.href = "/login"; return; }
    const supabase = createClient();

    let fotoUrl = null;

    if (foto) {
      const ext = foto.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("refeicoes")
        .upload(path, foto);
      if (!error) {
        const { data } = supabase.storage.from("refeicoes").getPublicUrl(path);
        fotoUrl = data.publicUrl;
      }
    }

    // Chama a API de análise
    const res = await fetch("/api/analisar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fotoUrl, descricao }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[registrar] API error:", res.status, text);
      setErro(`Erro ${res.status}: ${text.slice(0, 200)}`);
      setLoading(false);
      return;
    }

    const analise = await res.json();

    // Salva no banco
    const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
    await supabase.from("refeicoes").insert({
      user_id: user.id,
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

    // Atualiza fotos_hoje e streak
    await fetch("/api/atualizar-streak", { method: "POST" });

    setResultado(analise);
    setLoading(false);
  }

  if (resultado) {
    return (
      <div className="px-5 py-6 space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Análise da refeição</h1>

        <div className={`rounded-2xl p-5 border ${resultado.dentro_do_plano ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
          <p className="font-semibold mb-2 text-gray-800">
            {resultado.dentro_do_plano ? "✅ Dentro do plano!" : "⚠️ Atenção"}
          </p>
          <p className="text-sm text-gray-700">{resultado.feedback}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 grid grid-cols-2 gap-4">
          {[
            { label: "Calorias", value: `${resultado.calorias} kcal` },
            { label: "Proteínas", value: `${resultado.proteinas}g` },
            { label: "Carboidratos", value: `${resultado.carboidratos}g` },
            { label: "Gorduras", value: `${resultado.gorduras}g` },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/app")}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
        >
          Voltar para o início
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Registrar refeição</h1>

      {/* Foto */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-2xl h-52 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition"
      >
        {preview ? (
          <img src={preview} alt="preview" className="h-full w-full object-cover rounded-2xl" />
        ) : (
          <>
            <span className="text-4xl">📷</span>
            <p className="text-sm text-gray-400 mt-2">Toque para tirar ou escolher foto</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFoto}
          className="hidden"
        />
      </div>

      {/* Descrição */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Ou descreva o que comeu
        </label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          placeholder="Ex: arroz integral, frango grelhado, salada..."
        />
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {erro}
        </div>
      )}

      <button
        onClick={handleEnviar}
        disabled={loading || (!foto && !descricao)}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? "Analisando com IA..." : "Analisar refeição"}
      </button>
    </div>
  );
}
