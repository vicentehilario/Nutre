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

const WATER_MESSAGES = [
  { title: "💧 Hora da água!", body: "Beba um copo agora. Muita fome é sede disfarçada." },
  { title: "💧 Hidratação em dia?", body: "Para um segundo e toma uma água. Seu corpo agradece." },
  { title: "💧 Lembrete de água", body: "Já bebeu água hoje? Meta: 35ml por kg de peso corporal." },
  { title: "💧 Mais um copo!", body: "Quase fim do dia — fecha sua meta de água antes de dormir." },
];

const MEAL_MESSAGES = [
  { title: "🍽️ Registrou o café da manhã?", body: "Comece o dia com o registro da primeira refeição.", url: "/app/registrar" },
  { title: "🍽️ E o almoço?", body: "Hora do almoço — registra agora antes de esquecer.", url: "/app/registrar" },
  { title: "🍽️ Lanche da tarde 👀", body: "Teve um lancinho? Registra no Nutre pra ficar no controle.", url: "/app/registrar" },
  { title: "🍽️ Jantar registrado?", body: "Não deixa o dia fechar sem registrar todas as refeições.", url: "/app/registrar" },
];

const INACTIVITY_MESSAGES: Record<number, { title: string; body: string }> = {
  1: {
    title: "👋 Tá sumido!",
    body: "Ontem você não registrou nenhuma refeição. Volta hoje — uma pausa não desfaz o progresso.",
  },
  3: {
    title: "🤔 Tá tudo bem?",
    body: "Faz 3 dias sem registro. Sem pressão — um registro hoje já é recomeço.",
  },
  7: {
    title: "😮 Uma semana sem registro",
    body: "7 dias sem registrar. O Vicente pergunta: como tá a alimentação? Abre o app e me conta.",
  },
};

function daysSince(dateStr: string | null | undefined, hoje: string): number {
  if (!dateStr) return 999;
  const d1 = new Date(dateStr + "T00:00:00-03:00");
  const d2 = new Date(hoje + "T00:00:00-03:00");
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

type Profile = {
  id: string;
  push_subscription: unknown;
  ultimo_registro?: string | null;
};

async function sendBatch(
  profiles: Profile[],
  getPayload: (p: Profile) => object | null
): Promise<number> {
  let enviados = 0;
  for (const profile of profiles) {
    if (!profile.push_subscription) continue;
    const payload = getPayload(profile);
    if (!payload) continue;
    try {
      await webpush.sendNotification(
        profile.push_subscription as webpush.PushSubscription,
        JSON.stringify(payload)
      );
      enviados++;
    } catch (err: unknown) {
      const e = err as { statusCode?: number };
      if (e?.statusCode === 410 || e?.statusCode === 404) {
        await supabaseAdmin
          .from("profiles")
          .update({ push_subscription: null })
          .eq("id", profile.id);
      }
    }
  }
  return enviados;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") ?? "meal";
  const slot = parseInt(req.nextUrl.searchParams.get("slot") ?? "0", 10);
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, push_subscription, ultimo_registro")
    .not("push_subscription", "is", null);

  if (!profiles) return NextResponse.json({ ok: true, enviados: 0 });

  let enviados = 0;

  if (type === "water") {
    const msg = WATER_MESSAGES[slot % 4];
    enviados = await sendBatch(profiles, () => ({ ...msg, tag: "nutre-water" }));
  }

  if (type === "meal") {
    const msg = MEAL_MESSAGES[slot % 4];
    enviados = await sendBatch(profiles, (p) => {
      if (p.ultimo_registro === hoje) return null;
      return { ...msg, tag: "nutre-meal" };
    });
  }

  if (type === "inactivity") {
    enviados = await sendBatch(profiles, (p) => {
      const days = daysSince(p.ultimo_registro, hoje);
      const msg = INACTIVITY_MESSAGES[days];
      if (!msg) return null;
      return { ...msg, tag: "nutre-inactivity", url: "/app" };
    });
  }

  if (type === "weight") {
    enviados = await sendBatch(profiles, () => ({
      title: "⚖️ Pesou essa semana?",
      body: "Segunda-feira é dia de registrar o peso. Abre o app e atualiza.",
      tag: "nutre-weight",
      url: "/app",
    }));
  }

  return NextResponse.json({ ok: true, type, slot, enviados });
}
