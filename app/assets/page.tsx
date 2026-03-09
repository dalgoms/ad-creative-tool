import { prisma } from "@/lib/db/prisma";
import { AssetGrid } from "@/components/campaigns/AssetGrid";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const assets = await prisma.creativeAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      preset: { select: { label: true, width: true, height: true, platform: true } },
      copyVariant: { select: { headline: true, variantIndex: true } },
      template: { select: { name: true } },
      campaign: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Asset Library</h1>
        <p className="mt-1 text-sm text-zinc-400">
          All generated ad creative assets ({assets.length})
        </p>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-16 text-center">
          <p className="text-zinc-500">
            No assets yet. Create a campaign to generate assets.
          </p>
        </div>
      ) : (
        <AssetGrid assets={assets} />
      )}
    </div>
  );
}
