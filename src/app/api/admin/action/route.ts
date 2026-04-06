import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { action, user_id, plano } = body;

  if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

  if (action === "update_plan") {
    const planosValidos = ["gratis", "premium", "dieta_treino"];
    if (!planosValidos.includes(plano)) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ plano })
      .eq("id", user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "reset_fotos") {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ fotos_hoje: 0 })
      .eq("id", user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
