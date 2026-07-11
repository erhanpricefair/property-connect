import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const suburbs = await db.suburb.findMany({
    where: { state: "VIC" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, postcode: true },
  });

  return NextResponse.json({ data: suburbs });
}
