import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      brand: { select: { name: true, primaryColor: true } },
      category: { select: { name: true } },
      _count: { select: { assets: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const campaign = await prisma.campaign.create({
      data: {
        name: body.name,
        brandId: body.brandId,
        categoryId: body.categoryId,
        productName: body.productName,
        productDescription: body.productDescription,
        targetAudience: body.targetAudience,
        badgeText: body.badgeText,
        backgroundImageUrl: body.backgroundImageUrl,
        selectedPresets: body.selectedPresets || [],
        status: "draft",
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create campaign";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
