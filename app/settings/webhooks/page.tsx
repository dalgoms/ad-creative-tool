import { prisma } from "@/lib/db/prisma";
import { WebhookManager } from "@/components/webhooks/WebhookManager";

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  const webhooks = await prisma.webhookConfig.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { deliveries: true } },
      deliveries: {
        orderBy: { deliveredAt: "desc" },
        take: 5,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Webhooks</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Configure outbound webhooks for Make.com integration. The system sends
          events when creatives are generated or fail.
        </p>
      </div>

      {/* Incoming webhook info */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="font-semibold">Incoming Webhook (for Make to trigger)</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Use this URL in Make&apos;s HTTP module to trigger creative generation:
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-mono text-blue-400">
            {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
            /api/v1/webhooks/incoming
          </code>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          POST a JSON body with campaign, platforms, copyVariants, and options fields.
          GET the URL to see the expected schema.
        </p>
      </div>

      {/* Outbound webhook manager */}
      <WebhookManager webhooks={webhooks} />
    </div>
  );
}
