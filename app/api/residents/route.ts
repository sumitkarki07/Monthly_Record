import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (q.length === 0) {
      const result = await query("SELECT id, name FROM residents ORDER BY name ASC LIMIT 50");
      return NextResponse.json({ residents: result.rows });
    }
    const result = await query(
      "SELECT id, name FROM residents WHERE LOWER(name) LIKE LOWER($1) ORDER BY name ASC LIMIT 20",
      [`%${q}%`]
    );
    return NextResponse.json({ residents: result.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to fetch residents" }, { status: 500 });
  }
}
