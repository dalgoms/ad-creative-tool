"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  TestTube,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface WebhookDelivery {
  id: string;
  event: string;
  statusCode: number | null;
  error: string | null;
  durationMs: number | null;
  deliveredAt: Date | string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  isActive: boolean;
  createdAt: Date | string;
  _count: { deliveries: number };
  deliveries: WebhookDelivery[];
}

const AVAILABLE_EVENTS = [
  { id: "creative.completed", label: "Creative Completed" },
  { id: "creative.failed", label: "Creative Failed" },
  { id: "webhook.test", label: "Webhook Test" },
];

export function WebhookManager({ webhooks: initial }: { webhooks: Webhook[] }) {
  const router = useRouter();
  const [webhooks, setWebhooks] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    id: string;
    success: boolean;
    message: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    url: "",
    secret: "",
    events: ["creative.completed"] as string[],
  });

  const handleCreate = async () => {
    const res = await fetch("/api/v1/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowForm(false);
      setForm({ name: "", url: "", secret: "", events: ["creative.completed"] });
      router.refresh();
      const created = await res.json();
      setWebhooks((prev) => [
        { ...created, _count: { deliveries: 0 }, deliveries: [] },
        ...prev,
      ]);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/v1/webhooks/${id}`, { method: "DELETE" });
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch(`/api/v1/webhooks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !isActive } : w))
    );
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);

    try {
      const res = await fetch(`/api/v1/webhooks/${id}/test`, {
        method: "POST",
      });
      const data = await res.json();

      setTestResult({
        id,
        success: data.delivery?.statusCode
          ? data.delivery.statusCode >= 200 && data.delivery.statusCode < 300
          : false,
        message: data.delivery?.statusCode
          ? `Status ${data.delivery.statusCode} (${data.delivery.durationMs}ms)`
          : data.delivery?.error || "No response",
      });
    } catch {
      setTestResult({ id, success: false, message: "Test request failed" });
    } finally {
      setTestingId(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter((e) => e !== eventId)
        : [...prev.events, eventId],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Outbound Webhooks ({webhooks.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Webhook
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g., Make - Creative Pipeline"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Signing Secret{" "}
                <span className="text-xs text-zinc-600">optional</span>
              </label>
              <input
                type="text"
                value={form.secret}
                onChange={(e) =>
                  setForm((p) => ({ ...p, secret: e.target.value }))
                }
                placeholder="HMAC secret for signature verification"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Webhook URL
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) =>
                setForm((p) => ({ ...p, url: e.target.value }))
              }
              placeholder="https://hook.us1.make.com/..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Events
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_EVENTS.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => toggleEvent(evt.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.events.includes(evt.id)
                      ? "border-blue-500 bg-blue-600/10 text-blue-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {evt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={!form.name || !form.url || form.events.length === 0}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
            >
              Create Webhook
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Webhook List */}
      {webhooks.length === 0 && !showForm ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-12 text-center">
          <p className="text-sm text-zinc-500">
            No webhooks configured. Add one to receive events when creatives are
            generated.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4">
                <div
                  className="flex cursor-pointer items-center gap-3"
                  onClick={() =>
                    setExpandedId(expandedId === wh.id ? null : wh.id)
                  }
                >
                  {expandedId === wh.id ? (
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-zinc-500" />
                  )}
                  <div>
                    <p className="font-medium">{wh.name}</p>
                    <p className="mt-0.5 text-xs font-mono text-zinc-500 truncate max-w-md">
                      {wh.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {wh.events.map((e) => (
                      <span
                        key={e}
                        className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleToggle(wh.id, wh.isActive)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      wh.isActive
                        ? "bg-emerald-900/50 text-emerald-400"
                        : "bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    {wh.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleTest(wh.id)}
                    disabled={testingId === wh.id}
                    className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                    title="Send test event"
                  >
                    {testingId === wh.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <TestTube className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(wh.id)}
                    className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:bg-red-900/50 hover:text-red-400"
                    title="Delete webhook"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Test result */}
              {testResult && testResult.id === wh.id && (
                <div
                  className={`mx-5 mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                    testResult.success
                      ? "border-emerald-800 bg-emerald-950/30 text-emerald-400"
                      : "border-red-800 bg-red-950/30 text-red-400"
                  }`}
                >
                  {testResult.success ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  {testResult.message}
                </div>
              )}

              {/* Delivery Log */}
              {expandedId === wh.id && (
                <div className="border-t border-zinc-800 px-5 py-3">
                  <p className="mb-2 text-xs font-semibold text-zinc-400">
                    Recent Deliveries ({wh._count.deliveries} total)
                  </p>
                  {wh.deliveries.length === 0 ? (
                    <p className="text-xs text-zinc-600">
                      No deliveries yet
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {wh.deliveries.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-mono ${
                                d.statusCode && d.statusCode < 300
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {d.statusCode || "ERR"}
                            </span>
                            <span className="text-zinc-400">{d.event}</span>
                          </div>
                          <div className="flex items-center gap-3 text-zinc-500">
                            {d.durationMs && <span>{d.durationMs}ms</span>}
                            <span>
                              {new Date(d.deliveredAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
