import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, nome, streak, plano")
    .gt("streak", 0)
    .order("streak", { ascending: false })
    .limit(100);

  const lista = (data ?? []).map((p, i) => ({
    pos: i + 1,
    nome: (p.nome ?? "Usuário").split(" ")[0],
    streak: p.streak,
    plano: p.plano,
    is_me: p.id === user.id,
  }));

  const minhaPosicao = lista.findIndex((p) => p.is_me) + 1;
  const meusStreak = lista.find((p) => p.is_me)?.streak ?? 0;

  return NextResponse.json({
    ranking: lista,
    minha_posicao: minhaPosicao,
    meus_streak: meusStreak,
    total_ativos: lista.length,
  });
}
