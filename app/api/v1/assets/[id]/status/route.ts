import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const VALID_TRANSITIONS: Record<string, string[]> = {
  generated: ["approved", "rejected"],
  approved: ["published", "rejected"],
  rejected: ["generated"],
  published: [],
};

const statusSchema = z.object({
  status: z.enum(["generated", "approved", "rejected", "published"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { status: newStatus } = statusSchema.parse(body);

    const asset = await prisma.creativeAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const allowed = VALID_TRANSITIONS[asset.status] || [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from "${asset.status}" to "${newStatus}". Allowed: ${allowed.join(", ") || "none"}` },
        { status: 400 }
      );
    }

    const updated = await prisma.creativeAsset.update({
      where: { id },
      data: {
        status: newStatus,
        publishedAt: newStatus === "published" ? new Date() : asset.publishedAt,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
