import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      copyVariants: { orderBy: { variantIndex: "asc" } },
      assets: {
        include: {
          preset: { select: { label: true, width: true, height: true, platform: true } },
          copyVariant: { select: { headline: true, variantIndex: true } },
          template: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json(campaign);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.campaign.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
