import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.APP_PASSWORD || "naokokenji";

// POST /api/auth — login
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
}

// GET /api/auth — check
export async function GET(req: NextRequest) {
  const auth = req.cookies.get("auth");
  return NextResponse.json({ authenticated: auth?.value === "1" });
}

// DELETE /api/auth — logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth", "", { maxAge: 0, path: "/" });
  return res;
}
