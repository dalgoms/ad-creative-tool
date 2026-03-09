import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const families = await prisma.templateFamily.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { variants: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(families);
}
