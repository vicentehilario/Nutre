import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
  const { fotoUrl, descricao } = await req.json();

  // Cache lookup para consultas apenas de descrição (sem foto)
  let cacheHash: string | null = null;
  if (!fotoUrl && descricao?.trim()) {
    cacheHash = crypto.createHash("sha256").update(descricao.trim().toLowerCase()).digest("hex").slice(0, 32);
    const { data: cached } = await supabaseAdmin
      .from("analise_cache")
      .select("result")
      .eq("hash", cacheHash)
      .single();
    if (cached?.result) {
      return NextResponse.json(cached.result);
    }
  }

  const content: Anthropic.MessageParam["content"] = [];

  if (fotoUrl) {
    const imgRes = await fetch(fotoUrl);
    const buffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const ext = fotoUrl.split("?")[0].split(".").pop()?.toLowerCase();
    const extMap: Record<string, "image/jpeg" | "image/png" | "image/webp" | "image/gif"> = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif",
    };
    const mediaType = extMap[ext ?? ""] ?? "image/jpeg";

    content.push({
      type: "image",
      source: { type: "base64", media_type: mediaType, data: base64 },
    });
  }

  const texto = descricao
    ? `Analise esta refeição: ${descricao}`
    : "Analise a refeição na imagem.";

  content.push({ type: "text", text: texto });

  const systemPrompt = `Você é o nutricionista Vicente Hilário (@nutri_vicentehilario), conhecido como "O Frutífero". Você responde exatamente como Vicente responderia a um paciente.

FILOSOFIA E FORMA DE FALAR:
- Sua frase central: "Você pode comer de tudo, não tudo." Flexibilidade com coerência.
- Você é direto, sem rodeios, com um humor seco e natural. Fala como brasileiro mesmo, sem formalidade.
- Nunca gera culpa. Erros acontecem, o que importa é o padrão geral, não uma refeição isolada.
- Foco em consistência, não em perfeição.
- Sempre verifica a aderência ao plano antes de sugerir mudanças.
- Composição corporal e como a roupa está vestindo valem mais que o número na balança.

MÉTODO:
- Volume e saciedade são centrais: sempre que possível, sugere adicionar volume (salada, frutas, fibras) para render mais a refeição.
- Substituições sempre com equivalências calóricas (100g arroz = 40g tapioca = 1 pão).
- Calorias invisíveis (beliscadas, gordura no preparo, molhos) são os maiores sabotadores.
- Whey antes de refeições mais calóricas ajuda a amortecer o impacto.
- Docinho sempre após refeição grande, nunca avulso — o volume da refeição principal aumenta a saciedade.

FEEDBACK DE REFEIÇÕES:
- Se a refeição for equilibrada: elogie de forma genuína e prática.
- Se tiver algo fora do padrão: aponte de forma leve, sem drama, e dê uma dica prática.
- Nunca diga que uma refeição "destruiu" o plano. Uma refeição não define nada.
- Exemplos do seu jeito de falar: "Boa escolha!", "Só capricha na salada na próxima!", "Tá no caminho certo.", "Isso aqui tá show, continua assim."

Ao analisar uma refeição, responda SOMENTE com JSON válido neste formato:
{
  "calorias": número estimado,
  "proteinas": número em gramas,
  "carboidratos": número em gramas,
  "gorduras": número em gramas,
  "dentro_do_plano": true ou false (considere dentro do plano se for uma refeição equilibrada),
  "feedback": "mensagem curta no estilo do Vicente, máximo 2 frases, sem culpa"
}`;

  let msg;
  try {
    msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    });
  } catch (imgErr: unknown) {
    // Se falhou por causa da imagem, tenta só com texto
    const errMsg = String(imgErr);
    if (errMsg.includes("Could not process image") || errMsg.includes("invalid_request_error")) {
      const textOnlyContent = content.filter((c) => c.type === "text");
      msg = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: textOnlyContent }],
      });
    } else {
      throw imgErr;
    }
  }

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";

  try {
    const json = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
    // Salva no cache se foi consulta por descrição
    if (cacheHash) {
      await supabaseAdmin.from("analise_cache").upsert({ hash: cacheHash, result: json });
    }
    return NextResponse.json(json);
  } catch (parseErr) {
    return NextResponse.json({
      calorias: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0,
      dentro_do_plano: true,
      feedback: "Não consegui analisar essa refeição, tente descrever o que comeu.",
    });
  }
  } catch (err) {
    console.error("[analisar] erro:", err);
    return NextResponse.json(
      { error: String(err), calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, dentro_do_plano: true, feedback: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
