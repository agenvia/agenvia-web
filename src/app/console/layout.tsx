"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConsoleAuthProvider, useConsoleAuth } from "@/lib/console-auth";
import {
  Shield, LayoutDashboard, AlertTriangle, Users,
  Network, LogOut, ExternalLink, Building2, Globe,
} from "lucide-react";

const CLIENT_NAV = [
  { href: "/console",          label: "Overview",    icon: LayoutDashboard },
  { href: "/console/alerts",   label: "Alerts",      icon: AlertTriangle },
  { href: "/console/users",    label: "Users",       icon: Users },
  { href: "/console/patterns", label: "FL Patterns", icon: Network },
];

const ADMIN_NAV = [
  { href: "/console",           label: "Overview",    icon: LayoutDashboard },
  { href: "/console/tenants",   label: "Tenants",     icon: Building2 },
  { href: "/console/alerts",    label: "All Alerts",  icon: AlertTriangle },
  { href: "/console/users",     label: "All Users",   icon: Users },
  { href: "/console/patterns",  label: "FL Patterns", icon: Network },
];

function Sidebar() {
  const { logout, role, tenantId } = useConsoleAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role === "superadmin";
  const nav = isAdmin ? ADMIN_NAV : CLIENT_NAV;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-zinc-900 border-r border-zinc-800 h-screen sticky top-0">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-zinc-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/10 border border-teal-500/20">
          <Shield className="h-4 w-4 text-teal-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-zinc-100 leading-none">Agenvia</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {isAdmin ? "Platform Admin" : "Security Console"}
          </div>
        </div>
      </div>

      {/* Role badge */}
      {role && (
        <div className="px-4 py-2.5 border-b border-zinc-800/60">
          {isAdmin ? (
            <div className="flex items-center gap-1.5 rounded-md border border-teal-500/20 bg-teal-500/10 px-2 py-1">
              <Globe className="h-3 w-3 text-teal-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-teal-400">
                Agenvia Admin
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1">
              <Building2 className="h-3 w-3 text-zinc-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 truncate">
                {tenantId ?? "org"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          {isAdmin ? "Platform" : "Dashboard"}
        </p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-100 ${
                active
                  ? "bg-zinc-800 text-zinc-50 font-medium border-l-2 border-teal-500"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Resources
          </p>
          <Link
            href="/developers"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            Developer Docs
          </Link>
          <Link
            href="/live-demo"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            Live Demo
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-zinc-800 p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function ConsoleGuard({ children }: { children: React.ReactNode }) {
  const { token } = useConsoleAuth();
  const router = useRouter();

  useEffect(() => {
    if (token === null && typeof window !== "undefined") {
      const stored = sessionStorage.getItem("console_token");
      if (!stored) router.push("/login");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsoleAuthProvider>
      <ConsoleGuard>{children}</ConsoleGuard>
    </ConsoleAuthProvider>
  );
}
