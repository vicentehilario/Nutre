import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TAG_MAP: Record<string, string[]> = {
  proteico: ["proteico"],
  proteína: ["proteico"],
  "whey": ["proteico", "pos-treino"],
  leve: ["leve"],
  light: ["leve"],
  doce: ["doce"],
  "docinho fit": ["doce"],
  chocolate: ["doce"],
  rápido: ["rapido"],
  rapido: ["rapido"],
  prático: ["simples", "rapido"],
  simples: ["simples"],
  "fácil": ["simples"],
  "pos-treino": ["pos-treino"],
  "pós-treino": ["pos-treino"],
  treino: ["pos-treino"],
  "café da manhã": ["cafe-da-manha"],
  "cafe-da-manha": ["cafe-da-manha"],
  café: ["cafe-da-manha"],
  manhã: ["cafe-da-manha"],
  salgado: ["salgado"],
  "baixo-carb": ["baixo-carb"],
  "low carb": ["baixo-carb"],
  vegetariano: ["vegetariano"],
  vegan: ["vegan"],
  lanche: ["lanche"],
  bebida: ["bebida"],
  shake: ["bebida", "pos-treino"],
  smoothie: ["bebida"],
  vitamina: ["bebida"],
};

function extractTags(contexto: string): string[] {
  if (!contexto) return [];
  const lower = contexto.toLowerCase();
  const found = new Set<string>();
  for (const [keyword, tags] of Object.entries(TAG_MAP)) {
    if (lower.includes(keyword)) {
      tags.forEach((t) => found.add(t));
    }
  }
  return [...found];
}

type Receita = {
  nome: string;
  porque: string;
  ingredientes: string[];
  preparo: string[];
  dica: string | null;
  tags: string[];
  calorias: number | null;
  proteinas: number | null;
  carboidratos: number | null;
  gorduras: number | null;
};

function formatRecipe(r: Receita) {
  return {
    nome: r.nome,
    porque: r.porque,
    ingredientes: r.ingredientes,
    preparo: r.preparo,
    dica: r.dica ?? "Adapte os ingredientes ao que tiver em casa — a receita sempre fica gostosa!",
  };
}

export async function POST(req: NextRequest) {
  const { contexto } = await req.json();
  const supabase = await createClient();

  const tags = extractTags(contexto || "");

  let receitas: Receita[] | null = null;

  // Se há tags, busca receitas que tenham pelo menos uma tag correspondente
  if (tags.length > 0) {
    const { data } = await supabase
      .from("receitas")
      .select("nome, porque, ingredientes, preparo, dica, tags, calorias, proteinas, carboidratos, gorduras")
      .overlaps("tags", tags);

    if (data && data.length > 0) {
      receitas = data as Receita[];
    }
  }

  // Fallback: qualquer receita aleatória do banco
  if (!receitas || receitas.length === 0) {
    const { data } = await supabase
      .from("receitas")
      .select("nome, porque, ingredientes, preparo, dica, tags, calorias, proteinas, carboidratos, gorduras");

    receitas = (data as Receita[]) ?? null;
  }

  // Último fallback hardcoded se o banco estiver vazio
  if (!receitas || receitas.length === 0) {
    return NextResponse.json({
      nome: "Bowl de Atum com Abacate",
      porque: "Proteína + gordura boa que sacia de verdade e fica pronto em 5 minutos",
      ingredientes: [
        "1 lata de atum em água",
        "1/2 abacate",
        "Tomate cereja a gosto",
        "Limão, sal e azeite",
      ],
      preparo: [
        "Escorra o atum e misture com o suco de meio limão.",
        "Corte o abacate em cubos e os tomates ao meio.",
        "Monte tudo numa tigela e regue com azeite.",
        "Tempere com sal e pimenta a gosto.",
      ],
      dica: "Adiciona uma colher de cream cheese light — fica cremoso e aumenta a proteína.",
    });
  }

  const random = receitas[Math.floor(Math.random() * receitas.length)];
  return NextResponse.json(formatRecipe(random));
}
