"use client";

import { useState, useEffect, useCallback } from "react";
import { useConsoleAuth } from "@/lib/console-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bot,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  DatabaseZap,
  Download,
  FileCheck2,
  LayoutDashboard,
  Lock,
  Minus,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Screen = "command" | "agents" | "threats" | "data-protection" | "compliance";

type LiveData = {
  metrics: Record<string, number>;
  alerts: Array<{ title: string; severity: string; stage?: string; created_at?: string; tenant_id?: string }>;
  readiness: { status: string };
  patternStats: { promoted: number; candidate: number; retired: number; shadow_rejected: number };
  auditVerify?: { is_valid: boolean; first_broken_sequence: number | null; message: string; record_count: number };
  auditStatus?: { record_count: number; tail: Record<string, unknown> | null };
  metricsDetails?: { gateway_action?: Record<string, number>; [key: string]: unknown };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
  return n > 0 ? n.toLocaleString() : "—";
}

// ---------------------------------------------------------------------------
// Micro-components
// ---------------------------------------------------------------------------
function Badge({ label, variant = "default" }: { label: string; variant?: "blocked" | "allowed" | "sanitized" | "default" }) {
  const styles = {
    blocked:   "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    allowed:   "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    sanitized: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    default:   "bg-zinc-800 text-zinc-400 border border-zinc-700",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${styles[variant]}`}>
      {label}
    </span>
  );
}

function StatCard({
  label, value, sub, accent = "default",
}: {
  label: string; value: string | number; sub?: string;
  accent?: "teal" | "rose" | "amber" | "emerald" | "default";
}) {
  const colors = {
    teal:    "text-teal-400",
    rose:    "text-rose-400",
    amber:   "text-amber-400",
    emerald: "text-emerald-400",
    default: "text-zinc-50",
  };
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-3">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${colors[accent]}`}>{value}</p>
      {sub && <p className="mt-1.5 text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400 mb-1">{eyebrow}</p>
      <h2 className="text-xl font-semibold text-zinc-50 tracking-tight">{title}</h2>
    </div>
  );
}

function BarRow({ label, value, max, color = "teal" }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const barColors: Record<string, string> = {
    teal: "bg-teal-500", rose: "bg-rose-500", amber: "bg-amber-500", emerald: "bg-emerald-500", blue: "bg-blue-500",
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="text-xs tabular-nums text-zinc-300 font-medium">{value.toLocaleString()} <span className="text-zinc-600">({pct}%)</span></span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-800">
        <div className={`h-1.5 rounded-full ${barColors[color] ?? "bg-teal-500"} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const screenFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
};

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
const NAV_ITEMS: { id: Screen; label: string; icon: React.ElementType; dot: string }[] = [
  { id: "command",          label: "Command Center",      icon: LayoutDashboard, dot: "bg-teal-500" },
  { id: "agents",           label: "Agent Intelligence",  icon: Bot,             dot: "bg-blue-500" },
  { id: "threats",          label: "Threat Intelligence", icon: ShieldAlert,     dot: "bg-amber-500" },
  { id: "data-protection",  label: "Data Protection",     icon: Lock,            dot: "bg-violet-500" },
  { id: "compliance",       label: "Compliance Record",   icon: ClipboardCheck,  dot: "bg-emerald-500" },
];

function Sidebar({ active, onNavigate }: { active: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <aside className="w-56 shrink-0 flex flex-col bg-zinc-900 border-r border-zinc-800 h-screen sticky top-0">
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/25 shrink-0">
          <Shield className="h-4 w-4 text-teal-400" />
        </div>
        <div className="leading-none">
          <div className="text-sm font-bold text-zinc-50 tracking-tight">Agenvia</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Security Control Plane</div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        <p className="px-3 mb-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Dashboard</p>
        {NAV_ITEMS.map(({ id, label, icon: Icon, dot }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left ${
                isActive
                  ? "bg-zinc-800/80 text-zinc-50 font-medium border-l-2 border-teal-500 pl-[10px]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <div className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-zinc-700" : "bg-zinc-800"}`}>
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-teal-400" : "text-zinc-500"}`} />
                {isActive && <span className={`absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ${dot}`} />}
              </div>
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-zinc-500">All systems operational</span>
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Top header
// ---------------------------------------------------------------------------
function TopHeader({ onRefresh, loading, tenantId }: { onRefresh: () => void; loading: boolean; tenantId: string | null }) {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-900/70 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-200">
          {tenantId ?? "—"}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-400">Live</span>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Screen 1 — Command Center
// ---------------------------------------------------------------------------
// Parses actor id embedded in alert title e.g. "Blocked: user 'load-test' role denied..."
function extractActor(title: string, tenantId: string): string {
  const m = title.match(/user\s+'?([^'\s]+)'?/i) ?? title.match(/actor[:\s]+'?([^'\s]+)'?/i);
  return m ? m[1] : tenantId;
}

function alertToFeedEntry(a: { title: string; severity: string; stage?: string; created_at?: string; tenant_id?: string }, tenantId: string | null) {
  const action = a.severity === "High" ? "block" : a.severity === "Medium" ? "sanitize" : "allowed";
  const agent  = extractActor(a.title, a.tenant_id ?? tenantId ?? "gateway");
  const category = a.stage ?? a.title;
  const time = a.created_at ? new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(a.created_at)) : "—";
  return { action, agent, category, time };
}

function CommandCenterScreen({ data, tenantId }: { data: LiveData | null; tenantId: string | null }) {
  const m = data?.metrics ?? {};
  const total    = Object.values(m).reduce((s, v) => s + v, 0);
  const blocked  = m["block"]    ?? 0;
  const alerts   = data?.alerts ?? [];
  const highAlerts = alerts.filter((a) => a.severity === "High").length;
  const liveFeed = alerts.length > 0
    ? alerts.slice(0, 6).map(a => alertToFeedEntry(a, tenantId))
    : [];

  return (
    <motion.div {...screenFade} className="space-y-6">
      <SectionTitle eyebrow="Command Center" title="Protection status at a glance." />

      {/* Status banner */}
      <div className={`rounded-xl border px-5 py-4 flex items-center gap-3 ${highAlerts > 0 ? "border-rose-500/20 bg-rose-500/5" : "border-teal-500/20 bg-teal-500/5"}`}>
        <ShieldCheck className={`h-5 w-5 shrink-0 ${highAlerts > 0 ? "text-rose-400" : "text-teal-400"}`} />
        <div>
          <p className={`text-sm font-semibold ${highAlerts > 0 ? "text-rose-300" : "text-teal-300"}`}>
            {highAlerts > 0 ? `${highAlerts} high-severity alert${highAlerts > 1 ? "s" : ""} require attention` : "All agents operating within policy"}
          </p>
          <p className={`text-xs mt-0.5 ${highAlerts > 0 ? "text-rose-500/70" : "text-teal-500/70"}`}>
            {total > 0 ? `${total.toLocaleString()} total requests processed` : "No requests recorded yet"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Protected Requests" value={total > 0 ? fmt(total) : "—"} sub="All time" accent="teal" />
        <StatCard label="Threats Blocked"    value={blocked > 0 ? fmt(blocked) : "—"} sub="All time" accent="rose" />
        <StatCard label="Flagged Actors"     value={highAlerts > 0 ? highAlerts : "—"} sub="Needs attention" accent="amber" />
      </div>

      {/* Alert breakdown + live feed */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-4">Alert Severity Breakdown</p>
          {alerts.length === 0 ? (
            <div className="flex items-center justify-center h-28">
              <p className="text-xs text-zinc-600">No alerts recorded yet.</p>
            </div>
          ) : (() => {
            const high   = alerts.filter(a => a.severity === "High").length;
            const medium = alerts.filter(a => a.severity === "Medium").length;
            const low    = alerts.filter(a => a.severity === "Low").length;
            const maxVal = Math.max(high, medium, low, 1);
            return (
              <div className="space-y-3">
                {[
                  { label: "High",   value: high,   color: "bg-rose-500",    text: "text-rose-400" },
                  { label: "Medium", value: medium, color: "bg-amber-400",   text: "text-amber-400" },
                  { label: "Low",    value: low,    color: "bg-teal-500",    text: "text-teal-400" },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-zinc-500 w-14">{row.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-800">
                      <div className={`h-full rounded-full ${row.color} transition-all duration-700`} style={{ width: `${Math.round((row.value / maxVal) * 100)}%` }} />
                    </div>
                    <span className={`text-xs tabular-nums font-semibold w-6 text-right ${row.text}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-4">Live Activity Feed</p>
          <div className="space-y-2">
            {liveFeed.length === 0 ? (
              <p className="text-xs text-zinc-600 py-4 text-center">No activity recorded yet.</p>
            ) : liveFeed.map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-zinc-800/60 last:border-0">
                <Badge label={e.action === "allowed" ? "Allowed" : e.action === "block" ? "Blocked" : "Cleaned"}
                       variant={e.action === "allowed" ? "allowed" : e.action === "block" ? "blocked" : "sanitized"} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-zinc-300 font-mono">{e.agent}</span>
                  <span className="text-xs text-zinc-500 ml-2">{e.category}</span>
                </div>
                <span className="text-[10px] tabular-nums text-zinc-600 shrink-0">{e.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Screen 2 — Agent Intelligence
// ---------------------------------------------------------------------------

function RiskBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-rose-500" : score >= 40 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-zinc-800">
        <div className={`h-1.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs tabular-nums font-semibold ${score >= 70 ? "text-rose-400" : score >= 40 ? "text-amber-400" : "text-emerald-400"}`}>{score}</span>
    </div>
  );
}

function AgentIntelligenceScreen({ data }: { data: LiveData | null }) {
  const alerts = data?.alerts ?? [];
  const m = data?.metrics ?? {};

  // Derive actors from real alerts
  const actorMap = alerts.reduce((acc, a) => {
    const actor = extractActor(a.title, a.tenant_id ?? "gateway");
    if (!acc[actor]) acc[actor] = { id: actor, high: 0, medium: 0, low: 0, total: 0 };
    acc[actor].total++;
    if (a.severity === "High")   acc[actor].high++;
    if (a.severity === "Medium") acc[actor].medium++;
    if (a.severity === "Low")    acc[actor].low++;
    return acc;
  }, {} as Record<string, { id: string; high: number; medium: number; low: number; total: number }>);

  const actors = Object.values(actorMap).sort((a, b) => b.high - a.high);

  const allowed   = m["allow"]    ?? 0;
  const blocked   = m["block"]    ?? 0;
  const sanitized = m["sanitize"] ?? 0;
  const total     = allowed + blocked + sanitized;
  const max       = Math.max(allowed, blocked, sanitized, 1);

  return (
    <motion.div {...screenFade} className="space-y-6">
      <SectionTitle eyebrow="Agent Intelligence" title="Every actor's behavior, continuously scored." />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-100">Actor Roster</span>
          <span className="text-xs text-zinc-500">{actors.length} actors recorded</span>
        </div>
        {actors.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-zinc-600">No actor data yet.</p>
            <p className="text-xs text-zinc-700 mt-1">Actors appear here once they generate alerts through the gateway.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Actor ID", "High Alerts", "Medium", "Total", "Status"].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {actors.map((a) => {
                const status = a.high > 0 ? "Flagged" : a.medium > 0 ? "Warning" : "Clean";
                return (
                  <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-mono text-zinc-200">{a.id}</td>
                    <td className="px-5 py-3 text-sm font-semibold tabular-nums text-rose-400">{a.high || "—"}</td>
                    <td className="px-5 py-3 text-sm tabular-nums text-amber-400">{a.medium || "—"}</td>
                    <td className="px-5 py-3 text-sm tabular-nums text-zinc-400">{a.total}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        status === "Flagged" ? "border-rose-500/25 bg-rose-500/10 text-rose-400"
                        : status === "Warning" ? "border-amber-500/25 bg-amber-500/10 text-amber-400"
                        : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                      }`}>{status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {total > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-4">Request Breakdown</p>
          <div className="space-y-3">
            <BarRow label="Allowed"   value={allowed}   max={max} color="emerald" />
            <BarRow label="Blocked"   value={blocked}   max={max} color="rose" />
            <BarRow label="Sanitized" value={sanitized} max={max} color="amber" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Screen 3 — Threat Intelligence
// ---------------------------------------------------------------------------

function ThreatIntelligenceScreen({ data }: { data: LiveData | null }) {
  const alerts = data?.alerts ?? [];
  const high   = alerts.filter(a => a.severity === "High").length;
  const medium = alerts.filter(a => a.severity === "Medium").length;
  const low    = alerts.filter(a => a.severity === "Low").length;

  const threatRows = alerts.slice(0, 8).map((a) => ({
    time:     a.created_at ? new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(a.created_at)) : "—",
    agent:    extractActor(a.title, a.tenant_id ?? "gateway"),
    decision: (a.severity === "High" ? "block" : a.severity === "Medium" ? "sanitize" : "allowed") as "block" | "sanitize" | "allowed",
    category: a.stage ?? a.title,
  }));

  return (
    <motion.div {...screenFade} className="space-y-6">
      <SectionTitle eyebrow="Threat Intelligence" title="What's being attempted against your agents." />

      <div className="grid grid-cols-3 gap-4">
        {[
          { name: "High Severity",   count: high,   icon: Zap,         color: "rose" },
          { name: "Medium Severity", count: medium, icon: DatabaseZap, color: "amber" },
          { name: "Low / Allowed",   count: low,    icon: Users,       color: "teal" },
        ].map(({ name, count, icon: Icon, color }) => (
          <div key={name} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center mb-4">
              <Icon className="h-4 w-4 text-zinc-400" />
            </div>
            <p className={`text-3xl font-bold tabular-nums ${color === "rose" ? "text-rose-400" : color === "amber" ? "text-amber-400" : "text-teal-400"}`}>{count}</p>
            <p className="mt-1.5 text-xs text-zinc-500">{name}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-zinc-500" /> Threat Log
          </span>
          <span className="text-xs text-zinc-600">{threatRows.length} recent events</span>
        </div>
        {threatRows.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-zinc-600">No threats recorded yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Time", "Actor", "Decision", "Category"].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {threatRows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-xs tabular-nums text-zinc-500">{row.time}</td>
                  <td className="px-5 py-3 text-sm font-mono text-zinc-300">{row.agent}</td>
                  <td className="px-5 py-3">
                    <Badge
                      label={row.decision === "allowed" ? "Allowed" : row.decision === "block" ? "Blocked" : "Cleaned"}
                      variant={row.decision === "allowed" ? "allowed" : row.decision === "block" ? "blocked" : "sanitized"}
                    />
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-400">{row.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Screen 4 — Data Protection
// ---------------------------------------------------------------------------
function DataProtectionScreen({ data }: { data: LiveData | null }) {
  const m = data?.metrics ?? {};
  const sanitized = m["sanitize"] ?? 0;
  const blocked   = m["block"]    ?? 0;
  const allowed   = m["allow"]    ?? 0;
  const total     = sanitized + blocked + allowed;
  const hasData   = total > 0;

  return (
    <motion.div {...screenFade} className="space-y-6">
      <SectionTitle eyebrow="Data Protection" title="Sensitive data handled, abstracted, and contained." />

      <div className={`rounded-xl border px-5 py-4 flex items-center justify-between ${hasData ? "border-emerald-500/20 bg-emerald-500/5" : "border-zinc-800 bg-zinc-900"}`}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className={`h-5 w-5 shrink-0 ${hasData ? "text-emerald-400" : "text-zinc-600"}`} />
          <div>
            <p className={`text-sm font-semibold ${hasData ? "text-emerald-300" : "text-zinc-400"}`}>
              {hasData ? `${total.toLocaleString()} total requests processed through gateway` : "No requests recorded yet"}
            </p>
            <p className={`text-xs mt-0.5 ${hasData ? "text-emerald-500/70" : "text-zinc-600"}`}>
              {hasData ? `${sanitized.toLocaleString()} sanitized · ${blocked.toLocaleString()} blocked · ${allowed.toLocaleString()} allowed` : "Send prompts through the gateway to see data here"}
            </p>
          </div>
        </div>
        {hasData && (
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold tabular-nums text-emerald-400">{blocked}</p>
            <p className="text-xs text-emerald-500/70">Blocked</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Sanitized"  value={sanitized > 0 ? fmt(sanitized) : "—"} sub="PII abstracted before AI" accent="teal" />
        <StatCard label="Blocked"    value={blocked > 0   ? fmt(blocked)   : "—"} sub="Requests terminated"      accent="rose" />
        <StatCard label="Allowed"    value={allowed > 0   ? fmt(allowed)   : "—"} sub="Passed policy check"      accent="emerald" />
      </div>

      {!hasData && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-sm text-zinc-600">No data protection events recorded yet.</p>
          <p className="text-xs text-zinc-700 mt-1">Breakdown appears here once prompts flow through the gateway.</p>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Screen 5 — Compliance Record
// ---------------------------------------------------------------------------

const FRAMEWORKS = [
  { name: "GDPR",  body: "Article 22 automated decision logging with full reasoning trace per request" },
  { name: "HIPAA", body: "Complete access log for all health data interactions, no gaps" },
  { name: "SOX",   body: "Audit trail for all financial data agent decisions, exportable" },
];

function ComplianceRecordScreen({ data }: { data: LiveData | null }) {
  const isBroken = data?.auditVerify?.is_valid === false;
  const recordCount = data?.auditStatus?.record_count ?? data?.auditVerify?.record_count ?? 0;
  const recordCountStr = recordCount > 0 ? recordCount.toLocaleString() : "—";
  const bannerBorder = isBroken ? "border-rose-500/20 bg-rose-500/5" : "border-emerald-500/20 bg-emerald-500/5";
  const bannerIcon  = isBroken ? "text-rose-400" : "text-emerald-400";
  const bannerTitle = isBroken ? "Audit chain integrity broken" : "Record integrity verified";
  const bannerSub   = isBroken
    ? (data?.auditVerify?.message ?? "Chain broken")
    : "Every decision is permanently recorded and tamper-evident. No gaps in coverage.";
  const statColor   = isBroken ? "text-rose-300" : "text-emerald-300";
  const statSubColor = isBroken ? "text-rose-500/60" : "text-emerald-500/60";

  return (
    <motion.div {...screenFade} className="space-y-6">
      <SectionTitle eyebrow="Compliance Record" title="Every decision recorded and tamper-evident." />

      {/* Audit integrity */}
      <div className={`rounded-xl border ${bannerBorder} px-5 py-4`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileCheck2 className={`h-5 w-5 ${bannerIcon} shrink-0 mt-0.5`} />
            <div>
              <p className={`text-sm font-semibold ${statColor}`}>{bannerTitle}</p>
              <p className={`text-xs ${statSubColor} mt-0.5`}>{bannerSub}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0 text-center">
            {[
              { label: "Decisions on record", value: recordCountStr },
              { label: "Last verified",       value: "Live" },
              { label: "Coverage",            value: isBroken ? "BROKEN" : "100%" },
            ].map((s) => (
              <div key={s.label}>
                <p className={`text-lg font-bold tabular-nums ${statColor}`}>{s.value}</p>
                <p className={`text-[10px] ${statSubColor} mt-0.5`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frameworks */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-3">Compliance Frameworks</p>
        <div className="grid grid-cols-3 gap-4">
          {FRAMEWORKS.map((f) => {
            const chainValid = data?.auditVerify?.is_valid !== false;
            const hasRecords = (data?.auditVerify?.record_count ?? data?.auditStatus?.record_count ?? 0) > 0;
            const covered = chainValid && hasRecords;
            return (
            <div key={f.name} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-zinc-50">{f.name}</span>
                {covered ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Covered
                  </span>
                ) : hasRecords ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                    Partial
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-xs leading-5 text-zinc-500">{f.body}</p>
            </div>
            );
          })}
        </div>
      </div>

      {/* Decision log */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-100">Decision Log</span>
          <button className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors">
            <Download className="h-3 w-3" /> Export PDF / CSV
          </button>
        </div>
        {(() => {
          const rows = (data?.alerts ?? []).slice(0, 8).map((a) => ({
            time:     a.created_at ? new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(a.created_at)) : "—",
            agent:    extractActor(a.title, a.tenant_id ?? "gateway"),
            decision: (a.severity === "High" ? "block" : a.severity === "Medium" ? "sanitize" : "allowed") as "block" | "sanitize" | "allowed",
            category: a.stage ?? a.title,
          }));
          return rows.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-zinc-600">No decisions recorded yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Time", "Actor", "Decision", "Category"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-xs tabular-nums text-zinc-500">{r.time}</td>
                    <td className="px-5 py-3 text-sm font-mono text-zinc-300">{r.agent}</td>
                    <td className="px-5 py-3">
                      <Badge
                        label={r.decision === "allowed" ? "Allowed" : r.decision === "block" ? "Blocked" : "Cleaned"}
                        variant={r.decision === "allowed" ? "allowed" : r.decision === "block" ? "blocked" : "sanitized"}
                      />
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{r.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
export default function ClientDashboard() {
  const [active, setActive] = useState<Screen>("command");
  const [data, setData]     = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(false);
  const { token, tenantId } = useConsoleAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/home-dashboard", { cache: "no-store" });
      const json = (await res.json()) as LiveData;
      setData(json);
      if (token) {
        const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const [auditVerifyRes, auditStatusRes, metricsDetailsRes] = await Promise.allSettled([
          fetch(`${API_BASE}/audit-chain/verify`, { headers }).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE}/audit-chain/status`,  { headers }).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE}/metrics/details`,     { headers }).then(r => r.ok ? r.json() : null),
        ]);
        setData(prev => prev ? {
          ...prev,
          auditVerify:    auditVerifyRes.status === "fulfilled"    ? auditVerifyRes.value    : undefined,
          auditStatus:    auditStatusRes.status === "fulfilled"    ? auditStatusRes.value    : undefined,
          metricsDetails: metricsDetailsRes.status === "fulfilled" ? metricsDetailsRes.value : undefined,
        } : prev);
      }
    } catch {
      setData({ metrics: {}, alerts: [], readiness: { status: "unknown" }, patternStats: { promoted: 0, candidate: 0, retired: 0, shadow_rejected: 0 } });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchData();
    const t = window.setInterval(fetchData, 5_000);
    return () => window.clearInterval(t);
  }, [fetchData]);

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar active={active} onNavigate={setActive} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopHeader onRefresh={fetchData} loading={loading} tenantId={tenantId} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <AnimatePresence mode="wait">
              {active === "command"         && <CommandCenterScreen    key="command"    data={data} tenantId={tenantId} />}
              {active === "agents"          && <AgentIntelligenceScreen key="agents" data={data} />}
              {active === "threats"         && <ThreatIntelligenceScreen key="threats"  data={data} />}
              {active === "data-protection" && <DataProtectionScreen    key="dp"        data={data} />}
              {active === "compliance"      && <ComplianceRecordScreen  key="compliance" data={data} />}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
