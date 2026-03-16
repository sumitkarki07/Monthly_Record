import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "../../../lib/db";

const createEntrySchema = z
  .object({
    register_id: z.number().int().positive(),
    resident_id: z.number().int().positive().optional(),
    resident_name: z.string().trim().min(1).optional(),
    date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "Invalid date"
    }),
    price: z.number().nonnegative()
  })
  .refine(
    (val) => !!val.resident_id || !!val.resident_name,
    { message: "Resident is required" }
  );

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = createEntrySchema.parse(json);

    let residentId = parsed.resident_id;

    if (!residentId && parsed.resident_name) {
      const name = parsed.resident_name.trim();

      const existing = await query<{ id: number }>(
        `SELECT id FROM residents WHERE name = $1 LIMIT 1`,
        [name]
      );

      if (existing.rows.length > 0) {
        residentId = existing.rows[0].id;
      } else {
        const inserted = await query<{ id: number }>(
          `INSERT INTO residents (name) VALUES ($1) RETURNING id`,
          [name]
        );
        residentId = inserted.rows[0].id;
      }
    }

    if (!residentId) {
      return NextResponse.json(
        { error: "Resident is required" },
        { status: 400 }
      );
    }

    const { rows } = await query<{
      id: number;
      register_id: number;
      resident_id: number;
      resident_name: string;
      date: string;
      price: number;
    }>(
      `INSERT INTO entries (register_id, resident_id, date, price)
       VALUES ($1, $2, $3, $4)
       RETURNING id,
                 register_id,
                 resident_id,
                 date,
                 price,
                 (SELECT name FROM residents WHERE id = entries.resident_id) AS resident_name`,
      [parsed.register_id, residentId, parsed.date, parsed.price]
    );

    return NextResponse.json(
      { entry: rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}

