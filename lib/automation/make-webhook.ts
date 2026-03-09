import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

/**
 * Delivers a webhook event to all active webhook configs matching the event type.
 * Logs each delivery attempt (success or failure) to the WebhookDelivery table.
 */
export async function dispatchWebhookEvent(
  event: string,
  payload: object
): Promise<void> {
  const webhooks = await prisma.webhookConfig.findMany({
    where: {
      isActive: true,
      events: { has: event },
    },
  });

  if (webhooks.length === 0) return;

  const deliveryPromises = webhooks.map(async (webhook) => {
    const startTime = Date.now();
    const body = JSON.stringify(payload);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Webhook-Event": event,
      "X-Webhook-Id": webhook.id,
    };

    if (webhook.secret) {
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(body)
        .digest("hex");
      headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(10000),
      });

      const durationMs = Date.now() - startTime;
      const responseBody = await response.text().catch(() => "");

      await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event,
          payload: payload as object,
          statusCode: response.status,
          responseBody: responseBody.slice(0, 1000),
          durationMs,
        },
      });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";

      await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event,
          payload: payload as object,
          error: errorMessage,
          durationMs,
        },
      });
    }
  });

  await Promise.allSettled(deliveryPromises);
}
