"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";

interface MetasData {
  meta_calorica: number;
  meta_proteina: number;
  objetivo: string;
  refeicoes_por_dia: number;
  plano_pdf_importado_em: string | null;
  plano_origem: string;
  get_kcal: number | null;
  bmr_kcal: number | null;
  sexo: string | null;
  idade: number | null;
  altura_cm: number | null;
  peso_kg: number | null;
  nivel_atividade: string | null;
}

const ACTIVITY_OPTIONS = [
  { value: "sedentario",  label: "Sedentário",          mult: 1.2   },
  { value: "leve",        label: "Levemente ativo",     mult: 1.375 },
  { value: "moderado",    label: "Moderadamente ativo", mult: 1.55  },
  { value: "muito_ativo", label: "Muito ativo",         mult: 1.725 },
];

function calcGet(sexo: string, peso: number, altura: number, idade: number, atividade: string) {
  const bmr = sexo === "masculino"
    ? 88.36 + 13.4 * peso + 5.7 * altura - 5.4 * idade
    : 447.6 + 9.25 * peso + 3.1 * altura - 4.3 * idade;
  const mult = ACTIVITY_OPTIONS.find((a) => a.value === atividade)?.mult ?? 1.55;
  return { bmr: Math.round(bmr), get: Math.round(bmr * mult) };
}

const objetivoLabel: Record<string, string> = {
  perda_de_peso: "Perda de peso",
  manutencao: "Manutenção",
  ganho_de_massa: "Ganho de massa",
};

const dicas: Record<string, string> = {
  perda_de_peso: "Déficit calórico é a base da perda de peso. Registra tudo, inclusive os pequenos beliscos — eles somam mais do que parece.",
  manutencao: "Manutenção exige consistência. Registra tudo, mesmo nos dias que parece que comeu pouco — as calorias invisíveis aparecem quando você anota.",
  ganho_de_massa: "Ganho de massa sem controle vira acúmulo de gordura. Bate a meta calórica, prioriza proteína e registra pra garantir que tá no caminho.",
};

const dicasPdf: Record<string, string> = {
  perda_de_peso: "Esse plano foi montado especificamente pra você. Segue as metas, registra as refeições e acompanha seu saldo diário aqui no app.",
  manutencao: "Esse plano foi feito pra você manter o peso com qualidade. Registra tudo e acompanha se tá batendo as metas.",
  ganho_de_massa: "Esse plano foi prescrito pra você ganhar massa com controle. Bate a meta calórica e proteica todo dia, sem exceção.",
};

export default function Metas() {
  const { user, loading: authLoading } = useAuth();
  const [metas, setMetas] = useState<MetasData>({
    meta_calorica: 2000,
    meta_proteina: 120,
    objetivo: "perda_de_peso",
    refeicoes_por_dia: 4,
    plano_pdf_importado_em: null,
    plano_origem: "manual",
    get_kcal: null,
    bmr_kcal: null,
    sexo: null,
    idade: null,
    altura_cm: null,
    peso_kg: null,
    nivel_atividade: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfErro, setPdfErro] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Recalcular GET
  const [showRecalc, setShowRecalc] = useState(false);
  const [recSexo, setRecSexo] = useState("masculino");
  const [recIdade, setRecIdade] = useState("");
  const [recAltura, setRecAltura] = useState("");
  const [recPeso, setRecPeso] = useState("");
  const [recAtividade, setRecAtividade] = useState("moderado");
  const [recSaving, setRecSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { window.location.href = "/login"; return; }
    const userId = user.id;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("meta_calorica, meta_proteina, objetivo, refeicoes_por_dia, plano_pdf_importado_em, plano_origem, get_kcal, bmr_kcal, sexo, idade, altura_cm, peso_kg, nivel_atividade")
        .eq("id", userId)
        .single();

      if (data) {
        setMetas((prev) => ({ ...prev, ...data }));
        if (data.sexo) setRecSexo(data.sexo);
        if (data.idade) setRecIdade(String(data.idade));
        if (data.altura_cm) setRecAltura(String(data.altura_cm));
        if (data.peso_kg) setRecPeso(String(data.peso_kg));
        if (data.nivel_atividade) setRecAtividade(data.nivel_atividade);
      }
      setLoading(false);
    }
    load();
  }, [user, authLoading]);

  async function salvar() {
    if (!user) return;
    const userId = user.id;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      meta_calorica: metas.meta_calorica,
      meta_proteina: metas.meta_proteina,
      objetivo: metas.objetivo,
      refeicoes_por_dia: metas.refeicoes_por_dia,
    }).eq("id", userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handlePdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfLoading(true);
    setPdfErro(null);

    try {
      const form = new FormData();
      form.append("pdf", file);

      const res = await fetch("/api/importar-plano", { method: "POST", body: form });

      let json: Record<string, unknown> = {};
      try {
        json = await res.json();
      } catch {
        setPdfErro("O servidor retornou uma resposta inesperada. Tente novamente.");
        setPdfLoading(false);
        return;
      }

      if (!res.ok) {
        setPdfErro((json.error as string) ?? "Erro ao importar. Tente novamente.");
      } else {
        setMetas((prev) => ({
          ...prev,
          meta_calorica: (json.meta_calorica as number) ?? prev.meta_calorica,
          meta_proteina: (json.meta_proteina as number) ?? prev.meta_proteina,
          objetivo: (json.objetivo as string) ?? prev.objetivo,
          refeicoes_por_dia: (json.refeicoes_por_dia as number) ?? prev.refeicoes_por_dia,
          plano_pdf_importado_em: new Date().toISOString(),
          plano_origem: "pdf",
        }));
      }
    } catch {
      setPdfErro("Falha na conexão. Verifique sua internet e tente novamente.");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleRecalcularGet() {
    if (!user) return;
    const p = parseFloat(recPeso);
    const a = parseFloat(recAltura);
    const i = parseInt(recIdade);
    if (!p || !a || !i) return;
    setRecSaving(true);
    const { bmr, get } = calcGet(recSexo, p, a, i, recAtividade);
    const metaMap: Record<string, number> = {
      perda_de_peso:  Math.max(1200, get - 500),
      manutencao:     get,
      ganho_de_massa: get + 300,
    };
    const novaCaloria = metaMap[metas.objetivo] ?? get;
    const novaProteina = Math.round(p * (metas.objetivo === "ganho_de_massa" ? 2.2 : metas.objetivo === "perda_de_peso" ? 2.0 : 1.7));
    const supabase = createClient();
    await supabase.from("profiles").update({
      sexo: recSexo, idade: i, altura_cm: a, peso_kg: p,
      nivel_atividade: recAtividade, bmr_kcal: bmr, get_kcal: get,
      meta_calorica: novaCaloria, meta_proteina: novaProteina,
    }).eq("id", user.id);
    setMetas((prev) => ({
      ...prev,
      sexo: recSexo, idade: i, altura_cm: a, peso_kg: p,
      nivel_atividade: recAtividade, bmr_kcal: bmr, get_kcal: get,
      meta_calorica: novaCaloria, meta_proteina: novaProteina,
    }));
    setRecSaving(false);
    setShowRecalc(false);
  }

  async function limparPdf() {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("profiles").update({
      plano_origem: "manual",
      plano_pdf_importado_em: null,
    }).eq("id", user.id);
    setMetas((prev) => ({ ...prev, plano_origem: "manual", plano_pdf_importado_em: null }));
  }

  function step(field: "meta_calorica" | "meta_proteina", delta: number) {
    setMetas((prev) => ({ ...prev, [field]: Math.max(0, prev[field] + delta) }));
  }

  const pdfImportado = metas.plano_origem === "pdf" && metas.plano_pdf_importado_em;
  const dataImportacao = pdfImportado
    ? new Date(metas.plano_pdf_importado_em!).toLocaleDateString("pt-BR")
    : null;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-[#999] text-sm">Carregando...</p></div>;
  }

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
        <h1 className="text-2xl font-bold text-[#111] tracking-tight">Suas metas</h1>
        <p className="text-xs text-[#999] mt-1 font-medium">Configure o que você quer alcançar</p>
      </div>

      <div className="px-4 pt-4 space-y-3 pb-6">

        {/* Banner plano importado */}
        {pdfImportado && (
          <div className="bg-[#111] rounded-[20px] p-4 flex items-center gap-3.5">
            <span className="text-2xl">🥗</span>
            <div>
              <p className="text-[13px] font-bold text-white">Plano prescrito pelo Vicente</p>
              <p className="text-[11px] text-[#888] mt-0.5">Importado em {dataImportacao} · PDF da consulta</p>
              <span className="inline-block mt-1.5 text-[10px] font-bold text-[#22c55e] bg-[rgba(34,197,94,0.15)] px-2 py-0.5 rounded-full">
                ✓ Metas sincronizadas
              </span>
            </div>
          </div>
        )}

        {/* Card GET / Harris-Benedict */}
        <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-widest mb-1">Gasto energético total (GET)</p>
                {metas.get_kcal ? (
                  <>
                    <p className="text-[26px] font-extrabold text-[#111] leading-none">{metas.get_kcal.toLocaleString("pt-BR")} kcal</p>
                    <p className="text-[11px] text-[#aaa] mt-1">
                      BMR: {metas.bmr_kcal?.toLocaleString("pt-BR") ?? "—"} kcal ·{" "}
                      {metas.peso_kg}kg · {metas.altura_cm}cm · {metas.idade} anos
                    </p>
                  </>
                ) : (
                  <p className="text-[14px] text-[#aaa] mt-1">Não calculado ainda</p>
                )}
              </div>
              <div className="w-11 h-11 rounded-full bg-[#f0fdf4] flex items-center justify-center text-xl flex-shrink-0">⚡</div>
            </div>
            <button
              onClick={() => setShowRecalc((v) => !v)}
              className="text-[12px] font-bold text-[#16a34a]"
            >
              {showRecalc ? "Fechar ▲" : (metas.get_kcal ? "Atualizar dados físicos ▼" : "Calcular agora ▼")}
            </button>
          </div>

          {showRecalc && (
            <div className="border-t border-[#f5f5f5] px-5 pb-5 pt-4 space-y-4">
              {/* Sexo */}
              <div className="grid grid-cols-2 gap-2">
                {[{ v: "masculino", l: "Masculino" }, { v: "feminino", l: "Feminino" }].map((s) => (
                  <button
                    key={s.v}
                    onClick={() => setRecSexo(s.v)}
                    className={`py-2.5 rounded-[12px] text-[13px] font-bold border-2 transition-all ${recSexo === s.v ? "border-[#16a34a] bg-[#f0fdf4] text-[#15803d]" : "border-[#f0f0f0] text-[#555]"}`}
                  >
                    {s.l}
                  </button>
                ))}
              </div>
              {/* Dados numéricos */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Idade", val: recIdade, set: setRecIdade, unit: "anos", ph: "25" },
                  { label: "Altura", val: recAltura, set: setRecAltura, unit: "cm", ph: "170" },
                  { label: "Peso", val: recPeso, set: setRecPeso, unit: "kg", ph: "70" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[10px] text-[#aaa] font-semibold uppercase tracking-wide mb-1">{f.label}</p>
                    <div className="relative">
                      <input
                        type="number" inputMode="decimal" value={f.val}
                        onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                        className="w-full border border-[#e5e5e5] rounded-[10px] px-2 py-2.5 text-[14px] font-semibold text-[#111] focus:outline-none focus:border-[#16a34a] pr-8"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#bbb]">{f.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Atividade */}
              <div>
                <p className="text-[10px] text-[#aaa] font-semibold uppercase tracking-wide mb-2">Nível de atividade</p>
                <div className="space-y-1.5">
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRecAtividade(opt.value)}
                      className={`w-full text-left rounded-[10px] px-3 py-2.5 border-2 transition-all text-[12px] font-semibold ${recAtividade === opt.value ? "border-[#16a34a] bg-[#f0fdf4] text-[#15803d]" : "border-[#f0f0f0] text-[#555]"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Preview cálculo */}
              {recPeso && recAltura && recIdade && (
                <div className="bg-[#f5f5f5] rounded-[12px] p-3">
                  {(() => {
                    const p = parseFloat(recPeso), a = parseFloat(recAltura), i = parseInt(recIdade);
                    if (!p || !a || !i) return null;
                    const { bmr, get } = calcGet(recSexo, p, a, i, recAtividade);
                    const metaMap: Record<string, number> = { perda_de_peso: Math.max(1200, get - 500), manutencao: get, ganho_de_massa: get + 300 };
                    return (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[12px]">
                          <span className="text-[#888]">BMR (metabolismo basal)</span>
                          <span className="font-bold text-[#111]">{bmr.toLocaleString("pt-BR")} kcal</span>
                        </div>
                        <div className="flex justify-between text-[12px]">
                          <span className="text-[#888]">GET (gasto total)</span>
                          <span className="font-bold text-[#111]">{get.toLocaleString("pt-BR")} kcal</span>
                        </div>
                        <div className="flex justify-between text-[12px] pt-1 border-t border-[#e5e5e5] mt-1">
                          <span className="text-[#888]">Nova meta calórica</span>
                          <span className="font-extrabold text-[#16a34a]">{(metaMap[metas.objetivo] ?? get).toLocaleString("pt-BR")} kcal</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              <button
                onClick={handleRecalcularGet}
                disabled={recSaving || !recPeso || !recAltura || !recIdade}
                className="w-full bg-[#16a34a] text-white rounded-[12px] py-3 text-[13px] font-bold disabled:opacity-40"
              >
                {recSaving ? "Salvando..." : "Atualizar GET e meta calórica"}
              </button>
            </div>
          )}
        </div>

        {/* Meta calórica */}
        <div className="bg-white rounded-[20px] p-5 border border-[#f0f0f0]">
          <p className="text-[11px] text-[#999] font-semibold uppercase tracking-widest mb-2.5">
            Meta calórica {pdfImportado ? "prescrita" : "diária"}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <div className={`flex-1 rounded-xl px-4 py-3.5 text-[22px] font-extrabold text-center ${pdfImportado ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#f5f5f5] text-[#111]"}`}>
              {metas.meta_calorica.toLocaleString("pt-BR")}
            </div>
            <span className="text-[14px] text-[#aaa] font-semibold">kcal</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {([-100, -50, 50, 100] as const).map((d) => (
              <button
                key={d}
                onClick={() => step("meta_calorica", d)}
                className="bg-[#f5f5f5] rounded-xl py-2.5 text-[14px] font-bold text-[#555] text-center"
              >
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
          </div>
          {pdfImportado && (
            <p className="text-[11px] text-[#aaa] text-center">
              Definido pelo seu plano ·{" "}
              <button
                onClick={() => setMetas((p) => ({ ...p, plano_origem: "manual" }))}
                className="text-[#16a34a] font-semibold"
              >
                Alterar manualmente
              </button>
            </p>
          )}
        </div>

        {/* Outras metas */}
        <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
          <div className="flex justify-between items-center px-4.5 py-4 border-b border-[#f5f5f5]" style={{ padding: "16px 18px" }}>
            <span className="text-[14px] font-semibold text-[#111]">Meta de proteína</span>
            <div className="flex items-center gap-2">
              <button onClick={() => step("meta_proteina", -10)} className="text-[#aaa] text-lg font-bold px-1">−</button>
              <span className="text-[14px] font-bold text-[#16a34a] min-w-[48px] text-center">{metas.meta_proteina}g</span>
              <button onClick={() => step("meta_proteina", 10)} className="text-[#aaa] text-lg font-bold px-1">+</button>
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-[#f5f5f5]" style={{ padding: "16px 18px" }}>
            <span className="text-[14px] font-semibold text-[#111]">Objetivo</span>
            <select
              value={metas.objetivo}
              onChange={(e) => setMetas((p) => ({ ...p, objetivo: e.target.value }))}
              className="text-[14px] font-bold text-[#16a34a] bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="perda_de_peso">Perda de peso</option>
              <option value="manutencao">Manutenção</option>
              <option value="ganho_de_massa">Ganho de massa</option>
            </select>
          </div>
          <div className="flex justify-between items-center" style={{ padding: "16px 18px" }}>
            <span className="text-[14px] font-semibold text-[#111]">Refeições por dia</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setMetas((p) => ({ ...p, refeicoes_por_dia: Math.max(1, p.refeicoes_por_dia - 1) }))} className="text-[#aaa] text-lg font-bold px-1">−</button>
              <span className="text-[14px] font-bold text-[#16a34a] min-w-[32px] text-center">{metas.refeicoes_por_dia}</span>
              <button onClick={() => setMetas((p) => ({ ...p, refeicoes_por_dia: p.refeicoes_por_dia + 1 }))} className="text-[#aaa] text-lg font-bold px-1">+</button>
            </div>
          </div>
        </div>

        {/* Dica do Vicente */}
        <div className="bg-[#f0fdf4] rounded-[18px] p-4 border border-[#bbf7d0]">
          <p className="text-[12px] font-bold text-[#16a34a] mb-1">💡 {pdfImportado ? "Do Vicente" : "Dica do Vicente"}</p>
          <p className="text-[12px] text-[#166534] leading-relaxed">
            {pdfImportado
              ? (dicasPdf[metas.objetivo] ?? dicasPdf.manutencao)
              : (dicas[metas.objetivo] ?? dicas.manutencao)}
          </p>
        </div>

        {/* Botão salvar — salva todas as metas */}
        <button
          onClick={salvar}
          disabled={saving}
          className="w-full bg-[#16a34a] text-white rounded-[14px] py-3.5 text-[14px] font-bold disabled:opacity-60"
        >
          {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar todas as metas"}
        </button>

        {/* Divisor */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-[#e5e5e5]" />
          <span className="text-[11px] text-[#bbb] font-semibold uppercase tracking-widest">ou</span>
          <div className="flex-1 h-px bg-[#e5e5e5]" />
        </div>

        {/* PDF import */}
        <div className="bg-white rounded-[20px] border-2 border-dashed border-[#d1fae5] p-5 flex flex-col items-center gap-2 text-center">
          <span className="text-3xl">📄</span>
          <p className="text-[14px] font-bold text-[#111] leading-snug">
            {pdfImportado ? "Atualizar plano prescrito" : "Já tem sua dieta montada pelo Vicente?"}
          </p>
          <p className="text-xs text-[#aaa] leading-relaxed">
            {pdfImportado
              ? "Importe um PDF novo para atualizar suas metas automaticamente."
              : "Importe o PDF da sua prescrição e suas metas são preenchidas automaticamente."}
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={pdfLoading}
            className="mt-2 w-full bg-[#111] text-white rounded-[14px] py-3 text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {pdfLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Lendo seu plano...</span>
              </>
            ) : (
              <>
                <span>📎</span>
                <span>{pdfImportado ? "Atualizar PDF" : "Importar minha dieta"}</span>
              </>
            )}
          </button>
          {pdfErro && <p className="text-xs text-[#e11d48] mt-1">{pdfErro}</p>}
          <p className="text-[11px] text-[#bbb]">Suporta PDF · O app lê e configura tudo pra você</p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdf}
            className="hidden"
          />
        </div>

        {/* Botão remover plano PDF — só aparece se importado */}
        {pdfImportado && (
          <button
            onClick={limparPdf}
            className="w-full border border-[#fecaca] bg-[#fff5f5] text-[#dc2626] rounded-[14px] py-3 text-[13px] font-semibold"
          >
            Remover plano importado
          </button>
        )}

      </div>
    </div>
  );
}
