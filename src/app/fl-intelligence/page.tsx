import {
  DrawerPanel,
  GlassCard,
  MiniBars,
  PageHero,
  PageSection,
  SiteChrome,
} from "@/components/agenvia/primitives";
import { listPatterns, getPatternStats } from "@/lib/api/patterns";
import type { FLPattern } from "@/lib/api/types";

function groupByLabel(patterns: FLPattern[]) {
  const counts: Record<string, number> = {};
  for (const p of patterns) {
    counts[p.label] = (counts[p.label] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count]) => ({ label, value: String(count) }));
}

function groupByTenantCount(patterns: FLPattern[]) {
  const bins = { "1": 0, "2-3": 0, "4+": 0 };
  for (const p of patterns) {
    if (p.tenant_count === 1) bins["1"]++;
    else if (p.tenant_count <= 3) bins["2-3"]++;
    else bins["4+"]++;
  }
  return [
    { label: "1 tenant",  value: String(bins["1"]) },
    { label: "2–3 tenants", value: String(bins["2-3"]) },
    { label: "4+ tenants", value: String(bins["4+"]) },
  ];
}

export default async function FLIntelligencePage() {
  let stats = { promoted: 0, candidate: 0, retired: 0, shadow_rejected: 0 };
  let promoted: FLPattern[] = [];

  try {
    const [statsData, patternsData] = await Promise.all([
      getPatternStats(),
      listPatterns("promoted"),
    ]);
    stats   = statsData;
    promoted = patternsData.patterns ?? [];
  } catch {
    // Backend unreachable
  }

  const labelBars   = groupByLabel(promoted);
  const tenantBars  = groupByTenantCount(promoted);
  const total       = stats.promoted + stats.candidate + stats.retired + stats.shadow_rejected;

  return (
    <SiteChrome>
      <PageHero
        eyebrow="FL Intelligence"
        title="How Agenvia learns without centralizing raw data."
        description="Live federated learning analytics — tenant nodes, promoted patterns, shadow rejects, and contribution breakdowns from the real backend."
      />

      <PageSection
        eyebrow="Main Visual"
        title="Multiple tenant nodes, one promoted pattern system."
        description="Local candidate patterns are generated privately, confirmed through votes, and promoted back into the detector when confidence is high."
      >
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <GlassCard className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {promoted.slice(0, 3).map((p, i) => (
                <div key={p.pattern_id} className="rounded-2xl border border-zinc-700 bg-zinc-800/90 p-4 text-sm text-zinc-300">
                  <div className="font-medium text-zinc-200">Tenant {String.fromCharCode(65 + i)}</div>
                  <div className="mt-1 font-mono text-xs text-zinc-500 truncate" title={p.pattern}>{p.pattern}</div>
                  <div className="mt-2 text-xs text-zinc-500">
                    {p.votes} votes · {p.tenant_count} tenant{p.tenant_count !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
              {promoted.length === 0 && (
                <>
                  {["Tenant A", "Tenant B", "Tenant C"].map((node) => (
                    <div key={node} className="rounded-2xl border border-zinc-700 bg-zinc-800/90 p-4 text-sm text-zinc-300">
                      {node}
                      <div className="mt-2 text-xs text-zinc-500">Local candidate patterns</div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className="rounded-[24px] border border-dashed border-teal-500/20 bg-teal-500/10/70 p-6 text-center text-sm text-teal-300">
              Votes converge into a shared promoted pattern · {stats.promoted} promoted across all tenants
            </div>
            <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4 text-sm text-teal-200">
              Promoted pattern flows back into the global detector · {stats.candidate} candidates pending
            </div>
          </GlassCard>

          <div className="space-y-4">
            <DrawerPanel title="Candidate Patterns">
              <p>New local proposals wait in shadow before they influence routing.</p>
              <p className="mt-2 font-semibold text-amber-300">{stats.candidate} pending candidates</p>
            </DrawerPanel>
            <DrawerPanel title="Promoted Patterns">
              <p>Only high-confidence, cross-tenant signals enter the shared detector layer.</p>
              <p className="mt-2 font-semibold text-teal-300">{stats.promoted} promoted patterns live</p>
            </DrawerPanel>
            <DrawerPanel title="Shadow Rejected / Retired">
              <p>Weak or stale patterns remain visible for auditability and future review.</p>
              <p className="mt-2 text-sm text-zinc-500">{stats.shadow_rejected} shadow rejected · {stats.retired} retired</p>
            </DrawerPanel>
          </div>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Analytics"
        title="Concrete charts, not academic abstractions."
        description="Live data from the federated pattern repository."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <GlassCard>
            <div className="mb-4 font-heading text-xl font-semibold text-zinc-50">Pattern states</div>
            <MiniBars values={[
              { label: "promoted",  value: String(stats.promoted) },
              { label: "candidate", value: String(stats.candidate) },
              { label: "retired",   value: String(stats.retired) },
              { label: "rejected",  value: String(stats.shadow_rejected) },
            ]} />
          </GlassCard>

          <GlassCard>
            <div className="mb-4 font-heading text-xl font-semibold text-zinc-50">Promoted pattern growth</div>
            <MiniBars values={[
              { label: "total",    value: String(total) },
              { label: "promoted", value: String(stats.promoted) },
              { label: "active",   value: String(stats.promoted) },
            ]} />
          </GlassCard>

          <GlassCard>
            <div className="mb-4 font-heading text-xl font-semibold text-zinc-50">Tenant contribution</div>
            <MiniBars values={tenantBars.length > 0 ? tenantBars : [{ label: "no data", value: "0" }]} tone="amber" />
          </GlassCard>

          <GlassCard>
            <div className="mb-4 font-heading text-xl font-semibold text-zinc-50">Pattern categories learned</div>
            <MiniBars values={labelBars.length > 0 ? labelBars : [{ label: "no data", value: "0" }]} tone="red" />
          </GlassCard>
        </div>
      </PageSection>
    </SiteChrome>
  );
}
