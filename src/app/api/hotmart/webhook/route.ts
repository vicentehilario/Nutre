import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map Hotmart offer codes to plan names
const OFFER_PLAN_MAP: Record<string, string> = {
  "5sks6hjc": "premium",      // Premium Mensal R$47
  "w71953zf": "premium",      // Premium Anual R$397
  "arsue9iw": "dieta_treino", // Dieta & Treino Mensal R$97
};

function get(obj: unknown, ...keys: string[]): unknown {
  let cur = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

function extractOfferCode(body: Record<string, unknown>): string | null {
  // Try direct offer code field first (more reliable than URL parsing)
  const directCode = get(body, "data", "purchase", "offer", "code");
  if (typeof directCode === "string" && directCode) return directCode;

  // Fallback: extract from checkout URL ?off= param
  const checkoutUrl =
    (get(body, "data", "product", "url_checkout") as string | undefined) ??
    (get(body, "purchase", "checkout_url") as string | undefined);
  if (!checkoutUrl) return null;
  try {
    return new URL(checkoutUrl).searchParams.get("off");
  } catch {
    return null;
  }
}

function extractCupom(body: Record<string, unknown>): string | null {
  const code = get(body, "data", "purchase", "coupon", "code");
  return typeof code === "string" ? code : null;
}

function extractAfiliado(body: Record<string, unknown>): string | null {
  const commissions = get(body, "data", "commissions");
  if (!Array.isArray(commissions) || commissions.length === 0) return null;
  const name = get(commissions[0], "affiliate", "name");
  return typeof name === "string" ? name : null;
}

export async function POST(req: NextRequest) {
  const hotmartToken = process.env.HOTMART_WEBHOOK_TOKEN;

  const body = await req.json();

  // Hotmart v2.0.0 envia o token no body como "hottok" ou no header
  const receivedToken = body?.hottok ?? req.headers.get("x-hotmart-webhook-token");
  // Bloqueia se: env var não configurada (obrigatória) OU token não bate
  if (!hotmartToken || receivedToken !== hotmartToken) {
    console.warn("[hotmart] webhook rejeitado — token inválido ou HOTMART_WEBHOOK_TOKEN não configurado");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = body?.event;

  const buyerEmail: string | undefined =
    body?.data?.buyer?.email ?? body?.buyer?.email;

  const offerCode = extractOfferCode(body);
  const cupom = extractCupom(body);
  const afiliado = extractAfiliado(body);
  const newPlan = offerCode ? (OFFER_PLAN_MAP[offerCode] ?? "premium") : "premium";

  if (!buyerEmail) {
    return NextResponse.json({ error: "Missing buyer email" }, { status: 400 });
  }

  if (event === "PURCHASE_APPROVED") {
    const { data: user, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", buyerEmail)
      .maybeSingle();

    if (userError || !user) {
      console.warn("PURCHASE_APPROVED: user not found for", buyerEmail);
      return NextResponse.json({ ok: true, note: "user not found, activation pending" });
    }

    const updateData: Record<string, unknown> = {
      plano: newPlan,
      renovacoes: 0,
      plano_ativado_em: new Date().toISOString(),
    };
    if (offerCode) updateData.offer_code = offerCode;
    if (cupom) updateData.cupom = cupom;
    if (afiliado) updateData.afiliado = afiliado;

    await supabaseAdmin.from("profiles").update(updateData).eq("id", user.id);

    return NextResponse.json({ ok: true, plan: newPlan, cupom, afiliado, offer_code: offerCode });
  }

  if (event === "SUBSCRIPTION_RENEWAL_APPROVED") {
    const { data: user } = await supabaseAdmin
      .from("profiles")
      .select("id, renovacoes")
      .eq("email", buyerEmail)
      .maybeSingle();

    if (user) {
      await supabaseAdmin
        .from("profiles")
        .update({ plano: newPlan, renovacoes: (user.renovacoes ?? 0) + 1 })
        .eq("id", user.id);
    }

    return NextResponse.json({ ok: true, event, plan: newPlan });
  }

  if (event === "SUBSCRIPTION_CANCELLATION" || event === "PURCHASE_REFUNDED" || event === "PURCHASE_CHARGEBACK") {
    const { data: user } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", buyerEmail)
      .maybeSingle();

    if (user) {
      await supabaseAdmin
        .from("profiles")
        .update({ plano: "gratis" })
        .eq("id", user.id);
    }

    return NextResponse.json({ ok: true, plan: "gratis" });
  }

  // Acknowledge other events
  return NextResponse.json({ ok: true, event });
}
