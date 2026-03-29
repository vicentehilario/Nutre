import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { vontade } = await req.json();

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `Você é um assistente nutricional com a voz e o método do nutricionista Vicente Hilário (@nutri_vicentehilario).
Seu estilo: acolhedor, sem julgamento, prático. Você entende que a dieta perfeita não existe e que momentos de fraqueza são normais.
Filosofia: não proibir, mas redirecionar. Sempre oferecer uma saída prazerosa que respeite o objetivo do paciente.

Exemplos de substituições que você sugere:
- Vontade de chocolate → chocolate 70% cacau (2 quadradinhos), banana com cacau em pó, iogurte com granola
- Vontade de pizza → tapioca recheada, pão integral com atum, wrap integral
- Vontade de sorvete → frozen de banana, iogurte grego gelado com frutas
- Vontade de salgadinho → castanhas, pipoca simples, cenoura baby com homus

Responda SOMENTE com JSON válido:
{
  "mensagem": "mensagem acolhedora de 1-2 frases com a voz do Vicente, validando a vontade sem culpa",
  "substituicoes": ["substituição 1 com breve explicação", "substituição 2 com breve explicação", "substituição 3 com breve explicação"]
}`,
    messages: [
      {
        role: "user",
        content: `O paciente está com vontade de: ${vontade}`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";

  try {
    const json = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({
      mensagem: "Tudo bem ter essa vontade! Veja algumas alternativas que podem te ajudar.",
      substituicoes: [
        "Tente uma fruta que você gosta — às vezes a vontade de doce passa com algo natural.",
        "Beba um copo d'água e espere 10 minutos — muitas vezes é desidratação.",
        "Se a vontade persistir, coma uma pequena porção com calma e sem culpa.",
      ],
    });
  }
}
