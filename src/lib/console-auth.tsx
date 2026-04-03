"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function parseJwt(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

export type ConsoleRole = "superadmin" | "org_admin" | "end_user" | null;

interface AuthCtx {
  token: string | null;
  role: ConsoleRole;
  tenantId: string | null;
  loading: boolean;
  error: string | null;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
  authFetch: <T>(path: string, options?: RequestInit) => Promise<T>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function ConsoleAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<ConsoleRole>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyToken(t: string) {
    const claims = parseJwt(t);
    const raw = (claims.platform_role ?? claims.role ?? null) as string | null;
    // "coordinator" and "superadmin" both mean platform admin
    const r: ConsoleRole =
      raw === "coordinator" || raw === "superadmin" ? "superadmin"
      : raw === "admin" || raw === "org_admin" ? "org_admin"
      : raw === "agent" || raw === "end_user" ? "end_user"
      : null;
    const tid = (claims.tenant_id ?? null) as string | null;
    setToken(t);
    setRole(r);
    setTenantId(tid);
  }

  useEffect(() => {
    const stored = sessionStorage.getItem("console_token");
    if (stored) applyToken(stored);
  }, []);

  const login = useCallback(async (apiKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(err.detail ?? `Auth failed (${res.status})`);
      }
      const data = await res.json();
      const t = data.access_token as string;
      const claims = parseJwt(t);
      const raw = (claims.platform_role ?? claims.role ?? "") as string;
      if (raw === "agent" || raw === "end_user") {
        throw new Error("Agent keys cannot be used here. Use your Admin Key.");
      }
      sessionStorage.setItem("console_token", t);
      applyToken(t);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("console_token");
    setToken(null);
    setRole(null);
    setTenantId(null);
  }, []);

  const authFetch = useCallback(async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
    if (!token) throw new Error("Not authenticated");
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers as Record<string, string>),
      },
    });
    if (res.status === 401) {
      sessionStorage.removeItem("console_token");
      setToken(null);
      setRole(null);
      setTenantId(null);
      throw new Error("Session expired — please sign in again.");
    }
    if (!res.ok) {
      const detail = await res.json().catch(() => ({})) as { detail?: string };
      throw new Error(detail?.detail ?? res.statusText);
    }
    return res.json() as Promise<T>;
  }, [token]);

  return (
    <Ctx.Provider value={{ token, role, tenantId, loading, error, login, logout, authFetch }}>
      {children}
    </Ctx.Provider>
  );
}

export function useConsoleAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConsoleAuth must be used within ConsoleAuthProvider");
  return ctx;
}
