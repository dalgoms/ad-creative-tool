import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ArrowLeft, Download, Copy, Image } from "lucide-react";
import { AssetGrid } from "@/components/campaigns/AssetGrid";
import { RegenerateActions } from "@/components/campaigns/CampaignActions";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      copyVariants: { orderBy: { variantIndex: "asc" } },
      assets: {
        include: {
          preset: true,
          copyVariant: { select: { headline: true, variantIndex: true } },
          template: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!campaign) notFound();

  const approvedCount = campaign.assets.filter((a) => a.status === "approved").length;
  const publishedCount = campaign.assets.filter((a) => a.status === "published").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/campaigns"
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Campaigns
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {campaign.brand.name} / {campaign.category.name} / {campaign.productName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RegenerateActions campaignId={campaign.id} />
            <StatusBadge status={campaign.status} />
          </div>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <InfoCard label="Product" value={campaign.productName} />
        <InfoCard label="Category" value={campaign.category.name} />
        <InfoCard label="Total Assets" value={String(campaign.assets.length)} />
        <InfoCard label="Approved" value={String(approvedCount)} accent="emerald" />
        <InfoCard label="Published" value={String(publishedCount)} accent="blue" />
      </div>

      {/* Copy Variants */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <Copy className="h-4 w-4 text-zinc-400" /> Copy Variants ({campaign.copyVariants.length})
          </h2>
        </div>
        <div className="divide-y divide-zinc-800">
          {campaign.copyVariants.map((v) => (
            <div key={v.id} className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-bold">
                  V{v.variantIndex + 1}
                </span>
                <span className="text-xs text-zinc-500">
                  {v.keywordsUsed.join(", ")}
                </span>
              </div>
              <p className="text-lg font-bold">{v.headline}</p>
              <p className="mt-1 text-sm text-zinc-400">{v.subcopy}</p>
              <span className="mt-2 inline-block rounded-full bg-blue-600/20 px-3 py-1 text-xs font-medium text-blue-400">
                {v.cta}
              </span>
              {v.backgroundPrompt && (
                <div className="mt-3 rounded-lg bg-zinc-800/50 p-3">
                  <p className="text-xs font-medium text-zinc-500">Background Prompt:</p>
                  <p className="mt-1 text-xs text-zinc-400">{v.backgroundPrompt}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generated Assets */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <Image className="h-4 w-4 text-zinc-400" />
            Generated Assets ({campaign.assets.length})
          </h2>
          {campaign.assets.length > 0 && (
            <button className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800">
              <Download className="h-3 w-3" /> Download All
            </button>
          )}
        </div>
        <div className="p-5">
          <AssetGrid assets={campaign.assets} />
        </div>
      </div>
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
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

function InfoCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const accentClass = accent === "emerald"
    ? "text-emerald-400"
    : accent === "blue"
      ? "text-blue-400"
      : "";
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}
