import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { brandSchema } from "@/lib/validators/brand-schema";

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { campaigns: true } } },
  });
  return NextResponse.json(brands);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = brandSchema.parse(body);

    const brand = await prisma.brand.create({ data });
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create brand";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
