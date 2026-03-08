import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/summary — dashboard data
export async function GET() {
  // Phase+category summary by payer
  const byPhaseCategory = await sql`
    SELECT phase, category, payer,
           SUM(amount_jpy) AS actual_jpy,
           COUNT(*) AS count
    FROM expenses
    GROUP BY phase, category, payer
    ORDER BY phase, category, payer`;

  // Phase totals by payer
  const byPhase = await sql`
    SELECT phase, payer,
           SUM(amount_jpy) AS actual_jpy,
           COUNT(*) AS count
    FROM expenses
    GROUP BY phase, payer
    ORDER BY phase, payer`;

  // Budget items grouped
  const budget = await sql`
    SELECT phase, category,
           SUM(planned_jpy) AS planned_jpy,
           payer
    FROM budget_items
    GROUP BY phase, category, payer
    ORDER BY phase, category`;

  // Recent expenses
  const recent = await sql`
    SELECT * FROM expenses
    ORDER BY expense_date DESC, created_at DESC
    LIMIT 10`;

  // Grand totals by payer
  const totals = await sql`
    SELECT payer, COALESCE(SUM(amount_jpy), 0) AS total
    FROM expenses
    GROUP BY payer`;

  const kenjiTotal = Number((totals as any[]).find(t => t.payer === 'ケンジ')?.total ?? 0);
  const momTotal = Number((totals as any[]).find(t => t.payer === '母')?.total ?? 0);

  return NextResponse.json({
    byPhaseCategory,
    byPhase,
    budget,
    recent,
    kenjiTotal,
    momTotal,
  });
}
