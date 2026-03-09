"use client";

import { useState } from "react";
import { Download, X } from "lucide-react";
import { AssetStatusButton } from "./CampaignActions";

interface Asset {
  id: string;
  fileUrl: string;
  fileSizeKb: number | null;
  format: string;
  status: string;
  publishedAt: string | Date | null;
  preset: {
    label: string;
    width: number;
    height: number;
    platform: string;
  };
  copyVariant: {
    headline: string;
    variantIndex: number;
  };
  template: {
    name: string;
  };
}

const STATUS_STYLES: Record<string, string> = {
  generated: "bg-zinc-700 text-zinc-300",
  approved: "bg-emerald-900/50 text-emerald-400",
  rejected: "bg-red-900/50 text-red-400",
  published: "bg-blue-900/50 text-blue-400",
};

export function AssetGrid({ assets }: { assets: Asset[] }) {
  const [preview, setPreview] = useState<Asset | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const platforms = [...new Set(assets.map((a) => a.preset.platform))];
  const statuses = [...new Set(assets.map((a) => a.status))];

  const filtered = assets
    .filter((a) => filter === "all" || a.preset.platform === filter)
    .filter((a) => statusFilter === "all" || a.status === statusFilter);

  return (
    <>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {platforms.length > 1 && (
          <>
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              All ({assets.length})
            </FilterButton>
            {platforms.map((p) => (
              <FilterButton key={p} active={filter === p} onClick={() => setFilter(p)}>
                <span className="capitalize">{p}</span> ({assets.filter((a) => a.preset.platform === p).length})
              </FilterButton>
            ))}
            <div className="w-px bg-zinc-800" />
          </>
        )}
        {statuses.length > 1 && (
          <>
            <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
              Any status
            </FilterButton>
            {statuses.map((s) => (
              <FilterButton key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                <span className="capitalize">{s}</span> ({assets.filter((a) => a.status === s).length})
              </FilterButton>
            ))}
          </>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="group cursor-pointer overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800/30 transition-colors hover:border-zinc-700"
            onClick={() => setPreview(asset)}
          >
            <div
              className="relative flex items-center justify-center bg-zinc-900 p-2"
              style={{
                aspectRatio: `${asset.preset.width}/${asset.preset.height}`,
                maxHeight: 200,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.fileUrl}
                alt={asset.copyVariant.headline}
                className="h-full w-full object-contain"
              />
              <span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[asset.status] || STATUS_STYLES.generated}`}>
                {asset.status}
              </span>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <p className="truncate text-xs font-medium">{asset.preset.label}</p>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                V{asset.copyVariant.variantIndex + 1} &middot; {asset.preset.width}x{asset.preset.height}
                {asset.fileSizeKb && ` \u00b7 ${asset.fileSizeKb}KB`}
              </p>
              <div className="mt-2">
                <AssetStatusButton assetId={asset.id} currentStatus={asset.status} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreview(null)}
              className="absolute -right-4 -top-4 rounded-full bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.fileUrl}
              alt={preview.copyVariant.headline}
              className="max-h-[80vh] rounded-lg"
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{preview.preset.label}</p>
                <p className="text-sm text-zinc-400">
                  {preview.preset.width}x{preview.preset.height} &middot; Variant{" "}
                  {preview.copyVariant.variantIndex + 1} &middot; {preview.template.name}
                </p>
                <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[preview.status] || STATUS_STYLES.generated}`}>
                  {preview.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AssetStatusButton assetId={preview.id} currentStatus={preview.status} />
                <a
                  href={preview.fileUrl}
                  download
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  <Download className="h-4 w-4" /> Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-zinc-700 text-white"
          : "bg-zinc-800/50 text-zinc-400 hover:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}
