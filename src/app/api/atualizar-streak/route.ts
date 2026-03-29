import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("fotos_hoje, streak, ultimo_registro")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "perfil não encontrado" }, { status: 404 });

  const hoje = new Date().toISOString().split("T")[0];
  const ultimoRegistro = profile.ultimo_registro;

  const jaRegistrouHoje = ultimoRegistro === hoje;

  let novoStreak = profile.streak;

  if (!jaRegistrouHoje) {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toISOString().split("T")[0];

    if (ultimoRegistro === ontemStr) {
      novoStreak = profile.streak + 1;
    } else if (!ultimoRegistro) {
      novoStreak = 1;
    } else {
      novoStreak = 1; // streak quebrado
    }
  }

  await supabase
    .from("profiles")
    .update({
      fotos_hoje: jaRegistrouHoje ? profile.fotos_hoje + 1 : 1,
      streak: novoStreak,
      ultimo_registro: hoje,
    })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
