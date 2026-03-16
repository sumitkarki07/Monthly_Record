import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "../../../lib/db";

const createSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100)
});

export async function GET() {
  const { rows } = await query<{
    id: number;
    month: number;
    year: number;
  }>(
    `SELECT id, month, year
     FROM registers
     ORDER BY year DESC, month DESC`
  );

  return NextResponse.json({ registers: rows });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = createSchema.parse(json);

    const { rows } = await query<{
      id: number;
      month: number;
      year: number;
    }>(
      `INSERT INTO registers (month, year)
       VALUES ($1, $2)
       RETURNING id, month, year`,
      [parsed.month, parsed.year]
    );

    return NextResponse.json(
      { register: rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "A register for this month and year already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create register" },
      { status: 500 }
    );
  }
}

