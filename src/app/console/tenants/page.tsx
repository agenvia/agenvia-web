"use client";

import { useEffect, useState } from "react";
import { useConsoleAuth } from "@/lib/console-auth";
import { Building2, RefreshCw, CheckCircle, AlertTriangle, Users, Activity } from "lucide-react";

interface Tenant {
  tenant_id: string;
  name?: string;
  plan?: string;
  status?: string;
  user_count?: number;
  request_count?: number;
  created_at?: string;
}

interface TenantsResponse {
  tenants: Tenant[];
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "active").toLowerCase();
  const styles =
    s === "active"    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
    s === "suspended" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-zinc-800 text-zinc-400 border-zinc-700";
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${styles}`}>
      {status ?? "active"}
    </span>
  );
}

export default function TenantsPage() {
  const { authFetch, role } = useConsoleAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await authFetch<TenantsResponse>("/admin/tenants");
      setTenants(data.tenants ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (role !== "superadmin") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
          <p className="text-sm text-zinc-400">Access restricted to platform admins.</p>
        </div>
      </div>
    );
  }

  const active = tenants.filter((t) => (t.status ?? "active") === "active").length;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-6 sticky top-0 z-40">
        <div>
          <h1 className="text-base font-semibold text-zinc-100">Tenants</h1>
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

      <main className="p-6 max-w-screen-xl mx-auto space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Total Tenants</p>
            <p className="text-3xl font-bold tabular-nums text-zinc-50">{loading ? "—" : tenants.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Active</p>
            <p className="text-3xl font-bold tabular-nums text-emerald-400">{loading ? "—" : active}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Total Users</p>
            <p className="text-3xl font-bold tabular-nums text-teal-400">
              {loading ? "—" : tenants.reduce((s, t) => s + (t.user_count ?? 0), 0)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Total Requests</p>
            <p className="text-3xl font-bold tabular-nums text-zinc-50">
              {loading ? "—" : tenants.reduce((s, t) => s + (t.request_count ?? 0), 0)}
            </p>
          </div>
        </div>

        {/* Tenants table */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-medium text-zinc-100">All Client Organizations</h3>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-zinc-800 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <div>Tenant</div>
            <div>Plan</div>
            <div className="flex items-center gap-1"><Users className="h-3 w-3" /> Users</div>
            <div className="flex items-center gap-1"><Activity className="h-3 w-3" /> Requests</div>
            <div>Status</div>
            <div>Created</div>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-sm text-zinc-600">Loading tenants…</div>
          ) : tenants.length === 0 ? (
            <div className="px-5 py-8 flex items-center gap-2 text-sm text-zinc-500">
              <CheckCircle className="h-4 w-4 text-zinc-600" />
              No tenants found.
            </div>
          ) : (
            tenants.map((t) => (
              <div
                key={t.tenant_id}
                className="grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-zinc-800/50 px-5 py-4 text-sm last:border-b-0 hover:bg-zinc-800/30 transition-colors"
              >
                <div>
                  <div className="font-medium text-zinc-100">{t.name ?? t.tenant_id}</div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-0.5">{t.tenant_id}</div>
                </div>
                <div className="text-zinc-400 capitalize">{t.plan ?? "standard"}</div>
                <div className="text-zinc-300 tabular-nums">{t.user_count ?? 0}</div>
                <div className="text-zinc-300 tabular-nums">{t.request_count ?? 0}</div>
                <div><StatusBadge status={t.status} /></div>
                <div className="text-zinc-500 text-xs">
                  {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
