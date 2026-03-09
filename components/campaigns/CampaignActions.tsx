"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, RotateCcw, Loader2 } from "lucide-react";

export function RegenerateActions({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [copyLoading, setCopyLoading] = useState(false);
  const [assetLoading, setAssetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regenerateCopy = async () => {
    setCopyLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/campaigns/${campaignId}/regenerate-copy`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCopyLoading(false);
    }
  };

  const regenerateAssets = async () => {
    setAssetLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/campaigns/${campaignId}/regenerate-assets`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAssetLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={regenerateCopy}
        disabled={copyLoading || assetLoading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
      >
        {copyLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        Regenerate Copy
      </button>
      <button
        onClick={regenerateAssets}
        disabled={copyLoading || assetLoading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
      >
        {assetLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
        Re-render Assets
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export function AssetStatusButton({ assetId, currentStatus }: { assetId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const TRANSITIONS: Record<string, { label: string; next: string; color: string }[]> = {
    generated: [
      { label: "Approve", next: "approved", color: "bg-emerald-600 hover:bg-emerald-500" },
      { label: "Reject", next: "rejected", color: "bg-red-600 hover:bg-red-500" },
    ],
    approved: [
      { label: "Publish", next: "published", color: "bg-blue-600 hover:bg-blue-500" },
      { label: "Reject", next: "rejected", color: "bg-red-600 hover:bg-red-500" },
    ],
    rejected: [
      { label: "Reset", next: "generated", color: "bg-zinc-600 hover:bg-zinc-500" },
    ],
    published: [],
  };

  const actions = TRANSITIONS[currentStatus] || [];
  if (actions.length === 0) return null;

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      await fetch(`/api/v1/assets/${assetId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-1">
      {actions.map((a) => (
        <button
          key={a.next}
          onClick={(e) => { e.stopPropagation(); updateStatus(a.next); }}
          disabled={loading}
          className={`rounded px-2 py-0.5 text-[10px] font-medium text-white ${a.color} disabled:opacity-50`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
