import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/expenses?phase=A&limit=50
export async function GET(req: NextRequest) {
  const phase = req.nextUrl.searchParams.get("phase");
  const limit = Number(req.nextUrl.searchParams.get("limit") || 100);
  const rows = phase
    ? await sql`SELECT * FROM expenses WHERE phase=${phase} ORDER BY expense_date DESC, created_at DESC LIMIT ${limit}`
    : await sql`SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC LIMIT ${limit}`;
  return NextResponse.json(rows);
}

// POST /api/expenses
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { expense_date, amount, currency, rate_used, amount_jpy, phase, category, payer, note } = body;
  const rows = await sql`
    INSERT INTO expenses (expense_date, amount, currency, rate_used, amount_jpy, phase, category, payer, note)
    VALUES (${expense_date}, ${amount}, ${currency}, ${rate_used}, ${amount_jpy}, ${phase}, ${category}, ${payer || "ケンジ"}, ${note || ""})
    RETURNING *`;
  return NextResponse.json((rows as any[])[0], { status: 201 });
}

// DELETE /api/expenses?id=123
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM expenses WHERE id=${id}`;
  return NextResponse.json({ ok: true });
}
