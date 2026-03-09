import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { campaigns: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage brand identities for ad generation
          </p>
        </div>
        <Link
          href="/brands/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Brand
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.id}`}
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[brand.primaryColor, brand.secondaryColor, brand.accentColor].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-lg"
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
              </div>
            </div>
            <h3 className="mt-4 font-semibold group-hover:text-blue-400">
              {brand.name}
            </h3>
            <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
              <span>{brand.headingFont} / {brand.bodyFont}</span>
              <span>{brand._count.campaigns} campaigns</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
