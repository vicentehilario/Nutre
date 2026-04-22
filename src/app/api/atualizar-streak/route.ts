import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import webpush from "web-push";

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("fotos_hoje, streak, ultimo_registro, meta_calorica, push_subscription")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "perfil não encontrado" }, { status: 404 });

  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
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

  // Verifica meta calórica atingida
  if (profile.meta_calorica && profile.push_subscription) {
    const { data: refHoje } = await supabaseAdmin
      .from("refeicoes")
      .select("calorias")
      .eq("user_id", user.id)
      .eq("data", hoje);

    const totalCalorias = (refHoje ?? []).reduce((s, r) => s + (r.calorias ?? 0), 0);
    const meta = profile.meta_calorica;

    if (totalCalorias >= meta * 0.95 && totalCalorias <= meta * 1.1) {
      try {
        await webpush.sendNotification(
          profile.push_subscription as webpush.PushSubscription,
          JSON.stringify({
            title: "🎯 Meta do dia batida!",
            body: `${totalCalorias} kcal registradas — você atingiu sua meta de ${meta} kcal. Boa!`,
            tag: "nutre-goal",
            url: "/app",
          })
        );
      } catch { /* subscription expirada, ignora */ }
    }
  }

  return NextResponse.json({ ok: true });
}
