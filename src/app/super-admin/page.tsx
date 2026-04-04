"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ShieldAlert,
  Database,
  Cpu,
  Network,
  FlaskConical,
  FileText,
  Users,
  LogOut,
  CircleAlert,
  BadgeCheck,
  Wrench,
  Eye,
} from "lucide-react";
import { useConsoleAuth } from "@/lib/console-auth";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Screen = "incidents" | "system" | "tenants" | "patterns" | "audit";

interface LiveAlert {
  alert_id: string;
  tenant_id: string;
  severity: "High" | "Medium" | "Low";
  title: string;
  stage?: string;
  created_at: string;
  detail?: string;
}

interface Readiness {
  status: string;
  gemini: string;
  intent_model?: string;
  router_model?: string;
}

interface FLPattern {
  pattern_id: string;
  pattern: string;
  label: string;
  confidence: number;
  votes: number;
  tenant_count: number;
  status: string;
  promoted_at: string | null;
  created_at: string;
}

interface Metrics { [key: string]: number; }

interface AuditChainVerify {
  is_valid: boolean;
  first_broken_sequence: number | null;
  message: string;
  record_count: number;
}
interface AuditChainStatus {
  record_count: number;
  tail: Record<string, unknown> | null;
}
interface ToolEvent {
  event_id?: string;
  tool_name: string;
  tenant_id: string;
  actor_id?: string;
  decision: string;
  created_at: string;
  reason?: string;
}
interface FlLifecycle {
  promoted: number;
  candidate: number;
  retired: number;
  shadow_rejected: number;
  recently_promoted?: unknown[];
  stale_candidates?: unknown[];
}
interface MetricsDetails {
  gateway_action?: Record<string, number>;
  [key: string]: unknown;
}

interface LiveData {
  alerts: LiveAlert[];
  readiness: Readiness;
  metrics: Metrics;
  patterns: FLPattern[];
  patternStats: { promoted: number; candidate: number; retired: number; shadow_rejected: number };
  auditVerify?: AuditChainVerify;
  auditStatus?: AuditChainStatus;
  toolEvents?: ToolEvent[];
  flLifecycle?: FlLifecycle;
  metricsDetails?: MetricsDetails;
}

// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
const screenFade = {
  initial:  { opacity: 0, y: 8 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -6 },
  transition: { duration: 0.18 },
};

function fmtTime(iso: string) {
  try { return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(iso)); }
  catch { return iso; }
}

function SevBadge({ sev }: { sev: "High" | "Medium" | "Low" }) {
  const cls = sev === "High" ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
            : sev === "Medium" ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
            : "bg-zinc-700/50 text-zinc-400 border-zinc-600/40";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>{sev}</span>;
}

function StatusDot({ ok }: { ok: boolean }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-rose-500"}`} />;
}

function StatCard({ label, value, sub, color = "default" }: { label: string; value: string | number; sub?: string; color?: "teal"|"rose"|"amber"|"emerald"|"default" }) {
  const v = { teal: "text-teal-400", rose: "text-rose-400", amber: "text-amber-400", emerald: "text-emerald-400", default: "text-zinc-100" }[color];
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${v}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
const NAV: { id: Screen; label: string; icon: React.ElementType; dot?: string }[] = [
  { id: "incidents", label: "Incident Queue",   icon: ShieldAlert,   dot: "bg-rose-500" },
  { id: "system",    label: "System Ops",        icon: Activity,      dot: "bg-teal-500" },
  { id: "tenants",   label: "Tenant Overview",   icon: Users,         dot: "bg-amber-500" },
  { id: "patterns",  label: "Pattern Lab",       icon: FlaskConical,  dot: "bg-teal-400" },
  { id: "audit",     label: "Audit Integrity",   icon: FileText,      dot: "bg-emerald-500" },
];

function Sidebar({ active, setActive, logout }: { active: Screen; setActive: (s: Screen) => void; logout: () => void }) {
  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950 h-screen sticky top-0">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Agenvia" className="h-7 w-7 rounded-md shrink-0" />
        <div>
          <p className="text-sm font-bold text-teal-400 tracking-tight uppercase leading-none">AGENVIA</p>
          <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Super Admin</p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <p className="px-2 pt-1 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Operations</p>
        {NAV.map(({ id, label, icon: Icon, dot }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-all ${
                isActive ? "bg-zinc-800/80 text-zinc-100 border-l-2 border-teal-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border-l-2 border-transparent"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="mx-2 mb-3 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-300 transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Top Header
// ---------------------------------------------------------------------------
function TopHeader({ onRefresh, loading }: { onRefresh: () => void; loading: boolean }) {
  return (
    <div className="border-b border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-teal-950/30 px-6 py-4 sticky top-0 z-40 flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-400">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            Live
          </span>
          <span className="text-xs text-zinc-500 font-mono">Platform Admin · All Tenants</span>
        </div>
        <h2 className="text-2xl font-bold text-zinc-50 tracking-tight">Platform Overview</h2>
        <p className="mt-0.5 text-sm text-zinc-400 max-w-lg">Cross-tenant visibility across all Agenvia client organizations.</p>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 transition-colors shrink-0"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen: Incident Queue (real alerts + derived incidents)
// ---------------------------------------------------------------------------
function IncidentQueueScreen({ data }: { data: LiveData | null }) {
  const alerts = data?.alerts ?? [];
  const highCount = alerts.filter(a => a.severity === "High").length;
  const medCount  = alerts.filter(a => a.severity === "Medium").length;
  const auditBreak = data?.auditVerify && !data.auditVerify.is_valid ? data.auditVerify : null;
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const blockedToolEvents = (data?.toolEvents ?? []).filter(
    e => e.decision === "block" && new Date(e.created_at).getTime() >= oneHourAgo
  );

  // Synthesize platform-level incidents from real data only
  const platformIncidents = [
    ...(auditBreak ? [{
      id: "audit-break",
      severity: "Critical" as const,
      type: "Audit Chain",
      title: `Audit chain integrity broken — System`,
      detail: `First broken sequence: #${auditBreak.first_broken_sequence}. ${auditBreak.record_count.toLocaleString()} total records.`,
      action: "Verify & re-anchor chain",
      time: "Now",
    }] : []),
    ...(blockedToolEvents.length > 0 ? [{
      id: "blocked-tool-calls",
      severity: "High" as const,
      type: "Tool Audit",
      title: `Blocked tool calls detected — ${blockedToolEvents.length} in last hour`,
      detail: `${blockedToolEvents.length} tool call(s) blocked in the past hour. Review tool audit log for details.`,
      action: "Review tool audit",
      time: "Live",
    }] : []),
    ...(data?.readiness.status !== "ok" ? [{
      id: "backend-down",
      severity: "Critical" as const,
      type: "System",
      title: "Backend gateway not responding",
      detail: `Readiness status: ${data?.readiness.status ?? "unknown"}. All requests may be failing.`,
      action: "Check gateway process",
      time: "Now",
    }] : []),
    ...(data?.readiness.gemini !== "configured" ? [{
      id: "ai-connector",
      severity: "High" as const,
      type: "Connector",
      title: "AI Connector not configured",
      detail: "Gemini key missing or invalid. Proxy-mode LLM calls will fail with 502.",
      action: "Set GEMINI_API_KEY env var",
      time: "Ongoing",
    }] : []),
    ...alerts.filter(a => a.severity === "High").slice(0, 5).map(a => ({
      id: a.alert_id,
      severity: "High" as const,
      type: "Gateway",
      title: a.title,
      detail: a.detail ?? `Tenant: ${a.tenant_id}${a.stage ? ` · Stage: ${a.stage}` : ""}`,
      action: "Review policy trace",
      time: fmtTime(a.created_at),
    })),
  ];

  const sevColor = (s: string) =>
    s === "Critical" ? "border-l-rose-500 bg-rose-500/5"
    : s === "High"   ? "border-l-amber-500 bg-amber-500/5"
    : "border-l-zinc-700 bg-zinc-900/40";
  const sevText = (s: string) =>
    s === "Critical" ? "text-rose-400 bg-rose-500/15 border-rose-500/30"
    : s === "High"   ? "text-amber-400 bg-amber-500/15 border-amber-500/30"
    : "text-zinc-400 bg-zinc-700/30 border-zinc-600/30";

  return (
    <motion.div {...screenFade} className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-400 mb-1">Incident Queue</p>
        <h1 className="text-xl font-bold text-zinc-50">Open incidents requiring action.</h1>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Open Incidents"  value={platformIncidents.length} color="rose" />
        <StatCard label="Critical"        value={platformIncidents.filter(i => i.severity === "Critical").length} color="rose" sub="Needs immediate action" />
        <StatCard label="High Alerts"     value={highCount} color="amber" sub="From gateway" />
        <StatCard label="Medium Alerts"   value={medCount}  color="default" sub="Monitor" />
      </div>

      <div className="space-y-2">
        {platformIncidents.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">No open incidents</p>
              <p className="text-xs text-zinc-500 mt-0.5">All systems nominal. Platform operating within expected parameters.</p>
            </div>
          </div>
        ) : platformIncidents.map(inc => (
          <div key={inc.id} className={`rounded-xl border-l-4 border border-zinc-800 px-4 py-4 ${sevColor(inc.severity)}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sevText(inc.severity)}`}>
                    {inc.severity}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">{inc.type}</span>
                  <span className="text-[10px] text-zinc-700 ml-auto">{inc.time}</span>
                </div>
                <p className="text-sm font-semibold text-zinc-100">{inc.title}</p>
                <p className="mt-1 text-xs text-zinc-500 leading-5">{inc.detail}</p>
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[10px] font-semibold text-zinc-400 hover:border-teal-500/40 hover:text-teal-400 cursor-pointer transition-colors whitespace-nowrap">
                  <Wrench className="h-3 w-3" />
                  {inc.action}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.filter(a => a.severity === "Medium").length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400">Medium Severity Alerts</p>
          </div>
          <div className="divide-y divide-zinc-800">
            {alerts.filter(a => a.severity === "Medium").slice(0, 6).map(a => (
              <div key={a.alert_id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <SevBadge sev={a.severity} />
                  <span className="text-xs text-zinc-300">{a.title}</span>
                  <span className="text-[10px] text-zinc-600">{a.tenant_id}</span>
                </div>
                <span className="text-[10px] text-zinc-600">{fmtTime(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Screen: System Ops (real readiness + metrics)
// ---------------------------------------------------------------------------
function SystemOpsScreen({ data }: { data: LiveData | null }) {
  const r = data?.readiness;
  const m = data?.metrics ?? {};
  const total   = Object.values(m).reduce((s, v) => s + v, 0);
  const blocked = m["block"] ?? 0;
  const blockRate = total > 0 ? ((blocked / total) * 100).toFixed(1) : "0";

  const services = [
    { name: "Gateway API",       ok: r?.status === "ok",          note: r?.status ?? "unknown" },
    { name: "AI Connector",      ok: r?.gemini === "configured",  note: r?.gemini ?? "not set" },
    { name: "Intent Model",      ok: !!r?.intent_model,           note: r?.intent_model ?? "not loaded" },
    { name: "Router Model",      ok: !!r?.router_model,           note: r?.router_model ?? "not loaded" },
    { name: "Audit Chain DB",    ok: data?.auditVerify ? data.auditVerify.is_valid : true, note: data?.auditVerify ? (data.auditVerify.is_valid ? "valid" : "chain broken") : "unknown" },
    { name: "FL Federation",     ok: !!(data?.flLifecycle),       note: data?.flLifecycle ? "connected" : "no data" },
    { name: "Tool Events",       ok: data?.toolEvents !== undefined, note: data?.toolEvents !== undefined ? `${data.toolEvents.length} events` : "no data" },
  ];

  const allOk = services.every(s => s.ok);

  return (
    <motion.div {...screenFade} className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400 mb-1">System Ops</p>
        <h1 className="text-xl font-bold text-zinc-50">Platform health and runtime status.</h1>
      </div>

      <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${allOk ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
        {allOk
          ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          : <XCircle className="h-5 w-5 text-rose-400 shrink-0" />}
        <div>
          <p className={`text-sm font-semibold ${allOk ? "text-emerald-300" : "text-rose-300"}`}>
            {allOk ? "All systems operational" : `${services.filter(s => !s.ok).length} service(s) degraded`}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">Last checked: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {services.map(svc => (
          <div key={svc.name} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-zinc-300">{svc.name}</p>
              <StatusDot ok={svc.ok} />
            </div>
            <p className={`text-xs font-mono ${svc.ok ? "text-emerald-400" : "text-rose-400"}`}>{svc.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Requests" value={total.toLocaleString()} color="default" />
        <StatCard label="Block Rate"     value={`${blockRate}%`} color={parseFloat(blockRate) > 60 ? "rose" : "teal"} />
        <StatCard label="Allowed"        value={(m["allow"] ?? 0).toLocaleString()} color="emerald" />
        <StatCard label="Sanitized"      value={(m["sanitize"] ?? 0).toLocaleString()} color="amber" />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-zinc-500" />
          <p className="text-xs font-semibold text-zinc-400">Action Breakdown</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          {(["block","allow","sanitize","minimize","local-only"] as const).map(action => {
            const actionData = data?.metricsDetails?.gateway_action ?? m;
            const v = actionData[action] ?? 0;
            const actionTotal = Object.values(actionData).reduce((s: number, val) => s + (typeof val === "number" ? val : 0), 0);
            const pct = actionTotal > 0 ? Math.round((v / actionTotal) * 100) : 0;
            const bar = action === "block" ? "bg-rose-500" : action === "allow" ? "bg-emerald-500" : action === "sanitize" ? "bg-amber-500" : action === "minimize" ? "bg-blue-500" : "bg-zinc-600";
            return (
              <div key={action} className="flex items-center gap-3">
                <span className="w-20 text-xs font-mono text-zinc-400 capitalize">{action}</span>
                <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
                  <div className={`h-full rounded-full ${bar} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-16 text-right text-xs tabular-nums text-zinc-400">{v.toLocaleString()} <span className="text-zinc-600">({pct}%)</span></span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Screen: Tenant Overview
// ---------------------------------------------------------------------------
interface CreatedKeys { tenant_id: string; company_name: string; agent_key: string; admin_key: string; note: string }

function TenantOverviewScreen({ data }: { data: LiveData | null }) {
  const { authFetch } = useConsoleAuth();
  const alerts = data?.alerts ?? [];

  // Create tenant form state
  const [showForm, setShowForm]       = useState(false);
  const [tenantId, setTenantId]       = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail]             = useState("");
  const [creating, setCreating]       = useState(false);
  const [formError, setFormError]     = useState<string | null>(null);
  const [createdKeys, setCreatedKeys] = useState<CreatedKeys | null>(null);

  // DB tenants list
  const [dbTenants, setDbTenants] = useState<{tenant_id:string;company_name:string;status:string;created_at:string}[]>([]);

  useEffect(() => {
    authFetch<{tenants: typeof dbTenants}>("/admin/tenants")
      .then(d => setDbTenants(d.tenants ?? []))
      .catch(() => {});
  }, [createdKeys]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      const result = await authFetch<CreatedKeys>("/admin/tenants", {
        method: "POST",
        body: JSON.stringify({ tenant_id: tenantId, company_name: companyName, contact_email: email }),
      });
      setCreatedKeys(result);
      setShowForm(false);
      setTenantId(""); setCompanyName(""); setEmail("");
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  // Derive alert stats per tenant
  const tenantMap = alerts.reduce((acc, a) => {
    if (!acc[a.tenant_id]) acc[a.tenant_id] = { id: a.tenant_id, high: 0, medium: 0, low: 0, total: 0 };
    acc[a.tenant_id].total++;
    if (a.severity === "High")   acc[a.tenant_id].high++;
    if (a.severity === "Medium") acc[a.tenant_id].medium++;
    if (a.severity === "Low")    acc[a.tenant_id].low++;
    return acc;
  }, {} as Record<string, { id: string; high: number; medium: number; low: number; total: number }>);
  const alertTenants = Object.values(tenantMap).sort((a, b) => b.high - a.high);

  const statusOf = (t: typeof alertTenants[number]) =>
    t.high > 0 ? "critical" : t.medium > 0 ? "warning" : "healthy";
  const statusStyle = (s: string) =>
    s === "critical" ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
    : s === "warning" ? "text-amber-400 bg-amber-500/10 border-amber-500/25"
    : "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";

  const inputCls = "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors";

  return (
    <motion.div {...screenFade} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400 mb-1">Tenant Overview</p>
          <h1 className="text-xl font-bold text-zinc-50">All organizations on the platform.</h1>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setCreatedKeys(null); setFormError(null); }}
          className="flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 transition-colors"
        >
          + New Tenant
        </button>
      </div>

      {/* Created keys display — shown once after creation */}
      {createdKeys && (
        <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-semibold text-teal-400">Tenant created: {createdKeys.company_name}</span>
          </div>
          <p className="text-xs text-zinc-500">{createdKeys.note}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Agent Key <span className="text-zinc-600">(developer .env)</span></p>
              <code className="text-xs font-mono text-teal-300 break-all select-all">{createdKeys.agent_key}</code>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Admin Key <span className="text-zinc-600">(dashboard login)</span></p>
              <code className="text-xs font-mono text-amber-300 break-all select-all">{createdKeys.admin_key}</code>
            </div>
          </div>
          <button onClick={() => setCreatedKeys(null)} className="text-xs text-zinc-600 hover:text-zinc-400">Dismiss</button>
        </div>
      )}

      {/* Create tenant form */}
      {showForm && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4">Create New Tenant</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tenant ID <span className="text-zinc-600">(lowercase, no spaces)</span></label>
              <input className={inputCls} value={tenantId} onChange={e => setTenantId(e.target.value)}
                placeholder="city_general_hospital" pattern="^[a-z0-9_\-]{3,64}$" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Company Name</label>
              <input className={inputCls} value={companyName} onChange={e => setCompanyName(e.target.value)}
                placeholder="City General Hospital" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">IT Admin Email</label>
              <input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="it@hospital.org" required />
            </div>
            {formError && (
              <div className="md:col-span-3 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{formError}</div>
            )}
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" disabled={creating}
                className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-40 transition-colors">
                {creating ? "Creating…" : "Create Tenant & Generate Keys"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Tenants"  value={dbTenants.length || alertTenants.length || "—"} color="teal" />
        <StatCard label="Critical"       value={alertTenants.filter(t => statusOf(t) === "critical").length || "—"} color="rose" />
        <StatCard label="Warning"        value={alertTenants.filter(t => statusOf(t) === "warning").length || "—"} color="amber" />
        <StatCard label="Healthy"        value={alertTenants.filter(t => statusOf(t) === "healthy").length || "—"} color="emerald" />
      </div>

      {/* Registered tenants from DB */}
      {dbTenants.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Registered Tenants</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {dbTenants.map(t => {
              const alertStats = tenantMap[t.tenant_id];
              const status = alertStats ? statusOf(alertStats) : "healthy";
              return (
                <div key={t.tenant_id} className="px-5 py-3.5 grid grid-cols-[1.5fr_1fr_1fr_100px] items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-300">
                      {t.tenant_id.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-100">{t.company_name}</div>
                      <div className="text-[11px] font-mono text-zinc-500">{t.tenant_id}</div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">{alertStats?.total ?? 0} alerts</span>
                  <span className="text-xs text-zinc-600">{new Date(t.created_at).toLocaleDateString()}</span>
                  <div className="flex justify-end">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusStyle(status)}`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {alertTenants.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs font-semibold text-zinc-400 mb-4">Alert volume by tenant</p>
          <div className="space-y-3">
            {alertTenants.map(t => {
              const max = Math.max(...alertTenants.map(x => x.total), 1);
              const pct = Math.round((t.total / max) * 100);
              const status = statusOf(t);
              return (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="w-32 text-xs font-mono text-zinc-400 truncate">{t.id}</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-800">
                    <div className={`h-full rounded-full transition-all ${status === "critical" ? "bg-rose-500" : status === "warning" ? "bg-amber-400" : "bg-emerald-500"}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs tabular-nums text-zinc-400">{t.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {dbTenants.length === 0 && alertTenants.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-sm text-zinc-600">No tenants yet.</p>
          <p className="mt-1 text-xs text-zinc-700">Click &quot;New Tenant&quot; to onboard your first client.</p>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Screen: Pattern Lab (real FL patterns)
// ---------------------------------------------------------------------------
function PatternLabScreen({ data }: { data: LiveData | null }) {
  const patterns = data?.patterns ?? [];
  const fl = data?.flLifecycle;
  const stats = fl ?? data?.patternStats ?? { promoted: 0, candidate: 0, retired: 0, shadow_rejected: 0 };
  const staleCandidatesCount = fl?.stale_candidates?.length ?? 0;
  const candidates = patterns.filter(p => p.status === "candidate");
  const promoted   = patterns.filter(p => p.status === "promoted");

  return (
    <motion.div {...screenFade} className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400 mb-1">Pattern Lab</p>
        <h1 className="text-xl font-bold text-zinc-50">FL patterns and intent model status.</h1>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <StatCard label="Promoted"         value={stats.promoted}         color="emerald" sub="Active in production" />
        <StatCard label="Candidates"       value={stats.candidate}        color="amber"   sub="Awaiting promotion" />
        <StatCard label="Retired"          value={stats.retired}          color="default" sub="Superseded" />
        <StatCard label="Shadow Rejected"  value={stats.shadow_rejected}  color="rose"    sub="Below threshold" />
        <StatCard label="Stale Candidates" value={staleCandidatesCount}   color={staleCandidatesCount > 0 ? "amber" : "default"} sub="No recent votes" />
      </div>

      {/* SetFit Status — model info from readiness endpoint */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-3 mb-3">
          <FlaskConical className="h-5 w-5 text-teal-400" />
          <p className="text-sm font-semibold text-zinc-100">Intent Classifier</p>
          <span className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${data?.readiness?.intent_model ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" : "text-zinc-500 bg-zinc-800 border-zinc-700"}`}>
            {data?.readiness?.intent_model ?? "Unknown"}
          </span>
        </div>
        <p className="text-xs text-zinc-600">Model status reported by <span className="font-mono text-zinc-500">/ready</span>. To track training misses, add <span className="font-mono text-zinc-500">GET /intent-model/misses</span> to the backend.</p>
      </div>

      {/* Candidate patterns */}
      {candidates.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <p className="text-xs font-semibold text-zinc-300">Awaiting Promotion ({candidates.length})</p>
            </div>
            <p className="text-[10px] text-zinc-600">Requires ≥ 3 tenant votes to promote</p>
          </div>
          <div className="divide-y divide-zinc-800">
            {candidates.slice(0, 8).map(p => (
              <div key={p.pattern_id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-zinc-300 truncate">{p.pattern}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-600">{p.label}</span>
                    <span className="text-[10px] text-zinc-700">·</span>
                    <span className="text-[10px] text-zinc-600">{p.tenant_count} tenant{p.tenant_count !== 1 ? "s" : ""}</span>
                    <span className="text-[10px] text-zinc-700">·</span>
                    <span className="text-[10px] text-zinc-600">{p.votes} vote{p.votes !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-1.5 w-16 rounded-full bg-zinc-800">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.round(p.confidence * 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-500 w-8 text-right">{Math.round(p.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent promoted */}
      {promoted.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
            <p className="text-xs font-semibold text-zinc-300">Recently Promoted ({promoted.length})</p>
          </div>
          <div className="divide-y divide-zinc-800">
            {promoted.slice(0, 5).map(p => (
              <div key={p.pattern_id} className="px-5 py-3 flex items-center justify-between gap-4">
                <p className="text-xs font-mono text-zinc-400 truncate flex-1">{p.pattern}</p>
                <span className="text-[10px] text-zinc-600 shrink-0">{p.promoted_at ? new Date(p.promoted_at).toLocaleDateString() : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Screen: Audit Integrity
// ---------------------------------------------------------------------------
function AuditIntegrityScreen({ data }: { data: LiveData | null }) {
  const av = data?.auditVerify;
  const isValid = av ? av.is_valid : true;
  const recordCount = av?.record_count ?? data?.auditStatus?.record_count ?? 0;

  return (
    <motion.div {...screenFade} className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-1">Audit Integrity</p>
        <h1 className="text-xl font-bold text-zinc-50">Hash-chain verification across all tenants.</h1>
      </div>

      <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${isValid ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
        {isValid
          ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          : <AlertTriangle className="h-5 w-5 text-rose-400" />}
        <div>
          <p className={`text-sm font-semibold ${isValid ? "text-emerald-300" : "text-rose-300"}`}>
            {isValid ? "All audit chains valid" : "Audit chain broken — immediate action required"}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {recordCount > 0 ? `${recordCount.toLocaleString()} total records` : "No data yet"}
            {av?.message ? ` · ${av.message}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Chain Status"  value={isValid ? "Valid" : "Broken"}                         color={isValid ? "emerald" : "rose"} />
        <StatCard label="Total Records" value={recordCount > 0 ? recordCount.toLocaleString() : "—"} color="teal" />
        <StatCard label="Broken At Seq" value={av?.first_broken_sequence != null ? `#${av.first_broken_sequence}` : "—"} color={av?.first_broken_sequence != null ? "rose" : "default"} />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 grid grid-cols-[1fr_120px_120px_1fr] text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
          <span>Source</span>
          <span className="text-center">Records</span>
          <span className="text-center">Status</span>
          <span className="text-center">Detail</span>
        </div>
        <div className="divide-y divide-zinc-800">
          <div className={`px-5 py-4 grid grid-cols-[1fr_120px_120px_1fr] items-center ${!isValid ? "bg-rose-500/5" : ""}`}>
            <div className="flex items-center gap-2">
              <StatusDot ok={isValid} />
              <span className="text-sm font-mono text-zinc-300">System</span>
            </div>
            <span className="text-center text-xs tabular-nums text-zinc-400">{recordCount > 0 ? recordCount.toLocaleString() : "—"}</span>
            <div className="flex justify-center">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${isValid ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"}`}>
                {isValid ? "Valid" : "Broken"}
              </span>
            </div>
            <span className={`text-center text-xs ${!isValid ? "text-rose-400 font-semibold" : "text-zinc-500"}`}>
              {av?.first_broken_sequence != null ? `Broken at #${av.first_broken_sequence}` : av?.message ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {!isValid && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
          <div className="flex items-start gap-3">
            <CircleAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-300 mb-2">Remediation steps</p>
              <ol className="space-y-2 text-xs text-zinc-400 list-decimal list-inside">
                <li>Run <span className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded">audit_chain.verify()</span> to identify the first broken sequence</li>
                <li>Inspect DB records near sequence #{av?.first_broken_sequence} for tampered hashes</li>
                <li>If accidental: re-compute chain hash from last valid record forward</li>
                <li>If intentional: escalate to security team — possible data tampering</li>
                <li>After repair: run <span className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded">verify()</span> again to confirm <span className="font-mono">is_valid=True</span></li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function SuperAdminDashboard() {
  const { role, token, logout } = useConsoleAuth();
  const router = useRouter();
  const [active, setActive] = useState<Screen>("incidents");
  const [data, setData]     = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(false);

  // Guard: only superadmin
  useEffect(() => {
    if (role !== null && role !== "superadmin") {
      router.replace("/client-dashboard");
    }
  }, [role, router]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const [alertsRes, readyRes, metricsRes, patternsRes, auditVerifyRes, auditStatusRes, toolEventsRes, flLifecycleRes, metricsDetailsRes] = await Promise.allSettled([
        fetch(`${API_BASE}/alerts`,            { headers }).then(r => r.json()),
        fetch(`${API_BASE}/ready`,             { headers }).then(r => r.json()),
        fetch(`${API_BASE}/metrics`,           { headers }).then(r => r.json()),
        fetch(`${API_BASE}/admin/fl-patterns`,  { headers }).then(r => r.json()),
        fetch(`${API_BASE}/audit-chain/verify`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/audit-chain/status`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/tool-audit`,         { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/fl-lifecycle`,       { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/metrics/details`,    { headers }).then(r => r.ok ? r.json() : null),
      ]);
      setData({
        alerts:       alertsRes.status === "fulfilled"   ? (alertsRes.value?.alerts   ?? []) : [],
        readiness:    readyRes.status === "fulfilled"    ? readyRes.value              : { status: "unknown", gemini: "unknown" },
        metrics:      metricsRes.status === "fulfilled"  ? metricsRes.value            : {},
        patterns:     patternsRes.status === "fulfilled" ? (patternsRes.value?.patterns ?? []) : [],
        patternStats: patternsRes.status === "fulfilled" ? (patternsRes.value?.stats ?? { promoted:0, candidate:0, retired:0, shadow_rejected:0 }) : { promoted:0, candidate:0, retired:0, shadow_rejected:0 },
        auditVerify:    auditVerifyRes.status === "fulfilled"    ? auditVerifyRes.value    : undefined,
        auditStatus:    auditStatusRes.status === "fulfilled"    ? auditStatusRes.value    : undefined,
        toolEvents:     toolEventsRes.status === "fulfilled"     ? (toolEventsRes.value?.tool_events ?? []) : undefined,
        flLifecycle:    flLifecycleRes.status === "fulfilled"    ? (flLifecycleRes.value?.stats ?? flLifecycleRes.value) : undefined,
        metricsDetails: metricsDetailsRes.status === "fulfilled" ? metricsDetailsRes.value : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const id = setInterval(fetchData, 5_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const handleLogout = () => { logout(); router.push("/login"); };

  const openIncidents = (() => {
    const alerts = data?.alerts ?? [];
    let n = alerts.filter(a => a.severity === "High").length;
    if (data?.auditVerify && !data.auditVerify.is_valid) n++;
    return n;
  })();

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar active={active} setActive={setActive} logout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onRefresh={fetchData} loading={loading} />

        {/* Summary strip */}
        <div className="flex items-center gap-4 border-b border-zinc-800 bg-zinc-900/40 px-6 py-2">
          <div className="flex items-center gap-1.5 text-xs">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span className={`font-semibold ${openIncidents > 0 ? "text-rose-400" : "text-zinc-500"}`}>{openIncidents} open</span>
            <span className="text-zinc-600">incidents</span>
          </div>
          <span className="text-zinc-800">|</span>
          <div className="flex items-center gap-1.5 text-xs">
            <Database className="h-3.5 w-3.5 text-zinc-500" />
            <span className={`${data?.auditVerify && !data.auditVerify.is_valid ? "text-rose-400" : "text-zinc-400"}`}>
              {data?.auditVerify ? (data.auditVerify.is_valid ? "1/1" : "0/1") : "—"}
            </span>
            <span className="text-zinc-600">chains valid</span>
          </div>
          <span className="text-zinc-800">|</span>
          <div className="flex items-center gap-1.5 text-xs">
            <Network className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-zinc-400">{data?.patternStats.candidate ?? 0}</span>
            <span className="text-zinc-600">patterns pending</span>
          </div>
          <span className="text-zinc-800">|</span>
          <div className="flex items-center gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5 text-zinc-500" />
            <span className={`font-semibold ${["ok","ready"].includes(data?.readiness.status ?? "") ? "text-emerald-400" : "text-rose-400"}`}>
              {["ok","ready"].includes(data?.readiness.status ?? "") ? "Gateway OK" : "Gateway degraded"}
            </span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">
            {active === "incidents" && <IncidentQueueScreen  key="incidents" data={data} />}
            {active === "system"    && <SystemOpsScreen      key="system"    data={data} />}
            {active === "tenants"   && <TenantOverviewScreen key="tenants"   data={data} />}
            {active === "patterns"  && <PatternLabScreen     key="patterns"  data={data} />}
            {active === "audit"     && <AuditIntegrityScreen key="audit" data={data} />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
