import {
  AdminStat,
  DrawerPanel,
  GlassCard,
  MiniBars,
  PageHero,
  PageSection,
  SiteChrome,
} from "@/components/promptrak/primitives";
import { getAlerts, getMetrics, getMetricsDetails, getReadiness } from "@/lib/api/ops";
import { getPatternStats } from "@/lib/api/patterns";
import type { PolicyAction } from "@/lib/api/types";

export default async function DashboardPage() {
  let metrics = {} as Record<string, number>;
  let details = { gateway_action: {} as Partial<Record<PolicyAction, number>> };
  let alertsData = { alerts: [] as { title: string; severity: string }[] };
  let readiness: { status: string; gemini: string; intent_model?: string; router_model?: string } = { status: "unknown", gemini: "unknown" };
  let patternStats = { promoted: 0, candidate: 0, retired: 0, shadow_rejected: 0 };

  try {
    [metrics, details, alertsData, readiness, patternStats] = await Promise.all([
      getMetrics(),
      getMetricsDetails(),
      getAlerts(),
      getReadiness(),
      getPatternStats(),
    ]);
  } catch {
    // Backend unreachable — fall through to show zeros
  }

  const totalRequests = Object.values(metrics).reduce((a, b) => a + b, 0);
  const blockedCount  = Math.round((metrics["block"]  ?? 0));
  const allowedCount  = Math.round((metrics["allow"]  ?? 0));

  const dashboardStats = [
    { label: "Protected Requests", value: totalRequests > 0 ? totalRequests.toLocaleString() : "—", delta: "+live" },
    { label: "Leakage Blocks",     value: blockedCount > 0  ? blockedCount.toLocaleString()  : "0",  delta: "active" },
    { label: "Promoted Patterns",  value: patternStats.promoted.toString(), delta: `${patternStats.candidate} pending` },
    { label: "Allowed Requests",   value: allowedCount > 0  ? allowedCount.toLocaleString()  : "0",  delta: "clean" },
    { label: "AI Connector",        value: readiness.gemini === "configured" ? "Healthy" : "Unavailable", delta: readiness.status },
  ];

  const actionEntries = Object.entries(details.gateway_action ?? {});
  const policyActionBars = actionEntries.length > 0
    ? actionEntries.map(([action, count]) => ({ label: action, value: String(count ?? 0) }))
    : [
        { label: "allow",    value: String(metrics["allow"]    ?? 0) },
        { label: "sanitize", value: String(metrics["sanitize"] ?? 0) },
        { label: "minimize", value: String(metrics["minimize"] ?? 0) },
        { label: "block",    value: String(metrics["block"]    ?? 0) },
      ];

  const recentAlerts = alertsData.alerts.slice(0, 5);

  return (
    <SiteChrome>
      <PageHero
        eyebrow="Admin Dashboard"
        title="Operational maturity without dashboard noise."
        description="Live metrics, policy posture, and system health pulled directly from the Agenvia backend."
      />

      <PageSection
        eyebrow="Overview"
        title="Top-line trust operations."
        description="Real-time stats from the gateway."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {dashboardStats.map((stat) => (
            <AdminStat key={stat.label} {...stat} />
          ))}
        </div>
      </PageSection>

      <section className="container pb-24">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_0.9fr]">
          <GlassCard className="space-y-4">
            <div className="font-heading text-2xl font-semibold tracking-tight text-zinc-50">
              Request activity
            </div>
            <MiniBars
              values={[
                { label: "allow",    value: String(metrics["allow"]    ?? 0) },
                { label: "sanitize", value: String(metrics["sanitize"] ?? 0) },
                { label: "minimize", value: String(metrics["minimize"] ?? 0) },
                { label: "block",    value: String(metrics["block"]    ?? 0) },
              ]}
            />
          </GlassCard>

          <GlassCard className="space-y-4">
            <div className="font-heading text-2xl font-semibold tracking-tight text-zinc-50">
              Policy action breakdown
            </div>
            <MiniBars values={policyActionBars} tone="amber" />
          </GlassCard>

          <div className="space-y-4">
            <DrawerPanel title="System Health">
              <p>Backend: <strong>{readiness.status}</strong></p>
              <p>AI Connector: <strong>{readiness.gemini === "configured" ? "Healthy" : "Unavailable"}</strong></p>
              <p>Promoted patterns: <strong>{patternStats.promoted}</strong></p>
              <p>Candidate patterns: <strong>{patternStats.candidate}</strong></p>
            </DrawerPanel>

            <DrawerPanel title="Recent Alerts">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((a, i) => (
                  <p key={i} className="text-sm">
                    <span className={`font-semibold ${a.severity === "High" ? "text-rose-600" : a.severity === "Medium" ? "text-amber-600" : "text-teal-600"}`}>
                      [{a.severity}]
                    </span>{" "}
                    {a.title}
                  </p>
                ))
              ) : (
                <p className="text-sm text-zinc-400">No recent alerts.</p>
              )}
            </DrawerPanel>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
