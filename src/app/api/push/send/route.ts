import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Busca usuários com push_subscription que não registraram hoje
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, nome, push_subscription, ultimo_registro")
    .not("push_subscription", "is", null);

  if (!profiles) return NextResponse.json({ ok: true, enviados: 0 });

  let enviados = 0;
  const payload = JSON.stringify({
    title: "Nutre 🥗",
    body: "Lembra de registrar suas refeições de hoje!",
  });

  for (const profile of profiles) {
    // Só notifica quem ainda não registrou hoje
    if (profile.ultimo_registro === hoje) continue;
    if (!profile.push_subscription) continue;

    try {
      await webpush.sendNotification(profile.push_subscription as webpush.PushSubscription, payload);
      enviados++;
    } catch (err: unknown) {
      // Subscription expirada — limpa
      const errObj = err as { statusCode?: number };
      if (errObj?.statusCode === 410 || errObj?.statusCode === 404) {
        await supabaseAdmin.from("profiles").update({ push_subscription: null }).eq("id", profile.id);
      }
    }
  }

  return NextResponse.json({ ok: true, enviados });
}
