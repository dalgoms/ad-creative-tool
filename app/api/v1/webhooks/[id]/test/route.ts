import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { dispatchWebhookEvent } from "@/lib/automation/make-webhook";

/**
 * Sends a test payload to a specific webhook to verify the connection.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const webhook = await prisma.webhookConfig.findUnique({ where: { id } });
  if (!webhook) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  const testPayload = {
    event: "webhook.test",
    timestamp: new Date().toISOString(),
    message: "This is a test delivery from Ad Creative Tool",
    webhookId: webhook.id,
    webhookName: webhook.name,
  };

  await dispatchWebhookEvent("webhook.test", testPayload);

  const latestDelivery = await prisma.webhookDelivery.findFirst({
    where: { webhookId: id, event: "webhook.test" },
    orderBy: { deliveredAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    delivery: latestDelivery,
  });
}
