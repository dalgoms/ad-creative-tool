import { prisma } from "@/lib/db/prisma";
import { CampaignForm } from "@/components/campaigns/CampaignForm";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  const [brands, categories, presets, families] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.categoryRule.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.platformPreset.findMany({
      where: { isActive: true },
      orderBy: [{ platform: "asc" }, { width: "asc" }],
    }),
    prisma.templateFamily.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Campaign</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Choose a creative style, then generate ad assets from your campaign data
        </p>
      </div>

      <CampaignForm
        brands={brands}
        categories={categories}
        presets={presets}
        families={families}
      />
    </div>
  );
}
