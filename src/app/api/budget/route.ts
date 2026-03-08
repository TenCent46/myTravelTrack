import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/budget?phase=A
export async function GET(req: NextRequest) {
  const phase = req.nextUrl.searchParams.get("phase");
  const rows = phase
    ? await sql`SELECT * FROM budget_items WHERE phase=${phase} ORDER BY phase, category, id`
    : await sql`SELECT * FROM budget_items ORDER BY phase, category, id`;
  return NextResponse.json(rows);
}

// POST /api/budget
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phase, category, subcategory, planned_jpy, payer, status, note } = body;
  const rows = await sql`
    INSERT INTO budget_items (phase, category, subcategory, planned_jpy, payer, status, note)
    VALUES (${phase}, ${category}, ${subcategory || ""}, ${planned_jpy}, ${payer || "ケンジ"}, ${status || "見込み"}, ${note || ""})
    RETURNING *`;
  return NextResponse.json((rows as any[])[0], { status: 201 });
}

// PUT /api/budget
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, phase, category, subcategory, planned_jpy, payer, status, note } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const rows = await sql`
    UPDATE budget_items SET
      phase=${phase}, category=${category}, subcategory=${subcategory || ""},
      planned_jpy=${planned_jpy}, payer=${payer}, status=${status}, note=${note || ""}
    WHERE id=${id} RETURNING *`;
  return NextResponse.json((rows as any[])[0]);
}

// DELETE /api/budget?id=123
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM budget_items WHERE id=${id}`;
  return NextResponse.json({ ok: true });
}
