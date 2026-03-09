"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Check, Palette } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  primaryColor: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Preset {
  id: string;
  platform: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
}

interface TemplateFamily {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  previewBgCss: string | null;
  recommendedCategories: string[];
  supportedRatios: string[];
  generateMode: string;
}

interface Props {
  brands: Brand[];
  categories: Category[];
  presets: Preset[];
  families: TemplateFamily[];
}

const STEPS = ["Brand & Category", "Product Info", "Platforms", "Creative Style", "Generate"];

export function CampaignForm({ brands, categories, presets, families }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    brandId: brands[0]?.id || "",
    categoryId: categories[0]?.id || "",
    productName: "",
    productDescription: "",
    targetAudience: "",
    badgeText: "",
    backgroundImageUrl: "",
    selectedPresets: presets.map((p) => p.id),
    selectedFamilyId: families[0]?.id || "",
    copyVariants: 3,
  });

  const update = (field: string, value: string | number | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const togglePreset = (presetId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedPresets: prev.selectedPresets.includes(presetId)
        ? prev.selectedPresets.filter((id) => id !== presetId)
        : [...prev.selectedPresets, presetId],
    }));
  };

  const canProceed = () => {
    if (step === 1) return form.brandId && form.categoryId;
    if (step === 2) return form.name && form.productName;
    if (step === 3) return form.selectedPresets.length > 0;
    if (step === 4) return !!form.selectedFamilyId;
    return true;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/creatives/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign: {
            name: form.name,
            brandId: form.brandId,
            categoryId: form.categoryId,
            productName: form.productName,
            productDescription: form.productDescription || undefined,
            targetAudience: form.targetAudience || undefined,
            badgeText: form.badgeText || undefined,
            backgroundImageUrl: form.backgroundImageUrl || undefined,
            selectedFamilyId: form.selectedFamilyId || undefined,
          },
          platforms: form.selectedPresets,
          copyVariants: form.copyVariants,
          options: { generateBackgroundPrompt: true },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const result = await res.json();
      router.push(`/campaigns/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const groupedPresets = presets.reduce(
    (acc, p) => {
      if (!acc[p.platform]) acc[p.platform] = [];
      acc[p.platform].push(p);
      return acc;
    },
    {} as Record<string, Preset[]>
  );

  const selectedCategoryName = categories.find((c) => c.id === form.categoryId)?.name || "";
  const selectedFamily = families.find((f) => f.id === form.selectedFamilyId);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Steps indicator */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const s = i + 1;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  s === step
                    ? "bg-blue-600 text-white"
                    : s < step
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-6 ${s < step ? "bg-emerald-600" : "bg-zinc-800"}`} />
              )}
            </div>
          );
        })}
        <span className="ml-3 text-sm text-zinc-400">{STEPS[step - 1]}</span>
      </div>

      {/* Step 1: Brand & Category */}
      {step === 1 && (
        <div className="space-y-6">
          <FieldGroup label="Brand">
            <select
              value={form.brandId}
              onChange={(e) => update("brandId", e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="Category">
            <div className="grid grid-cols-3 gap-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => update("categoryId", c.id)}
                  className={`rounded-lg border p-3 text-center text-sm font-medium transition-colors ${
                    form.categoryId === c.id
                      ? "border-blue-500 bg-blue-600/10 text-blue-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>
      )}

      {/* Step 2: Product Info */}
      {step === 2 && (
        <div className="space-y-5">
          <FieldGroup label="Campaign Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g., Spring Launch 2026"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </FieldGroup>

          <FieldGroup label="Product Name">
            <input
              type="text"
              value={form.productName}
              onChange={(e) => update("productName", e.target.value)}
              placeholder="e.g., Timbel AI Meeting Notes"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </FieldGroup>

          <FieldGroup label="Product Description" optional>
            <textarea
              value={form.productDescription}
              onChange={(e) => update("productDescription", e.target.value)}
              placeholder="Brief description of the product..."
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </FieldGroup>

          <FieldGroup label="Target Audience" optional>
            <input
              type="text"
              value={form.targetAudience}
              onChange={(e) => update("targetAudience", e.target.value)}
              placeholder="e.g., VP of Operations at mid-size companies"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Badge Text" optional>
              <input
                type="text"
                value={form.badgeText}
                onChange={(e) => update("badgeText", e.target.value)}
                placeholder="e.g., Free Trial"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </FieldGroup>

            <FieldGroup label="Copy Variants">
              <select
                value={form.copyVariants}
                onChange={(e) => update("copyVariants", Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} variant{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </FieldGroup>
          </div>

          <FieldGroup label="Background Image URL" optional>
            <input
              type="url"
              value={form.backgroundImageUrl}
              onChange={(e) => update("backgroundImageUrl", e.target.value)}
              placeholder="https://... (leave empty for generated background)"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </FieldGroup>
        </div>
      )}

      {/* Step 3: Platform Selection */}
      {step === 3 && (
        <div className="space-y-6">
          {Object.entries(groupedPresets).map(([platform, platformPresets]) => (
            <div key={platform}>
              <h3 className="mb-3 text-sm font-semibold capitalize text-zinc-300">{platform}</h3>
              <div className="grid grid-cols-2 gap-3">
                {platformPresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePreset(p.id)}
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                      form.selectedPresets.includes(p.id)
                        ? "border-blue-500 bg-blue-600/10"
                        : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                      form.selectedPresets.includes(p.id) ? "border-blue-500 bg-blue-600" : "border-zinc-600"
                    }`}>
                      {form.selectedPresets.includes(p.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-zinc-500">{p.width}x{p.height} ({p.aspectRatio})</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 4: Creative Style Selection */}
      {step === 4 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Choose a visual style for your creatives. Each style has a unique composition, not just different colors.
          </p>

          <div className="grid gap-4">
            {families.map((fam) => {
              const isSelected = form.selectedFamilyId === fam.id;
              const isRecommended = fam.recommendedCategories.some(
                (rc) => selectedCategoryName.toLowerCase().includes(rc.toLowerCase()) || rc.toLowerCase().includes(selectedCategoryName.toLowerCase())
              );

              return (
                <button
                  key={fam.id}
                  onClick={() => update("selectedFamilyId", fam.id)}
                  className={`relative overflow-hidden rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/30"
                      : "border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {/* Preview gradient strip */}
                  <div
                    className="h-20 w-full"
                    style={{ background: fam.previewBgCss || "linear-gradient(135deg, #1a1a2e, #2563EB)" }}
                  >
                    {/* Mini composition hint */}
                    <div className="flex h-full items-center px-5">
                      <div className="flex flex-col gap-1">
                        <div className="h-2 w-24 rounded-full bg-white/60" />
                        <div className="h-1.5 w-16 rounded-full bg-white/30" />
                        <div className="mt-1 h-4 w-14 rounded bg-white/20" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-zinc-400" />
                          <h4 className="text-sm font-semibold">{fam.name}</h4>
                          {isRecommended && (
                            <span className="rounded bg-emerald-900/50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">{fam.description}</p>
                      </div>

                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isSelected ? "border-blue-500 bg-blue-600" : "border-zinc-600"
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {fam.supportedRatios.map((r) => (
                        <span key={r} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">{r}</span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 5: Review & Generate */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-4 font-semibold">Campaign Summary</h3>
            <dl className="space-y-3">
              <SummaryRow label="Campaign" value={form.name} />
              <SummaryRow label="Product" value={form.productName} />
              <SummaryRow label="Brand" value={brands.find((b) => b.id === form.brandId)?.name || ""} />
              <SummaryRow label="Category" value={selectedCategoryName} />
              <SummaryRow label="Creative Style" value={selectedFamily?.name || "Category Default"} />
              <SummaryRow label="Platforms" value={`${form.selectedPresets.length} sizes selected`} />
              <SummaryRow label="Copy Variants" value={String(form.copyVariants)} />
              <SummaryRow label="Total Assets" value={`${form.selectedPresets.length * form.copyVariants} images`} />
            </dl>
          </div>

          {/* Style preview */}
          {selectedFamily && (
            <div className="overflow-hidden rounded-xl border border-zinc-800">
              <div
                className="h-24 w-full"
                style={{ background: selectedFamily.previewBgCss || "" }}
              />
              <div className="bg-zinc-900 px-4 py-3">
                <p className="text-xs text-zinc-500">
                  Style: <span className="text-zinc-300">{selectedFamily.name}</span>
                  {" — "}
                  {selectedFamily.description}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-30"
        >
          Back
        </button>

        {step < 5 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-30"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Creatives
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function FieldGroup({
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
