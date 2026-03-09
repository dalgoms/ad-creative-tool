import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const templates = await prisma.templateDefinition.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { assets: true } } },
  });
  return NextResponse.json(templates);
}
