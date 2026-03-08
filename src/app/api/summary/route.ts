import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/summary — dashboard data
export async function GET() {
  // Phase+category summary of actual spending (Kenji only)
  const byPhaseCategory = await sql`
    SELECT phase, category,
           SUM(amount_jpy) AS actual_jpy,
           COUNT(*) AS count
    FROM expenses
    WHERE payer = 'ケンジ'
    GROUP BY phase, category
    ORDER BY phase, category`;

  // Phase totals (Kenji)
  const byPhase = await sql`
    SELECT phase,
           SUM(amount_jpy) AS actual_jpy,
           COUNT(*) AS count
    FROM expenses
    WHERE payer = 'ケンジ'
    GROUP BY phase
    ORDER BY phase`;

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

  // Grand total Kenji
  const grandTotal = await sql`
    SELECT COALESCE(SUM(amount_jpy), 0) AS total
    FROM expenses WHERE payer = 'ケンジ'`;

  return NextResponse.json({
    byPhaseCategory,
    byPhase,
    budget,
    recent,
    kenjiTotal: Number((grandTotal as any[])[0].total),
  });
}
