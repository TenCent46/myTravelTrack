import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/todos?phase=A&done=false
export async function GET(req: NextRequest) {
  const phase = req.nextUrl.searchParams.get("phase");
  const done = req.nextUrl.searchParams.get("done");

  if (phase && done !== null) {
    const rows = await sql`SELECT * FROM todos WHERE phase=${phase} AND done=${done === "true"} ORDER BY priority='high' DESC, priority='mid' DESC, created_at`;
    return NextResponse.json(rows);
  }
  if (phase) {
    const rows = await sql`SELECT * FROM todos WHERE phase=${phase} ORDER BY done, priority='high' DESC, priority='mid' DESC, created_at`;
    return NextResponse.json(rows);
  }
  if (done !== null) {
    const rows = await sql`SELECT * FROM todos WHERE done=${done === "true"} ORDER BY phase, priority='high' DESC, priority='mid' DESC, created_at`;
    return NextResponse.json(rows);
  }
  const rows = await sql`SELECT * FROM todos ORDER BY done, phase, priority='high' DESC, priority='mid' DESC, created_at`;
  return NextResponse.json(rows);
}

// POST /api/todos
export async function POST(req: NextRequest) {
  const { phase, title, detail, priority } = await req.json();
  const rows = await sql`
    INSERT INTO todos (phase, title, detail, priority)
    VALUES (${phase || "-"}, ${title}, ${detail || ""}, ${priority || "mid"})
    RETURNING *`;
  return NextResponse.json((rows as any[])[0], { status: 201 });
}

// PUT /api/todos
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, phase, title, detail, priority, done } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Toggle done only
  if (Object.keys(body).length === 2 && "done" in body) {
    const rows = await sql`UPDATE todos SET done=${done}, updated_at=NOW() WHERE id=${id} RETURNING *`;
    return NextResponse.json((rows as any[])[0]);
  }

  const rows = await sql`
    UPDATE todos SET
      phase=${phase}, title=${title}, detail=${detail || ""},
      priority=${priority}, done=${done}, updated_at=NOW()
    WHERE id=${id} RETURNING *`;
  return NextResponse.json((rows as any[])[0]);
}

// DELETE /api/todos?id=123
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM todos WHERE id=${id}`;
  return NextResponse.json({ ok: true });
}
