import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
  // Verificar autenticação
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Verificar limite de análises para plano grátis
  const { data: profileData } = await supabaseAdmin
    .from("profiles")
    .select("plano, fotos_hoje")
    .eq("id", user.id)
    .single();

  if (profileData?.plano === "gratis" && (profileData?.fotos_hoje ?? 0) >= 2) {
    return NextResponse.json(
      { error: "Limite de análises atingido. Faça upgrade para continuar." },
      { status: 403 }
    );
  }

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

ALIMENTOS INDUSTRIALIZADOS — VALORES DE REFERÊNCIA (use estes dados para estimativas precisas):

BARRINHAS DE PROTEÍNA (por unidade, ~60g):
- Bold Bar (Bold Snacks): 210kcal, 20g proteína, 21g carb, 7g gordura
- Darkness Protein Bar (IntegralMédica): 195kcal, 20g proteína, 18g carb, 6g gordura
- Protein Bar (IntegralMédica): 200kcal, 20g proteína, 20g carb, 6g gordura
- Crispy Bar (Probiótica): 185kcal, 15g proteína, 20g carb, 5g gordura
- Whey Bar (Body Action): 190kcal, 15g proteína, 22g carb, 5g gordura
- Nutri Bar Protein (BRF): 190kcal, 15g proteína, 20g carb, 6g gordura
- UP! Protein Bar (UP!): 200kcal, 20g proteína, 18g carb, 7g gordura
- Barrinha genérica de proteína (~60g): estime ~190-210kcal, 15-20g proteína

BARRINHAS COMUNS (não proteicas, por unidade ~25g):
- Nutry (Nestle): 90kcal, 1g proteína, 18g carb, 2g gordura
- Quaker Cereal Bar: 85kcal, 1g proteína, 17g carb, 2g gordura
- Belvita (Lacta): 130kcal, 2g proteína, 22g carb, 4g gordura

IOGURTES (por unidade/pote):
- Grego integral (170g): 190kcal, 17g proteína, 9g carb, 9g gordura
- Grego zero lactose (170g): 150kcal, 15g proteína, 10g carb, 5g gordura
- Whey Grego (170g): 160kcal, 20g proteína, 12g carb, 3g gordura
- Iogurte natural integral (200g): 120kcal, 8g proteína, 10g carb, 4g gordura

QUEIJOS (por fatia/porção 30g):
- Mussarela: 80kcal, 6g proteína, 0g carb, 6g gordura
- Prato: 85kcal, 6g proteína, 0g carb, 7g gordura
- Cottage (100g): 100kcal, 12g proteína, 3g carb, 4g gordura

FRIOS (por fatia ~15g):
- Peito de peru: 20kcal, 4g proteína, 0g carb, 0.5g gordura
- Presunto: 25kcal, 3g proteína, 0g carb, 1g gordura
- Blanquet de peru: 18kcal, 3g proteína, 0g carb, 0.5g gordura

PÃO DE FORMA (por fatia ~25g):
- Pão branco tradicional: 65kcal, 2g proteína, 13g carb, 0.8g gordura
- Pão integral: 60kcal, 2.5g proteína, 11g carb, 1g gordura

BISCOITOS (por porção ~30g / ~4-6 unidades):
- Cream Cracker: 130kcal, 3g proteína, 20g carb, 4g gordura
- Bolacha Maria: 130kcal, 2g proteína, 23g carb, 3.5g gordura
- Biscoito recheado (Oreo, etc.): 150kcal, 1.5g proteína, 22g carb, 7g gordura

FAST-FOOD (por item):
- X-burguer McDonald's: 300kcal, 15g proteína, 32g carb, 12g gordura
- Big Mac: 490kcal, 27g proteína, 44g carb, 25g gordura
- McFritas M: 320kcal, 4g proteína, 44g carb, 15g gordura
- Whopper (BK): 630kcal, 29g proteína, 47g carb, 37g gordura
- Pizza convencional (fatia ~120g): 280kcal, 13g proteína, 30g carb, 12g gordura

BEBIDAS:
- Whey protein (30g pó + 200ml água): 120kcal, 24g proteína, 3g carb, 2g gordura
- Achocolatado Toddynho (200ml): 130kcal, 5g proteína, 23g carb, 2.5g gordura
- Suco de laranja natural (200ml): 80kcal, 1g proteína, 19g carb, 0g gordura
- Refrigerante cola lata 350ml: 140kcal, 0g proteína, 37g carb, 0g gordura
- Cerveja long neck 355ml: 150kcal, 1g proteína, 13g carb, 0g gordura

Quando o usuário mencionar qualquer produto industrializado não listado, estime com base nos valores mais similares acima. Sempre use o peso/porção informado para ajustar os cálculos.

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
