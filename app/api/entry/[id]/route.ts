import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "../../../../lib/db";

const updateEntrySchema = z.object({
  resident_name: z.string().trim().min(1),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Invalid date"
  }),
  price: z.number().nonnegative()
});

function getIdFromRequest(req: NextRequest): number | null {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  const idStr = segments[segments.length - 1];
  const idNum = Number(idStr);
  if (!idNum || Number.isNaN(idNum)) return null;
  return idNum;
}

export async function PUT(req: NextRequest) {
  const id = getIdFromRequest(req);
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid entry id" }, { status: 400 });
  }

  try {
    const json = await req.json();
    const parsed = updateEntrySchema.parse(json);

    const name = parsed.resident_name.trim();

    const existing = await query(
      `SELECT id FROM residents WHERE name = $1 LIMIT 1`,
      [name]
    );

    let residentId: number;

    if (existing.rows.length > 0) {
      residentId = (existing.rows[0] as { id: number }).id;
    } else {
      const inserted = await query(
        `INSERT INTO residents (name) VALUES ($1) RETURNING id`,
        [name]
      );
      residentId = (inserted.rows[0] as { id: number }).id;
    }

    const { rows } = await query(
      `UPDATE entries
       SET resident_id = $1,
           date = $2,
           price = $3
       WHERE id = $4
       RETURNING id,
                 register_id,
                 resident_id,
                 date,
                 price,
                 (SELECT name FROM residents WHERE id = entries.resident_id) AS resident_name`,
      [residentId, parsed.date, parsed.price, id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ entry: rows[0] });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = getIdFromRequest(req);
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid entry id" }, { status: 400 });
  }

  const { rows } = await query(
    `DELETE FROM entries WHERE id = $1 RETURNING id`,
    [id]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

