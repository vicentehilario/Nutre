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

export async function GET(_req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(sevenDaysAgo);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(thirtyDaysAgo);

  const [profilesRes, refeicoesRes, custosRes] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, nome, email, plano, streak, fotos_hoje, ultimo_registro, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("refeicoes")
      .select("user_id, data")
      .gte("data", sevenDaysAgoStr),
    supabaseAdmin
      .from("refeicoes")
      .select("user_id, custo_api_usd")
      .gte("data", thirtyDaysAgoStr)
      .not("custo_api_usd", "is", null),
  ]);

  if (profilesRes.error) {
    return NextResponse.json({ error: profilesRes.error.message }, { status: 500 });
  }

  // Count refeições per user in last 7 days
  const refeicoesCount: Record<string, number> = {};
  const ativosHoje = new Set<string>();
  for (const r of refeicoesRes.data ?? []) {
    refeicoesCount[r.user_id] = (refeicoesCount[r.user_id] ?? 0) + 1;
    if (r.data === today) ativosHoje.add(r.user_id);
  }

  // Cost per user last 30 days
  const custoPorUser: Record<string, number> = {};
  let custoTotalMes = 0;
  for (const r of custosRes.data ?? []) {
    const c = r.custo_api_usd ?? 0;
    custoPorUser[r.user_id] = (custoPorUser[r.user_id] ?? 0) + c;
    custoTotalMes += c;
  }

  const users = (profilesRes.data ?? []).map((p) => ({
    ...p,
    refeicoes_7d: refeicoesCount[p.id] ?? 0,
    ativo_hoje: ativosHoje.has(p.id),
    custo_30d_usd: parseFloat((custoPorUser[p.id] ?? 0).toFixed(4)),
  }));

  // Stats
  const total = users.length;
  const gratis = users.filter((u) => u.plano === "gratis").length;
  const premium = users.filter((u) => u.plano === "premium").length;
  const dietaTreino = users.filter((u) => u.plano === "dieta_treino").length;
  const ativosHojeCount = users.filter((u) => u.ativo_hoje).length;
  const ativosSemana = users.filter((u) => u.refeicoes_7d > 0).length;

  // Custo médio por usuário ativo no mês
  const usuariosComCusto = Object.keys(custoPorUser).length;

  return NextResponse.json({
    users,
    stats: {
      total,
      gratis,
      premium,
      dieta_treino: dietaTreino,
      pagantes: premium + dietaTreino,
      taxa_conversao: total > 0 ? Math.round(((premium + dietaTreino) / total) * 100) : 0,
      ativos_hoje: ativosHojeCount,
      ativos_semana: ativosSemana,
      custo_total_mes_usd: parseFloat(custoTotalMes.toFixed(4)),
      custo_medio_usuario_usd: usuariosComCusto > 0 ? parseFloat((custoTotalMes / usuariosComCusto).toFixed(4)) : 0,
    },
  });
}
