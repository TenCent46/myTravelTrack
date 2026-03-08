import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/rates
export async function GET() {
  const rows = await sql`SELECT * FROM exchange_rates ORDER BY currency`;
  return NextResponse.json(rows);
}

// PUT /api/rates — update a single rate
export async function PUT(req: NextRequest) {
  const { currency, rate_to_jpy } = await req.json();
  await sql`
    UPDATE exchange_rates SET rate_to_jpy=${rate_to_jpy}, updated_at=NOW()
    WHERE currency=${currency}`;
  return NextResponse.json({ ok: true });
}
