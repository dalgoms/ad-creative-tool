import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const category = await prisma.categoryRule.findUnique({ where: { id } });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const category = await prisma.categoryRule.update({
      where: { id },
      data: {
        keywords: body.keywords,
        tone: body.tone,
        copyRules: body.copyRules,
        visualDirection: body.visualDirection,
        templateMapping: body.templateMapping,
        version: { increment: 1 },
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
