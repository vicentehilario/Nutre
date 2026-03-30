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
            text: `Analise este plano nutricional prescrito. Extraia as seguintes informações e responda SOMENTE com JSON válido:
{
  "meta_calorica": número total de calorias diárias prescritas (inteiro),
  "meta_proteina": gramas de proteína diária prescritas (inteiro),
  "refeicoes_por_dia": número de refeições por dia (inteiro),
  "objetivo": um de "perda_de_peso" | "manutencao" | "ganho_de_massa"
}
Se não encontrar algum valor com clareza, use os padrões: meta_calorica 2000, meta_proteina 120, refeicoes_por_dia 4, objetivo "manutencao".`,
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
