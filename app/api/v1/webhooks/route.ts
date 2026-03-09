import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const webhookConfigSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  secret: z.string().optional(),
  events: z.array(z.string()).min(1),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const webhooks = await prisma.webhookConfig.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { deliveries: true } },
    },
  });
  return NextResponse.json(webhooks);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = webhookConfigSchema.parse(body);

    const webhook = await prisma.webhookConfig.create({ data });
    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
