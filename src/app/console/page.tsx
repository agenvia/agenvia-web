"use client";

import { useEffect, useState } from "react";
import { useConsoleAuth } from "@/lib/console-auth";
import { AlertTriangle, CheckCircle, ShieldOff, Activity, RefreshCw } from "lucide-react";
import type { MetricsSummary, MetricsDetails, Alert, AlertsResponse } from "@/lib/api/types";

// ── Primitives ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "default" | "red" | "amber" | "teal" | "emerald";
}) {
  const colors = {
    default: "text-zinc-50",
    red:     "text-red-400",
    amber:   "text-amber-400",
    teal:    "text-teal-400",
    emerald: "text-emerald-400",
  };
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${colors[color]}`}>{value}</p>
      {sub && <p className="mt-1.5 text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const s = severity.toLowerCase();
  const styles =
    s === "high"   ? "bg-red-500/10 text-red-400 border-red-500/20" :
    s === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                     "bg-blue-500/10 text-blue-400 border-blue-500/20";
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${styles}`}>
      {severity}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ConsolePage() {
  const { authFetch, role, tenantId } = useConsoleAuth();
  const isAdmin = role === "superadmin";
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [details, setDetails] = useState<MetricsDetails | null>(null);
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [m, d, a] = await Promise.all([
        authFetch<MetricsSummary>("/metrics"),
        authFetch<MetricsDetails>("/metrics/details"),
        authFetch<AlertsResponse>("/alerts"),
      ]);
      setMetrics(m);
      setDetails(d);
      setAlerts(a.alerts ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const actionCounts = details?.gateway_action ?? {};
  const total     = Object.values(actionCounts).reduce((s, v) => s + (v ?? 0), 0);
  const blocked   = actionCounts["block"]    ?? 0;
  const allowed   = actionCounts["allow"]    ?? 0;
  const minimized = actionCounts["minimize"] ?? 0;
  const recentAlerts = alerts.slice(0, 8);

  // Fixed order for Action Breakdown bars
  const ACTION_ORDER: [string, string][] = [
    ["minimize", "bg-blue-500"],
    ["allow",    "bg-emerald-500"],
    ["block",    "bg-red-500"],
    ["sanitize", "bg-amber-500"],
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-teal-950/30 px-6 py-4 sticky top-0 z-40 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-400">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              Live
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {isAdmin ? "Platform Admin · All Tenants" : `Security Console · ${tenantId ?? "org"}`}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-50 tracking-tight">
            {isAdmin ? "Platform Overview" : "Security Dashboard"}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-400 max-w-lg">
            {isAdmin
              ? "Cross-tenant visibility across all Agenvia client organizations."
              : "Real-time visibility into your AI gateway — every prompt, policy decision, and security event."}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 transition-colors shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <main className="p-6 max-w-screen-xl mx-auto space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Requests" value={loading ? "—" : total}     sub="All time" />
          <StatCard label="Blocked"        value={loading ? "—" : blocked}   sub="Policy violations" color="red" />
          <StatCard label="Minimized"      value={loading ? "—" : minimized} sub="Context stripped"   color="teal" />
          <StatCard label="Allowed"        value={loading ? "—" : allowed}   sub="Clean requests"    color="emerald" />
        </div>

        {/* Metrics breakdown + Recent alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Action breakdown */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
                <Activity className="h-4 w-4 text-zinc-500" /> Action Breakdown
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {loading ? (
                <p className="text-xs text-zinc-600">Loading...</p>
              ) : total === 0 ? (
                <p className="text-xs text-zinc-600">No data yet.</p>
              ) : (
                ACTION_ORDER.map(([action, barColor]) => {
                  const count = (actionCounts as Record<string, number>)[action] ?? 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const label =
                    action === "minimize" ? "Minimized" :
                    action === "allow"    ? "Allowed"   :
                    action === "block"    ? "Blocked"   :
                    action === "sanitize" ? "Sanitized" : action;
                  return (
                    <div key={action}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-zinc-400">{label}</span>
                        <span className="text-xs tabular-nums text-zinc-300">{count} <span className="text-zinc-600">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-800">
                        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent alerts */}
          <div className="lg:col-span-2 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-zinc-500" /> Recent Alerts
              </h3>
              <a href="/console/alerts" className="text-xs text-teal-400 hover:text-teal-300">View all</a>
            </div>
            {loading ? (
              <div className="p-5 text-xs text-zinc-600">Loading...</div>
            ) : recentAlerts.length === 0 ? (
              <div className="p-5 flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle className="h-4 w-4" /> No alerts — all clear.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Severity</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Title</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAlerts.map((a) => (
                    <tr key={a.alert_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                      <td className="px-5 py-3"><SeverityBadge severity={a.severity} /></td>
                      <td className="px-5 py-3 text-sm text-zinc-300">{a.title}</td>
                      <td className="px-5 py-3 text-xs text-zinc-500 tabular-nums">
                        {new Date(a.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>

        {/* System metrics */}
        {metrics && !loading && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
                <ShieldOff className="h-4 w-4 text-zinc-500" /> Raw Metrics
              </h3>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metrics).map(([key, val]) => (
                <div key={key}>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{key.replace(/_/g, " ")}</p>
                  <p className="text-lg font-bold tabular-nums text-zinc-100">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
