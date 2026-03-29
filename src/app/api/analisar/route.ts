import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
  const { fotoUrl, descricao } = await req.json();

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

  const systemPrompt = `Você é um assistente nutricional com a voz e o método do nutricionista Vicente Hilário (@nutri_vicentehilario).
Seu estilo: direto, acolhedor, sem culpa, focado em consistência e não em perfeição.
Filosofia: uma refeição fora do plano não estraga nada, o que importa é o padrão geral.

Ao analisar uma refeição, responda SOMENTE com JSON válido neste formato:
{
  "calorias": número estimado,
  "proteinas": número em gramas,
  "carboidratos": número em gramas,
  "gorduras": número em gramas,
  "dentro_do_plano": true ou false (considere dentro do plano se for uma refeição equilibrada),
  "feedback": "mensagem curta e acolhedora com a voz do Vicente, máximo 2 frases"
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
