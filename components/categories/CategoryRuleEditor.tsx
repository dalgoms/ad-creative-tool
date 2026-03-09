"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import type { Prisma } from "@prisma/client";

type CategoryRule = Prisma.CategoryRuleGetPayload<object>;

export function CategoryRuleEditor({
  category,
}: {
  category: CategoryRule;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [json, setJson] = useState(() =>
    JSON.stringify(
      {
        keywords: category.keywords,
        tone: category.tone,
        copyRules: category.copyRules,
        visualDirection: category.visualDirection,
        templateMapping: category.templateMapping,
      },
      null,
      2
    )
  );

  const [isValidJson, setIsValidJson] = useState(true);

  const handleJsonChange = (value: string) => {
    setJson(value);
    setSuccess(false);
    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const handleSave = async () => {
    if (!isValidJson) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = JSON.parse(json);
      const res = await fetch(`/api/v1/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick View Cards */}
      <div className="grid grid-cols-2 gap-4">
        <QuickCard
          title="Tone"
          data={category.tone as Record<string, unknown>}
        />
        <QuickCard
          title="Keywords"
          data={category.keywords as Record<string, unknown>}
        />
        <QuickCard
          title="Visual Direction"
          data={category.visualDirection as Record<string, unknown>}
        />
        <QuickCard
          title="Template Mapping"
          data={category.templateMapping as Record<string, unknown>}
        />
      </div>

      {/* JSON Editor */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
          <h3 className="text-sm font-semibold">Rule JSON Editor</h3>
          <div className="flex items-center gap-2">
            {!isValidJson && (
              <span className="text-xs text-red-400">Invalid JSON</span>
            )}
            {success && (
              <span className="text-xs text-emerald-400">Saved (v{category.version + 1})</span>
            )}
          </div>
        </div>
        <textarea
          value={json}
          onChange={(e) => handleJsonChange(e.target.value)}
          rows={30}
          spellCheck={false}
          className={`w-full bg-transparent p-5 font-mono text-xs leading-relaxed focus:outline-none ${
            isValidJson ? "text-zinc-300" : "text-red-300"
          }`}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading || !isValidJson}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save & Increment Version
      </button>
    </div>
  );
}

function QuickCard({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown>;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4">
      <h4 className="mb-2 text-xs font-semibold text-zinc-400">{title}</h4>
      <div className="space-y-1">
        {Object.entries(data)
          .slice(0, 4)
          .map(([key, value]) => (
            <div key={key} className="flex items-start gap-2 text-xs">
              <span className="w-24 shrink-0 text-zinc-500">{key}</span>
              <span className="truncate text-zinc-300">
                {Array.isArray(value)
                  ? value.slice(0, 3).join(", ") +
                    (value.length > 3 ? "..." : "")
                  : typeof value === "object"
                    ? JSON.stringify(value).slice(0, 50)
                    : String(value)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
