import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { name: true, primaryColor: true } },
      category: { select: { name: true } },
      _count: { select: { assets: true, copyVariants: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="mt-1 text-sm text-zinc-400">
            All ad creative campaigns
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-16 text-center">
          <p className="text-zinc-500">No campaigns yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold group-hover:text-blue-400">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {c.productName}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: c.brand.primaryColor }}
                      />
                      {c.brand.name}
                    </span>
                    <span className="text-xs text-zinc-600">|</span>
                    <span className="text-xs text-zinc-500">{c.category.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-lg font-bold">{c._count.assets}</p>
                    <p className="text-xs text-zinc-500">assets</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-zinc-700 text-zinc-300",
    generating: "bg-yellow-900/50 text-yellow-400",
    completed: "bg-emerald-900/50 text-emerald-400",
    failed: "bg-red-900/50 text-red-400",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}
