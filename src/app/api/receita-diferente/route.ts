import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Mapeamento direto dos botões da UI para tags do banco
const TAG_MAP: Record<string, string[]> = {
  proteico: ["proteico"],
  proteína: ["proteico"],
  whey: ["proteico", "pos-treino"],
  leve: ["leve"],
  light: ["leve"],
  doce: ["doce"],
  "docinho fit": ["doce"],
  "docinho": ["doce"],
  chocolate: ["doce"],
  "rápido": ["rapido"],
  rapido: ["rapido"],
  "prático": ["simples", "rapido"],
  simples: ["simples"],
  "fácil": ["simples"],
  "facil de fazer": ["simples"],
  "pos-treino": ["pos-treino"],
  "pós-treino": ["pos-treino"],
  treino: ["pos-treino"],
  "café da manhã": ["cafe-da-manha"],
  "cafe da manha": ["cafe-da-manha"],
  café: ["cafe-da-manha"],
  manhã: ["cafe-da-manha"],
  salgado: ["salgado"],
  "baixo-carb": ["baixo-carb"],
  "low carb": ["baixo-carb"],
  lowcarb: ["baixo-carb"],
  vegetariano: ["vegetariano"],
  vegan: ["vegan"],
  lanche: ["lanche"],
  bebida: ["bebida"],
  shake: ["bebida", "pos-treino"],
  smoothie: ["bebida"],
  vitamina: ["bebida"],
  mingau: ["cafe-da-manha", "leve"],
  aveia: ["cafe-da-manha"],
  overnight: ["cafe-da-manha", "leve"],
  "overnight oats": ["cafe-da-manha", "leve"],
  patê: ["salgado", "lanche", "proteico"],
  pate: ["salgado", "lanche", "proteico"],
  sanduíche: ["salgado", "lanche"],
  sanduiche: ["salgado", "lanche"],
  hamburguer: ["salgado", "almoco", "proteico"],
  "hambúrguer": ["salgado", "almoco", "proteico"],
  tapioca: ["cafe-da-manha", "lanche"],
  panqueca: ["doce", "cafe-da-manha"],
  musse: ["doce", "lanche"],
  mousse: ["doce", "lanche"],
  pastel: ["salgado", "lanche"],
  bowl: ["cafe-da-manha", "lanche"],
  omelete: ["proteico", "salgado", "cafe-da-manha"],
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

// Embaralha array e retorna N itens únicos
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

type Receita = {
  id: string;
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
    dica: r.dica ?? "Adapte os ingredientes ao que tiver em casa — sempre fica gostoso!",
    macros: r.calorias
      ? {
          kcal: r.calorias,
          proteina: r.proteinas,
          carbo: r.carboidratos,
          gordura: r.gorduras,
        }
      : null,
  };
}

export async function POST(req: NextRequest) {
  const { contexto } = await req.json();
  const supabase = await createClient();

  const tags = extractTags(contexto || "");

  let pool: Receita[] = [];

  // Busca com tags específicas do contexto
  if (tags.length > 0) {
    const { data } = await supabase
      .from("receitas")
      .select("id, nome, porque, ingredientes, preparo, dica, tags, calorias, proteinas, carboidratos, gorduras")
      .overlaps("tags", tags);

    if (data && data.length > 0) {
      pool = data as Receita[];
    }
  }

  // Fallback: todas as receitas se não encontrou match por tags
  if (pool.length === 0) {
    const { data } = await supabase
      .from("receitas")
      .select("id, nome, porque, ingredientes, preparo, dica, tags, calorias, proteinas, carboidratos, gorduras");

    pool = (data as Receita[]) ?? [];
  }

  // Sempre retorna 2 receitas diferentes
  const duas = pickRandom(pool, 2);

  // Hardcoded fallback se banco vazio
  if (duas.length === 0) {
    return NextResponse.json([
      {
        nome: "Bowl de Atum com Abacate",
        porque: "Proteína + gordura boa que sacia de verdade e fica pronto em 5 minutos",
        ingredientes: ["1 lata de atum em água (120g)", "1/2 abacate (80g)", "Tomate cereja a gosto", "Limão, sal e azeite"],
        preparo: ["Escorra o atum.", "Corte o abacate e os tomates.", "Monte em tigela e tempere com limão e azeite."],
        dica: "Adiciona cream cheese light — fica cremoso e aumenta a proteína.",
        macros: { kcal: 280, proteina: 24, carbo: 8, gordura: 16 },
      },
      {
        nome: "Tapioca com Frango e Requeijão",
        porque: "Substitui o pão com sabor e proteína — pronto em 5 minutos",
        ingredientes: ["30g de goma de tapioca", "100g de frango desfiado", "1 colher de requeijão light", "Orégano e sal"],
        preparo: ["Faça a tapioca na frigideira.", "Recheie com frango temperado e requeijão.", "Dobre e sirva."],
        dica: "Adicione tomate e rúcula para mais volume sem calorias.",
        macros: { kcal: 260, proteina: 28, carbo: 22, gordura: 6 },
      },
    ]);
  }

  return NextResponse.json(duas.map(formatRecipe));
}
