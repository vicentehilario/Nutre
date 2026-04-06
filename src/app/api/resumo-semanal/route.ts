import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hoje = new Date();
  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const dataInicio = seteDiasAtras.toISOString().split("T")[0];
  const dataFim = hoje.toISOString().split("T")[0];

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, nome, email, meta_calorica, streak");

  if (!profiles) return NextResponse.json({ ok: true, enviados: 0 });

  let enviados = 0;

  for (const profile of profiles) {
    if (!profile.email) continue;

    const { data: refeicoes } = await supabaseAdmin
      .from("refeicoes")
      .select("calorias, data")
      .eq("user_id", profile.id)
      .gte("data", dataInicio)
      .lte("data", dataFim);

    if (!refeicoes || refeicoes.length === 0) continue;

    const totalCalorias = refeicoes.reduce((s, r) => s + (r.calorias || 0), 0);
    const mediaDiaria = Math.round(totalCalorias / 7);
    const diasAtivos = new Set(refeicoes.map((r) => r.data)).size;
    const meta = profile.meta_calorica || 2000;
    const diffMedia = mediaDiaria - meta;
    const diffStr = diffMedia > 0 ? `+${diffMedia.toLocaleString("pt-BR")}` : diffMedia.toLocaleString("pt-BR");
    const diffColor = diffMedia > 200 ? "#e11d48" : diffMedia < -200 ? "#2563eb" : "#16a34a";

    const nome = profile.nome?.split(" ")[0] ?? "você";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:24px 16px;">
  <div style="background:#1a3a20;border-radius:20px;padding:24px;text-align:center;margin-bottom:20px;">
    <p style="color:white;font-size:32px;font-weight:900;margin:0;letter-spacing:-1px;">Nutre</p>
  </div>
  <h2 style="color:#111;font-size:20px;margin:0 0 4px 0;">Olá, ${nome}! 👋</h2>
  <p style="color:#666;font-size:14px;margin:0 0 20px 0;">Seu resumo dos últimos 7 dias:</p>

  <div style="background:white;border-radius:16px;border:1px solid #f0f0f0;overflow:hidden;margin-bottom:12px;">
    <div style="padding:16px 20px;border-bottom:1px solid #f5f5f5;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;color:#666;">Dias com registros</span>
      <strong style="color:#16a34a;font-size:15px;">${diasAtivos} de 7</strong>
    </div>
    <div style="padding:16px 20px;border-bottom:1px solid #f5f5f5;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;color:#666;">Média diária</span>
      <strong style="color:#111;font-size:15px;">${mediaDiaria.toLocaleString("pt-BR")} kcal</strong>
    </div>
    <div style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;color:#666;">Diferença da meta</span>
      <strong style="color:${diffColor};font-size:15px;">${diffStr} kcal/dia</strong>
    </div>
  </div>

  <div style="background:#111;border-radius:16px;padding:16px 20px;text-align:center;margin-bottom:20px;">
    <p style="color:#888;font-size:11px;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:1px;">Sequência atual</p>
    <p style="color:white;font-size:28px;font-weight:900;margin:0;">🔥 ${profile.streak ?? 0} dias</p>
  </div>

  <div style="text-align:center;margin-bottom:24px;">
    <a href="https://nutre-gilt.vercel.app/app" style="background:#16a34a;color:white;padding:14px 32px;border-radius:14px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">Abrir o Nutre →</a>
  </div>

  <p style="color:#aaa;font-size:11px;text-align:center;margin:0;">Você está recebendo este e-mail por ter uma conta no Nutre.</p>
</div>
</body>
</html>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Nutre <onboarding@resend.dev>",
        to: profile.email,
        subject: `${nome}, aqui está o seu resumo da semana 📊`,
        html,
      }),
    });

    if (emailRes.ok) enviados++;
  }

  return NextResponse.json({ ok: true, enviados });
}
