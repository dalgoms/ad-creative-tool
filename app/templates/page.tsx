import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await prisma.templateDefinition.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { assets: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Reusable ad templates for rendering
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tmpl) => {
          const layers = tmpl.layers as Array<{ type: string }>;

          return (
            <div
              key={tmpl.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{tmpl.name}</h3>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                  {tmpl.templateGroup}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-xs text-zinc-400">
                  <span className="text-zinc-500">Layers:</span>{" "}
                  {layers.map((l) => l.type).join(", ")}
                </p>
                <p className="text-xs text-zinc-400">
                  <span className="text-zinc-500">Presets:</span>{" "}
                  {tmpl.compatiblePresets.length} sizes
                </p>
                <p className="text-xs text-zinc-400">
                  <span className="text-zinc-500">Used:</span>{" "}
                  {tmpl._count.assets} assets
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
