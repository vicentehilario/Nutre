import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map Hotmart offer codes to plan names
const OFFER_PLAN_MAP: Record<string, string> = {
  "5sks6hjc": "premium",   // Premium Mensal
  "w71953zf": "premium",   // Premium Anual
  "arsue9iw": "dieta_treino", // Dieta & Treino Mensal
};

function extractOfferCode(checkoutUrl: string): string | null {
  try {
    const url = new URL(checkoutUrl);
    return url.searchParams.get("off");
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const hotmartToken = process.env.HOTMART_WEBHOOK_TOKEN;

  const body = await req.json();

  // Validate Hotmart webhook token (v2.0.0 sends it in the body as "hottok")
  const receivedToken = body?.hottok ?? req.headers.get("x-hotmart-webhook-token");
  if (hotmartToken && receivedToken !== hotmartToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = body?.event;

  const buyerEmail: string | undefined =
    body?.data?.buyer?.email ?? body?.buyer?.email;

  const checkoutUrl: string | undefined =
    body?.data?.product?.url_checkout ?? body?.purchase?.checkout_url;

  const offerCode = checkoutUrl ? extractOfferCode(checkoutUrl) : null;
  const newPlan = offerCode ? (OFFER_PLAN_MAP[offerCode] ?? "premium") : "premium";

  if (!buyerEmail) {
    return NextResponse.json({ error: "Missing buyer email" }, { status: 400 });
  }

  if (event === "PURCHASE_APPROVED") {
    // Find user by email and upgrade plan
    const { data: user, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", buyerEmail)
      .maybeSingle();

    if (userError || !user) {
      // User may not have signed up yet — store pending activation
      console.warn("PURCHASE_APPROVED: user not found for", buyerEmail);
      return NextResponse.json({ ok: true, note: "user not found, activation pending" });
    }

    await supabaseAdmin
      .from("profiles")
      .update({ plano: newPlan })
      .eq("id", user.id);

    return NextResponse.json({ ok: true, plan: newPlan });
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
