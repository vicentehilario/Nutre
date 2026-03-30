import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const semana = searchParams.get("semana"); // ex: "2026-W13"
  const mes = searchParams.get("mes");        // ex: "2026-03"

  let query = supabase
    .from("refeicoes")
    .select("id, data, descricao, calorias, proteinas, carboidratos, gorduras, dentro_do_plano, created_at")
    .eq("user_id", session.user.id)
    .order("data", { ascending: false })
    .order("created_at", { ascending: false });

  if (semana) {
    // Converte ISO week para range de datas
    const [year, week] = semana.split("-W").map(Number);
    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = jan4.getDay() || 7;
    const weekStart = new Date(jan4);
    weekStart.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    query = query.gte("data", weekStart.toISOString().split("T")[0]).lte("data", weekEnd.toISOString().split("T")[0]);
  } else if (mes) {
    const [year, month] = mes.split("-");
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).toDate?.() ??
      new Date(new Date(Number(year), Number(month), 1).getTime() - 1);
    query = query.gte("data", firstDay).lte("data", typeof lastDay === "string" ? lastDay : (lastDay as Date).toISOString().split("T")[0]);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Agrupa por data
  const byDate: Record<string, typeof data> = {};
  for (const r of data ?? []) {
    const d = r.data ?? r.created_at?.split("T")[0] ?? "sem-data";
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(r);
  }

  // Calcula médias da semana/período
  const days = Object.entries(byDate).map(([date, refeicoes]) => ({
    data: date,
    refeicoes,
    totais: refeicoes.reduce(
      (acc, r) => ({
        calorias: acc.calorias + (r.calorias ?? 0),
        proteinas: acc.proteinas + (r.proteinas ?? 0),
        carboidratos: acc.carboidratos + (r.carboidratos ?? 0),
        gorduras: acc.gorduras + (r.gorduras ?? 0),
      }),
      { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
    ),
  }));

  const numDias = days.length;
  const medias = numDias > 0
    ? {
        calorias: Math.round(days.reduce((s, d) => s + d.totais.calorias, 0) / numDias),
        proteinas: Math.round(days.reduce((s, d) => s + d.totais.proteinas, 0) / numDias),
      }
    : { calorias: 0, proteinas: 0 };

  return NextResponse.json({ days, medias });
}
