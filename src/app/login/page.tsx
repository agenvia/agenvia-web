"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useConsoleAuth } from "@/lib/console-auth";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const { login, loading } = useConsoleAuth();
  const [apiKey, setApiKey] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await login(apiKey.trim());
      // Decode role from the freshly stored token without waiting for React state update
      const stored = sessionStorage.getItem("console_token");
      let dest = "/client-dashboard";
      if (stored) {
        try {
          const claims = JSON.parse(atob(stored.split(".")[1])) as Record<string, unknown>;
          const raw = (claims.platform_role ?? claims.role ?? "") as string;
          if (raw === "coordinator" || raw === "superadmin") dest = "/super-admin";
          else if (raw === "admin" || raw === "org_admin") dest = "/client-dashboard";
        } catch { /* fall through to default */ }
      }
      router.push(dest);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20">
            <Shield className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-100">Agenvia</div>
            <div className="text-xs text-zinc-500">Security Console</div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-lg font-semibold text-zinc-50 mb-1">Sign in to your console</h1>
          <p className="text-sm text-zinc-400 mb-6">
            Enter your organization API key to access the dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="admin-org-a"
                required
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
              />
            </div>

            {err && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="w-full rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-600">
          Dev keys — Super Admin: <span className="font-mono text-zinc-500">superadmin-key</span> · Org Admin: <span className="font-mono text-zinc-500">admin-org-a</span>
        </p>
      </div>
    </div>
  );
}
