import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const categories = await prisma.categoryRule.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { campaigns: true } } },
  });
  return NextResponse.json(categories);
}
