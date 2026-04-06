import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data } = await supabase
    .from("peso_registros")
    .select("id, peso, data")
    .eq("user_id", user.id)
    .order("data", { ascending: true })
    .limit(90);

  return NextResponse.json({ registros: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { peso } = await req.json();
  if (!peso || peso <= 0 || peso > 500) {
    return NextResponse.json({ error: "Peso inválido" }, { status: 400 });
  }

  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

  const { data, error } = await supabase
    .from("peso_registros")
    .upsert({ user_id: user.id, peso, data: hoje }, { onConflict: "user_id,data" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, registro: data });
}
