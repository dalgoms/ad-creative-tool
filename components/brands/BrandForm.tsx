"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  logoUrl: string | null;
}

export function BrandForm({ brand }: { brand?: Brand }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: brand?.name || "",
    primaryColor: brand?.primaryColor || "#2563EB",
    secondaryColor: brand?.secondaryColor || "#1E40AF",
    accentColor: brand?.accentColor || "#F59E0B",
    headingFont: brand?.headingFont || "Inter",
    bodyFont: brand?.bodyFont || "Inter",
    logoUrl: brand?.logoUrl || "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = brand ? `/api/v1/brands/${brand.id}` : "/api/v1/brands";
      const method = brand ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          logoUrl: form.logoUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save brand");
      }

      router.push("/brands");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="space-y-5">
          <Field label="Brand Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <ColorField
              label="Primary"
              value={form.primaryColor}
              onChange={(v) => update("primaryColor", v)}
            />
            <ColorField
              label="Secondary"
              value={form.secondaryColor}
              onChange={(v) => update("secondaryColor", v)}
            />
            <ColorField
              label="Accent"
              value={form.accentColor}
              onChange={(v) => update("accentColor", v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Heading Font">
              <input
                type="text"
                value={form.headingFont}
                onChange={(e) => update("headingFont", e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </Field>
            <Field label="Body Font">
              <input
                type="text"
                value={form.bodyFont}
                onChange={(e) => update("bodyFont", e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </Field>
          </div>

          <Field label="Logo URL" optional>
            <input
              type="url"
              value={form.logoUrl}
              onChange={(e) => update("logoUrl", e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </Field>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-4 text-sm font-semibold text-zinc-400">Preview</h3>
        <div className="flex items-center gap-4">
          {form.logoUrl && (
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.logoUrl}
                alt="Logo"
                className="max-h-full max-w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}
          <div className="flex gap-1">
            {[form.primaryColor, form.secondaryColor, form.accentColor].map(
              (color, i) => (
                <div
                  key={i}
                  className="h-12 w-12 rounded-lg border border-zinc-700"
                  style={{ backgroundColor: color }}
                />
              )
            )}
          </div>
        </div>
        <p
          className="mt-4 text-xl font-bold"
          style={{ fontFamily: form.headingFont }}
        >
          {form.name || "Brand Name"}
        </p>
        <p className="mt-1 text-sm text-zinc-400" style={{ fontFamily: form.bodyFont }}>
          Sample body text in {form.bodyFont}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !form.name}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {brand ? "Save Changes" : "Create Brand"}
      </button>
    </div>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
        {optional && <span className="ml-1 text-xs text-zinc-600">optional</span>}
      </label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded-lg border border-zinc-700 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
