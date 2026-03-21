import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";

function getRegisterIdFromRequest(req: NextRequest): number | null {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  const idStr = segments[segments.length - 1];
  const idNum = Number(idStr);
  if (!idNum || Number.isNaN(idNum)) return null;
  return idNum;
}

export async function GET(req: NextRequest) {
  const registerId = getRegisterIdFromRequest(req);
  if (!registerId) {
    return NextResponse.json({ error: "Invalid register id" }, { status: 400 });
  }

  const { rows: registerRows } = await query(
    `SELECT id, month, year FROM registers WHERE id = $1`,
    [registerId]
  );

  if (registerRows.length === 0) {
    return NextResponse.json({ error: "Register not found" }, { status: 404 });
  }

  const { rows: entryRows } = await query(
    `SELECT e.id,
            e.resident_id,
            r.name AS resident_name,
            e.date,
            e.price
     FROM entries e
     JOIN residents r ON e.resident_id = r.id
     WHERE e.register_id = $1
     ORDER BY e.date ASC, r.name ASC`,
    [registerId]
  );

  return NextResponse.json({
    register: registerRows[0],
    entries: entryRows
  });
}
