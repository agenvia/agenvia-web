"use client";

import { useState, FormEvent } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Copy, Check, KeyRound, Building2 } from "lucide-react";
import Link from "next/link";

interface Keys {
  tenant_id:    string;
  company_name: string;
  agent_key:    string;
  admin_key:    string;
}

function CopyField({ label, value, color = "teal" }: {
  label: string; value: string; color?: "teal" | "amber";
}) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[11px] font-semibold uppercase tracking-widest ${color === "teal" ? "text-teal-400" : "text-amber-400"}`}>
          {label}
        </span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors">
          {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="font-mono text-sm bg-zinc-950 rounded-md px-4 py-3 break-all select-all text-zinc-100">
        {value}
      </div>
    </div>
  );
}

export default function GetStartedPage() {
  const { user, isLoaded } = useUser();

  // Step 1 — form
  const [tenantId,     setTenantId]     = useState("");
  const [companyName,  setCompanyName]  = useState("");
  const [email,        setEmail]        = useState("");
  const [slugError,    setSlugError]    = useState<string | null>(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [formError,    setFormError]    = useState<string | null>(null);

  // Step 2 — keys
  const [keys, setKeys] = useState<Keys | null>(null);

  function validateSlug(val: string) {
    setTenantId(val);
    if (val && !/^[a-z0-9_\-]{3,64}$/.test(val)) {
      setSlugError("Lowercase letters, numbers, _ or - only · 3–64 chars");
    } else {
      setSlugError(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (slugError) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, company_name: companyName, contact_email: email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong");
        return;
      }
      setKeys(data);
    } catch {
      setFormError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 text-sm">Loading...</div>
      </div>
    );
  }

  const inputCls = "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors";
  const labelCls = "block text-xs font-medium text-zinc-400 mb-1.5";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Agenvia" className="h-7 w-7 rounded-lg" />
            <div className="text-base font-bold text-teal-400 tracking-tight uppercase">AGENVIA</div>
          </Link>
        </div>
        <UserButton />
      </header>

      <main className="max-w-md mx-auto px-6 py-12">

        {/* ── Step 1: Setup form ── */}
        {!keys && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold mb-2">
                Welcome, {user?.firstName ?? "Developer"}
              </h1>
              <p className="text-zinc-400 text-sm">
                Set up your organization to get your agent key and admin key.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-sm font-semibold text-zinc-100 mb-5 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-zinc-500" />
                Organization Setup
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Company Name</label>
                  <input
                    className={inputCls}
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="City General Hospital"
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Tenant ID <span className="text-zinc-600">(unique slug for your org)</span>
                  </label>
                  <input
                    className={`${inputCls} font-mono ${slugError ? "border-red-500" : ""}`}
                    value={tenantId}
                    onChange={e => validateSlug(e.target.value.toLowerCase())}
                    placeholder="city_general_hospital"
                    required
                  />
                  {slugError ? (
                    <p className="mt-1 text-xs text-red-400">{slugError}</p>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-600">Lowercase, no spaces. Used to scope all your data.</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Email <span className="text-zinc-600">(Dashboard User)</span></label>
                  <input
                    className={inputCls}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="it-admin@yourorg.com"
                    required
                  />
                </div>

                {formError && (
                  <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !!slugError || !tenantId || !companyName || !email}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Generating keys…" : (
                    <><KeyRound className="h-4 w-4" /> Generate Agent Key + Admin Key</>
                  )}
                </button>
              </form>
            </div>
          </>
        )}

        {/* ── Step 2: Keys display ── */}
        {keys && (
          <>
            {/* Header */}
            <div className="mb-6">
              <p className="text-sm text-zinc-100">Copy and save these. They will not be displayed again.</p>
            </div>

            {/* Keys */}
            <div className="space-y-3 mb-8">
              <CopyField label="Agent Key" value={keys.agent_key} color="teal" />
              <p className="text-xs text-zinc-500 px-1">Use in agent .env</p>

              <CopyField label="Admin Key" value={keys.admin_key} color="teal" />
              <p className="text-xs text-zinc-500 px-1">Use to sign in dashboard</p>
            </div>

          </>
        )}
      </main>
    </div>
  );
}
