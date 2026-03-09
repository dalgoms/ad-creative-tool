import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function PlatformPresetsPage() {
  const presets = await prisma.platformPreset.findMany({
    orderBy: [{ platform: "asc" }, { width: "asc" }],
  });

  const grouped = presets.reduce(
    (acc, p) => {
      if (!acc[p.platform]) acc[p.platform] = [];
      acc[p.platform].push(p);
      return acc;
    },
    {} as Record<string, typeof presets>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Presets</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Predefined platform sizes for ad asset rendering
        </p>
      </div>

      {Object.entries(grouped).map(([platform, platformPresets]) => (
        <div key={platform}>
          <h2 className="mb-3 text-lg font-semibold capitalize">{platform}</h2>
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900">
                  <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                    Label
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                    Placement
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                    Dimensions
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                    Aspect Ratio
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                    Font Scale
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {platformPresets.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/50">
                    <td className="px-5 py-3 font-medium">{p.label}</td>
                    <td className="px-5 py-3 text-zinc-400">{p.placement}</td>
                    <td className="px-5 py-3 font-mono text-zinc-300">
                      {p.width} x {p.height}
                    </td>
                    <td className="px-5 py-3 text-zinc-400">{p.aspectRatio}</td>
                    <td className="px-5 py-3 text-zinc-400">{p.fontScale}x</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.isActive
                            ? "bg-emerald-900/50 text-emerald-400"
                            : "bg-zinc-700 text-zinc-400"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
