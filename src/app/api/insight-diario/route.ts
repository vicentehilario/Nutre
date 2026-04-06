import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("insight_diario, insight_gerado_em, meta_calorica, meta_proteina, objetivo, nome")
    .eq("id", user.id)
    .single();

  // Return cached insight if generated today
  if (profile?.insight_gerado_em === hoje && profile?.insight_diario) {
    return NextResponse.json({ insight: profile.insight_diario });
  }

  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const dataInicio = seteDiasAtras.toISOString().split("T")[0];

  const { data: refeicoes } = await supabaseAdmin
    .from("refeicoes")
    .select("calorias, proteinas, data")
    .eq("user_id", user.id)
    .gte("data", dataInicio)
    .lte("data", hoje);

  const nome = profile?.nome?.split(" ")[0] ?? "você";
  const meta = profile?.meta_calorica ?? 2000;
  const metaProt = profile?.meta_proteina ?? 120;
  const objetivo = profile?.objetivo ?? "manutencao";
  const objetivoMap: Record<string, string> = {
    perda_de_peso: "perda de peso",
    manutencao: "manutenção",
    ganho_de_massa: "ganho de massa",
  };

  let insight: string;

  if (!refeicoes || refeicoes.length === 0) {
    insight = "Ei, começa a registrar suas refeições hoje! Sem dados não tem como saber se tá no caminho certo.";
  } else {
    const diasAtivos = new Set(refeicoes.map((r) => r.data)).size;
    const mediaCal = Math.round(refeicoes.reduce((s, r) => s + (r.calorias ?? 0), 0) / 7);
    const mediaProt = Math.round(refeicoes.reduce((s, r) => s + (r.proteinas ?? 0), 0) / 7);
    const diffCal = mediaCal - meta;
    const diffProt = mediaProt - metaProt;

    const prompt = `Você é o nutricionista Vicente Hilário. Gere UMA dica diária personalizada para ${nome} com base nos dados reais da semana.

Dados:
- Dias registrados: ${diasAtivos}/7
- Média calórica vs meta: ${diffCal > 0 ? "+" : ""}${diffCal} kcal/dia
- Média de proteína vs meta: ${diffProt > 0 ? "+" : ""}${diffProt}g/dia
- Objetivo: ${objetivoMap[objetivo] ?? objetivo}

Regras:
- Máximo 2 frases, direta e prática
- Sem culpa, tom natural brasileiro do Vicente
- Foque no ponto mais crítico dos dados (consistência, proteína ou calorias)
- Não cite números exatos
- Responda SOMENTE o texto da dica, sem aspas nem formatação`;

    try {
      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 120,
        messages: [{ role: "user", content: prompt }],
      });
      insight = msg.content[0].type === "text"
        ? msg.content[0].text.trim()
        : "Continua registrando — é o único jeito de ter controle real da sua alimentação.";
    } catch {
      insight = "Continua registrando — é o único jeito de ter controle real da sua alimentação.";
    }
  }

  await supabaseAdmin.from("profiles").update({
    insight_diario: insight,
    insight_gerado_em: hoje,
  }).eq("id", user.id);

  return NextResponse.json({ insight });
}
