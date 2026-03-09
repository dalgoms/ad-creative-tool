import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { brandSchema } from "@/lib/validators/brand-schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({ where: { id } });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }
  return NextResponse.json(brand);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const data = brandSchema.parse(body);
    const brand = await prisma.brand.update({ where: { id }, data });
    return NextResponse.json(brand);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update brand";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
