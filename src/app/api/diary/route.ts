import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/diary — expenses grouped by date with daily totals
export async function GET() {
  const rows = await sql`
    SELECT id, expense_date, amount, currency, rate_used, amount_jpy,
           phase, category, payer, note
    FROM expenses
    ORDER BY expense_date ASC, created_at ASC`;

  return NextResponse.json(rows);
}
