"use client";
import { useState } from "react";
import { useRetirePattern } from "@/hooks/use-retire-pattern";
import { GlassCard, DrawerPanel } from "@/components/promptrak/primitives";
import type { FLPattern, PatternStats, PatternStatus } from "@/lib/api/types";

const statusStyles: Record<PatternStatus, string> = {
  promoted:         "bg-teal-500/10 text-teal-300 border-teal-500/20",
  candidate:        "bg-amber-500/10 text-amber-300 border-amber-500/20",
  retired:          "bg-zinc-800 text-zinc-400 border-zinc-700",
  shadow_rejected:  "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

export default function PatternTable({
  initialPatterns,
  initialStats,
}: {
  initialPatterns: FLPattern[];
  initialStats: PatternStats;
}) {
  const [patterns, setPatterns] = useState<FLPattern[]>(initialPatterns);
  const [filter, setFilter] = useState<string>("all");
  const stats = initialStats;

  const { retire, retiring, error } = useRetirePattern((id) => {
    setPatterns((prev) =>
      prev.map((p) => (p.pattern_id === id ? { ...p, status: "retired" as PatternStatus } : p))
    );
  });

  const filtered = filter === "all" ? patterns : patterns.filter((p) => p.status === filter);

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    try {
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  return (
    <>
      <GlassCard className="overflow-hidden p-0">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 px-6 py-4">
          {["all", "promoted", "candidate", "retired", "shadow_rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                filter === s
                  ? "border-zinc-700 bg-zinc-900 text-white"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {s === "all" ? `All (${patterns.length})` : `${s} (${stats[s as keyof PatternStats] ?? 0})`}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1.5fr_1.2fr_0.8fr_0.7fr_0.7fr_1fr_1fr_0.7fr] gap-4 border-b border-zinc-800 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          <div>Pattern</div>
          <div>Label</div>
          <div>Confidence</div>
          <div>Votes</div>
          <div>Tenants</div>
          <div>Status</div>
          <div>Promoted</div>
          <div>Action</div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-6 py-8 text-sm text-zinc-400">No patterns found for this filter.</div>
        ) : (
          filtered.map((row) => (
            <div
              key={row.pattern_id}
              className="grid grid-cols-[1.5fr_1.2fr_0.8fr_0.7fr_0.7fr_1fr_1fr_0.7fr] gap-4 border-b border-zinc-800 px-6 py-4 text-sm last:border-b-0"
            >
              <div className="font-mono text-xs text-zinc-200 truncate" title={row.pattern}>{row.pattern}</div>
              <div className="text-zinc-300">{row.label}</div>
              <div>{(row.confidence * 100).toFixed(0)}%</div>
              <div>{row.votes}</div>
              <div>{row.tenant_count}</div>
              <div>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[row.status]}`}>
                  {row.status.replace("_", " ")}
                </span>
              </div>
              <div className="text-zinc-500">{formatDate(row.promoted_at)}</div>
              <div>
                {row.status !== "retired" && row.status !== "shadow_rejected" && (
                  <button
                    onClick={() => retire(row.pattern_id)}
                    disabled={retiring === row.pattern_id}
                    className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-xs text-rose-300 hover:bg-rose-500/20 disabled:opacity-40 transition-colors"
                  >
                    {retiring === row.pattern_id ? "…" : "Retire"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </GlassCard>

      {error && <p className="text-sm text-rose-600">Error: {error}</p>}

      <div className="grid gap-4 md:grid-cols-3 mt-4">
        <DrawerPanel title="Promotion Logic">
          <p>Patterns require cross-tenant votes before promotion. Confidence threshold and shadow test results gate each pattern.</p>
          <p className="mt-2 text-xs text-zinc-500">{stats.promoted} promoted · {stats.candidate} candidate</p>
        </DrawerPanel>
        <DrawerPanel title="Filters">
          <p>Use the filter bar above to view promoted, candidate, shadow rejected, and retired pattern states.</p>
        </DrawerPanel>
        <DrawerPanel title="Retirement Reason">
          <p>Click Retire on any active pattern to immediately exclude it from the live detector on the next FL hot-reload (≤5 min).</p>
          <p className="mt-2 text-xs text-zinc-500">{stats.retired} retired · {stats.shadow_rejected} shadow rejected</p>
        </DrawerPanel>
      </div>
    </>
  );
}
