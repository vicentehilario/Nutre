import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("pdf") as File | null;
  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
          } as Anthropic.DocumentBlockParam,
          {
            type: "text",
            text: `Analise este plano nutricional prescrito por um nutricionista e extraia as metas diárias totais.

PASSO 1 — Procure um "Relatório de nutrientes" ou tabela de totais no PDF. Se existir, use os valores direto.

PASSO 2 — Se NÃO existir relatório, some manualmente todas as refeições do dia (café, almoço, lanches, jantar, ceia) usando as quantidades e alimentos listados para estimar calorias e proteína total.

Regras para classificar o objetivo:
- Se calorias < 1800 ou há déficit claro → "perda_de_peso"
- Se calorias entre 1800-2400 sem foco em ganho → "manutencao"
- Se calorias > 2400 ou foco em ganho de massa → "ganho_de_massa"

Responda SOMENTE com JSON válido, sem markdown, sem explicações:
{
  "meta_calorica": número inteiro de kcal diárias totais,
  "meta_proteina": número inteiro de gramas de proteína diária,
  "refeicoes_por_dia": número inteiro de refeições distintas no plano,
  "objetivo": "perda_de_peso" | "manutencao" | "ganho_de_massa"
}`,
          },
        ],
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";

  let extracted: Record<string, unknown>;
  try {
    extracted = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o PDF. Tente um arquivo com texto selecionável." }, { status: 422 });
  }

  const { error } = await supabase.from("profiles").update({
    meta_calorica: Number(extracted.meta_calorica) || 2000,
    meta_proteina: Number(extracted.meta_proteina) || 120,
    refeicoes_por_dia: Number(extracted.refeicoes_por_dia) || 4,
    objetivo: extracted.objetivo || "manutencao",
    plano_pdf_importado_em: new Date().toISOString(),
    plano_origem: "pdf",
  }).eq("id", session.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(extracted);
}
