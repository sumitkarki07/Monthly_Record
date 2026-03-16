import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const registerId = Number(params.id);
  if (!registerId || Number.isNaN(registerId)) {
    return NextResponse.json({ error: "Invalid register id" }, { status: 400 });
  }

  const { rows: registerRows } = await query<{
    id: number;
    month: number;
    year: number;
  }>(`SELECT id, month, year FROM registers WHERE id = $1`, [registerId]);

  if (registerRows.length === 0) {
    return NextResponse.json({ error: "Register not found" }, { status: 404 });
  }

  const { rows: entryRows } = await query<{
    id: number;
    resident_id: number;
    resident_name: string;
    date: string;
    price: number;
  }>(
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

