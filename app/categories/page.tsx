import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.categoryRule.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { campaigns: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Category Rules</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Category-specific rules for copy tone, keywords, visual direction, and template selection
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const tone = cat.tone as { voice: string; emotion: string };
          const keywords = cat.keywords as { primary: string[] };
          const visual = cat.visualDirection as { style: string; color_mood: string };

          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold group-hover:text-blue-400">
                  {cat.name}
                </h3>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                  v{cat.version}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <InfoRow label="Tone" value={`${tone.voice}, ${tone.emotion}`} />
                <InfoRow label="Visual" value={`${visual.style} / ${visual.color_mood}`} />
                <InfoRow
                  label="Keywords"
                  value={keywords.primary.slice(0, 3).join(", ")}
                />
              </div>

              <div className="mt-3 text-xs text-zinc-500">
                {cat._count.campaigns} campaigns
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="w-16 shrink-0 text-zinc-500">{label}</span>
      <span className="text-zinc-300">{value}</span>
    </div>
  );
}
