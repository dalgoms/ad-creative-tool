import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const presets = await prisma.platformPreset.findMany({
    where: { isActive: true },
    orderBy: [{ platform: "asc" }, { width: "asc" }],
  });
  return NextResponse.json(presets);
}
