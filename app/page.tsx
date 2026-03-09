import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import {
  Megaphone,
  Image,
  Palette,
  FolderCog,
  Plus,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const [campaigns, assets, brands, categories] = await Promise.all([
    prisma.campaign.count(),
    prisma.creativeAsset.count(),
    prisma.brand.count(),
    prisma.categoryRule.count({ where: { isActive: true } }),
  ]);
  return { campaigns, assets, brands, categories };
}

async function getRecentCampaigns() {
  return prisma.campaign.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { assets: true } },
    },
  });
}

export default async function DashboardPage() {
  const [stats, recentCampaigns] = await Promise.all([
    getStats(),
    getRecentCampaigns(),
  ]);

  const statCards = [
    { label: "Campaigns", value: stats.campaigns, icon: Megaphone, color: "bg-blue-600" },
    { label: "Assets Generated", value: stats.assets, icon: Image, color: "bg-emerald-600" },
    { label: "Brands", value: stats.brands, icon: Palette, color: "bg-violet-600" },
    { label: "Categories", value: stats.categories, icon: FolderCog, color: "bg-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Ad creative automation overview
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`${stat.color} rounded-lg p-2`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-zinc-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Campaigns */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="font-semibold">Recent Campaigns</h2>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentCampaigns.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-zinc-500">No campaigns yet.</p>
            <Link
              href="/campaigns/new"
              className="mt-3 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
            >
              <Plus className="h-3 w-3" /> Create your first campaign
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {recentCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-zinc-800/50"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium">{campaign.name}</p>
                    <p className="text-xs text-zinc-500">
                      {campaign.brand.name} / {campaign.category.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-400">
                    {campaign._count.assets} assets
                  </span>
                  <StatusBadge status={campaign.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
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
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.draft}`}
    >
      {status}
    </span>
  );
}
