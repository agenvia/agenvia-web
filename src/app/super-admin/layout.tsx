"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConsoleAuthProvider, useConsoleAuth } from "@/lib/console-auth";

function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { token, role } = useConsoleAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("console_token");
    if (!token && !stored) {
      router.replace("/login");
    }
  }, [token, router]);

  useEffect(() => {
    if (role !== null && role !== "superadmin") {
      router.replace("/console");
    }
  }, [role, router]);

  return <>{children}</>;
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsoleAuthProvider>
      <SuperAdminGuard>{children}</SuperAdminGuard>
    </ConsoleAuthProvider>
  );
}
