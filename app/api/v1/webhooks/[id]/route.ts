import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  secret: z.string().optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const webhook = await prisma.webhookConfig.findUnique({
    where: { id },
    include: {
      deliveries: {
        orderBy: { deliveredAt: "desc" },
        take: 20,
      },
    },
  });

  if (!webhook) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  return NextResponse.json(webhook);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateWebhookSchema.parse(body);

    const webhook = await prisma.webhookConfig.update({
      where: { id },
      data,
    });

    return NextResponse.json(webhook);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.webhookConfig.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
