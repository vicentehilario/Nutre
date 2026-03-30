import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { meta_calorica, meta_proteina, objetivo, refeicoes_por_dia } = body;

  const update: Record<string, unknown> = {};
  if (meta_calorica !== undefined) update.meta_calorica = Number(meta_calorica);
  if (meta_proteina !== undefined) update.meta_proteina = Number(meta_proteina);
  if (objetivo !== undefined) update.objetivo = objetivo;
  if (refeicoes_por_dia !== undefined) update.refeicoes_por_dia = Number(refeicoes_por_dia);

  const { error } = await supabase.from("profiles").update(update).eq("id", session.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
