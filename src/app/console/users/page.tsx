"use client";

import { useState, useEffect, FormEvent } from "react";
import { useConsoleAuth } from "@/lib/console-auth";
import { Users, Plus, CheckCircle, RefreshCw, Building2 } from "lucide-react";

const ROLES = ["end_user", "org_admin", "data_steward", "agent_operator", "auditor"];
const LEVELS = ["full", "restricted", "summary"];
const DOMAINS = ["medical", "hr", "legal", "finance", "customer", "engineering", "all"];

interface DomainEntry { domain: string; level: string }
interface UserRecord {
  user_id: string;
  display_name?: string;
  tenant_id: string;
  platform_role?: string;
  status?: string;
  domain_access?: DomainEntry[];
  created_at?: string;
}

// ── Superadmin view: all users across all tenants ─────────────────────────────
function AdminUsersView() {
  const { authFetch } = useConsoleAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await authFetch<{ users: UserRecord[] }>("/admin/users");
      setUsers(data.users ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const byTenant = users.reduce<Record<string, UserRecord[]>>((acc, u) => {
    const key = u.tenant_id ?? "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(u);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-zinc-500" />
          <h1 className="text-base font-semibold text-zinc-100">All Users</h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <main className="p-6 max-w-screen-xl mx-auto space-y-5">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Total Users</p>
            <p className="text-3xl font-bold tabular-nums text-zinc-50">{loading ? "—" : users.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Tenants</p>
            <p className="text-3xl font-bold tabular-nums text-teal-400">{loading ? "—" : Object.keys(byTenant).length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Active</p>
            <p className="text-3xl font-bold tabular-nums text-emerald-400">
              {loading ? "—" : users.filter((u) => (u.status ?? "active") === "active").length}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Org Admins</p>
            <p className="text-3xl font-bold tabular-nums text-amber-400">
              {loading ? "—" : users.filter((u) => u.platform_role === "org_admin").length}
            </p>
          </div>
        </div>

        {/* Users grouped by tenant */}
        {loading ? (
          <div className="text-sm text-zinc-600 py-4">Loading users…</div>
        ) : Object.entries(byTenant).map(([tid, tenantUsers]) => (
          <div key={tid} className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-100">{tid}</span>
              <span className="text-xs text-zinc-500">· {tenantUsers.length} user{tenantUsers.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr_0.8fr] gap-4 border-b border-zinc-800 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <div>User</div>
              <div>Role</div>
              <div>Domain Access</div>
              <div>Status</div>
              <div>Joined</div>
            </div>
            {tenantUsers.map((u) => (
              <div key={u.user_id} className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr_0.8fr] gap-4 border-b border-zinc-800/50 px-5 py-3 text-sm last:border-b-0 hover:bg-zinc-800/30 transition-colors">
                <div>
                  <div className="font-medium text-zinc-100">{u.display_name ?? u.user_id}</div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-0.5">{u.user_id}</div>
                </div>
                <div className="text-xs font-mono text-teal-400">{u.platform_role ?? "end_user"}</div>
                <div className="flex flex-wrap gap-1">
                  {(u.domain_access ?? []).map((d, i) => (
                    <span key={i} className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                      {d.domain}:{d.level}
                    </span>
                  ))}
                </div>
                <div>
                  <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${
                    (u.status ?? "active") === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}>
                    {u.status ?? "active"}
                  </span>
                </div>
                <div className="text-xs text-zinc-500">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}

// ── Org admin view: register + manage their own users ─────────────────────────
function OrgUsersView() {
  const { authFetch, tenantId: ctxTenantId } = useConsoleAuth();
  const tenantId = ctxTenantId ?? "";
  const [userId, setUserId]           = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole]               = useState("end_user");
  const [clearances, setClearances]   = useState("");
  const [domains, setDomains]         = useState<DomainEntry[]>([{ domain: "legal", level: "full" }]);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [users, setUsers]             = useState<UserRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);

  async function loadUsers() {
    setListLoading(true);
    try {
      const data = await authFetch<{ users: UserRecord[] }>("/admin/users");
      setUsers((data.users ?? []).filter((u) => u.tenant_id === tenantId));
    } catch {
      // non-fatal — list just won't show
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function addDomain() { setDomains((d) => [...d, { domain: "medical", level: "full" }]); }
  function removeDomain(i: number) { setDomains((d) => d.filter((_, idx) => idx !== i)); }
  function updateDomain(i: number, field: keyof DomainEntry, val: string) {
    setDomains((d) => d.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await authFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          tenant_id: tenantId,
          user_id: userId,
          display_name: displayName || userId,
          platform_role: role,
          domain_access: domains,
          data_clearances: clearances.split(",").map((s) => s.trim()).filter(Boolean),
          status: "active",
        }),
      });
      setSuccess(true);
      setUserId("");
      setDisplayName("");
      setClearances("");
      setDomains([{ domain: "legal", level: "full" }]);
      loadUsers();
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("409") || msg.toLowerCase().includes("already")) {
        setSuccess(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors";
  const labelCls = "block text-xs font-medium text-zinc-400 mb-1.5";

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center px-6 sticky top-0 z-40">
        <Users className="h-4 w-4 text-zinc-500 mr-2" />
        <h1 className="text-base font-semibold text-zinc-100">Users</h1>
      </header>

      <main className="p-6 max-w-screen-xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-100">Register User</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Profiles are applied immediately to the Universal Role Engine.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tenant</label>
                  <div className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-400 font-mono select-none">
                    {tenantId}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>User ID *</label>
                  <input className={inputCls} value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="jane_smith" required />
                </div>
              </div>
              <div>
                <label className={labelCls}>Display Name</label>
                <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nurse Jane" />
              </div>
              <div>
                <label className={labelCls}>Platform Role</label>
                <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls.replace("mb-1.5", "")}>Domain Access</label>
                  <button type="button" onClick={addDomain} className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300">
                    <Plus className="h-3 w-3" /> Add domain
                  </button>
                </div>
                <div className="space-y-2">
                  {domains.map((d, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select className={`${inputCls} flex-1`} value={d.domain} onChange={(e) => updateDomain(i, "domain", e.target.value)}>
                        {DOMAINS.map((dom) => <option key={dom} value={dom}>{dom}</option>)}
                      </select>
                      <select className={`${inputCls} w-32`} value={d.level} onChange={(e) => updateDomain(i, "level", e.target.value)}>
                        {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                      {domains.length > 1 && (
                        <button type="button" onClick={() => removeDomain(i)} className="text-zinc-600 hover:text-red-400 text-xs px-1">x</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Data Clearances <span className="text-zinc-600">(comma separated)</span></label>
                <input className={inputCls} value={clearances} onChange={(e) => setClearances(e.target.value)} placeholder="medical_record, pii" />
              </div>
              {success && (
                <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  User registered — profile active immediately.
                </div>
              )}
              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading || !userId.trim()}
                className="w-full rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Registering..." : "Register User"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-100">Platform Roles</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Role</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["end_user",       "Declared domains only — blocked everywhere else"],
                    ["org_admin",      "All domains, full access — still runs through pipeline"],
                    ["data_steward",   "All domains, PII always masked"],
                    ["agent_operator", "Cleared domains, restricted action-tier ceiling"],
                    ["auditor",        "All domains, aggregated responses only"],
                  ].map(([r, desc]) => (
                    <tr key={r} className="border-b border-zinc-800/50">
                      <td className="px-5 py-3 text-xs font-mono text-teal-400">{r}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-100">Access Levels</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Level</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">What the user receives</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["full",       "Complete response for their domain"],
                    ["restricted", "Response with PII masked"],
                    ["summary",    "Aggregated/minimized response only"],
                  ].map(([l, desc]) => (
                    <tr key={l} className="border-b border-zinc-800/50">
                      <td className="px-5 py-3 text-xs font-mono text-zinc-300">{l}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Registered users list */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500" /> Registered Users
              <span className="text-xs text-zinc-500">· {tenantId}</span>
            </h3>
            <button onClick={loadUsers} disabled={listLoading} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-40">
              <RefreshCw className={`h-3 w-3 ${listLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          {listLoading ? (
            <div className="p-5 text-xs text-zinc-600">Loading…</div>
          ) : users.length === 0 ? (
            <div className="p-5 text-sm text-zinc-600">No users registered yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">User</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Role</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Domains</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors last:border-b-0">
                    <td className="px-5 py-3">
                      <div className="font-medium text-zinc-100 text-sm">{u.display_name ?? u.user_id}</div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-0.5">{u.user_id}</div>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-teal-400">{u.platform_role ?? "end_user"}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(u.domain_access ?? []).map((d, i) => (
                          <span key={i} className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                            {d.domain}:{d.level}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${
                        (u.status ?? "active") === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}>
                        {u.status ?? "active"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Router: show correct view based on role ───────────────────────────────────
export default function UsersPage() {
  const { role } = useConsoleAuth();
  return role === "superadmin" ? <AdminUsersView /> : <OrgUsersView />;
}
