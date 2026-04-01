import {
  GlassCard,
  PageHero,
  PageSection,
  SiteChrome,
} from "@/components/promptrak/primitives";
import { getAlerts } from "@/lib/api/ops";
import type { AlertSeverity } from "@/lib/api/types";

const severityStyles: Record<AlertSeverity, string> = {
  High:   "border-rose-500/20 bg-rose-500/10 text-rose-300",
  Medium: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Low:    "border-teal-500/20 bg-teal-500/10 text-teal-300",
};

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function AlertsPage() {
  let alerts: Awaited<ReturnType<typeof getAlerts>>["alerts"] = [];
  try {
    const data = await getAlerts();
    alerts = data.alerts ?? [];
  } catch {
    // Backend unreachable
  }

  return (
    <SiteChrome>
      <PageHero
        eyebrow="Alerts and Incidents"
        title="Clarity fast, without turning everything red."
        description="Security and platform teams get severity, tenant, stage, and next action at a glance."
      />

      <PageSection
        eyebrow="Incidents"
        title="Live incident feed from the gateway."
        description="Pulled directly from the backend. Red is reserved for true incidents."
      >
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <GlassCard>
              <p className="text-sm text-zinc-400">No alerts found. The system is operating normally.</p>
            </GlassCard>
          ) : (
            alerts.map((alert) => {
              const sev = (alert.severity ?? "Low") as AlertSeverity;
              return (
                <GlassCard key={alert.alert_id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${severityStyles[sev] ?? severityStyles.Low}`}>
                        {sev}
                      </div>
                      <div className="font-heading text-2xl font-semibold tracking-tight text-zinc-50">
                        {alert.title}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {formatTime(alert.created_at)} · {alert.tenant_id} · {alert.stage ?? "gateway"}
                      </div>
                    </div>
                    {alert.detail && (
                      <div className="max-w-md rounded-2xl border border-zinc-700 bg-zinc-800/90 p-4 text-sm leading-6 text-zinc-400">
                        {alert.detail}
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </PageSection>
    </SiteChrome>
  );
}
