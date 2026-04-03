"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { Copy, Check, KeyRound, Building2 } from "lucide-react";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">{label}</span>
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

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [companyName,  setCompanyName]  = useState("");
  const [tenantId,     setTenantId]     = useState("");
  const [tenantIdErr,  setTenantIdErr]  = useState<string | null>(null);
  const [verifyCode,   setVerifyCode]   = useState("");

  const [step,    setStep]    = useState<"form" | "verify" | "keys">("form");
  const [keys,    setKeys]    = useState<{ agent_key: string; admin_key: string } | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateTenantId(val: string) {
    setTenantId(val);
    if (val && !/^[a-z0-9_\-]{3,64}$/.test(val)) {
      setTenantIdErr("Lowercase letters, numbers, _ or - · 3–64 chars");
    } else {
      setTenantIdErr(null);
    }
  }

  function suggestTenantId(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 64);
  }

  async function createTenant(emailAddr: string) {
    const res = await fetch("/api/user/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenant_id: tenantId, company_name: companyName, contact_email: emailAddr }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to create organization");
    setKeys({ agent_key: data.agent_key, admin_key: data.admin_key });
    setStep("keys");
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    if (!isLoaded || tenantIdErr) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signUp.create({ emailAddress: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await createTenant(email);
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setStep("verify");
      }
    } catch (err: unknown) {
      const e = err as { errors?: Array<{ message: string }>; message?: string };
      setError(e.errors?.[0]?.message ?? e.message ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verifyCode });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await createTenant(email);
      }
    } catch (err: unknown) {
      const e = err as { errors?: Array<{ message: string }>; message?: string };
      setError(e.errors?.[0]?.message ?? e.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors";
  const labelCls = "block text-xs font-medium text-zinc-400 mb-1.5";

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* ── Step: Sign-up form ── */}
        {step === "form" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-100 mb-5 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-zinc-500" />
              Create your account
            </h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input className={inputCls} type="password" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <div>
                <label className={labelCls}>Company Name</label>
                <input className={inputCls} value={companyName}
                  onChange={e => {
                    setCompanyName(e.target.value);
                    if (!tenantId) validateTenantId(suggestTenantId(e.target.value));
                  }}
                  placeholder="City General Hospital" required />
              </div>
              <div>
                <label className={labelCls}>
                  Tenant ID <span className="text-zinc-600">(unique slug for your org)</span>
                </label>
                <input className={`${inputCls} font-mono ${tenantIdErr ? "border-red-500" : ""}`}
                  value={tenantId}
                  onChange={e => validateTenantId(e.target.value.toLowerCase())}
                  placeholder="city_general_hospital" required />
                {tenantIdErr
                  ? <p className="mt-1 text-xs text-red-400">{tenantIdErr}</p>
                  : <p className="mt-1 text-xs text-zinc-600">Lowercase, no spaces.</p>}
              </div>

              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button type="submit"
                disabled={loading || !isLoaded || !!tenantIdErr || !email || !password || !companyName || !tenantId}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {loading ? "Creating account…" : <><KeyRound className="h-4 w-4" /> Create account</>}
              </button>
            </form>
          </div>
        )}

        {/* ── Step: Email verification ── */}
        {step === "verify" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-100 mb-2">Verify your email</h2>
            <p className="text-xs text-zinc-500 mb-5">
              We sent a code to <span className="text-zinc-300">{email}</span>
            </p>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className={labelCls}>Verification Code</label>
                <input className={`${inputCls} font-mono tracking-widest text-center`}
                  value={verifyCode} onChange={e => setVerifyCode(e.target.value)}
                  placeholder="000000" required maxLength={6} />
              </div>
              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading || !verifyCode}
                className="w-full rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {loading ? "Verifying…" : "Verify & generate keys"}
              </button>
            </form>
          </div>
        )}

        {/* ── Step: Keys ── */}
        {step === "keys" && keys && (
          <>
            <p className="text-sm text-zinc-100 mb-4">Copy and save these. They will not be displayed again.</p>
            <div className="space-y-3">
              <CopyField label="Agent Key" value={keys.agent_key} />
              <p className="text-xs text-zinc-500 px-1">Use in agent .env</p>
              <CopyField label="Admin Key" value={keys.admin_key} />
              <p className="text-xs text-zinc-500 px-1">Use to sign in dashboard</p>
            </div>
            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-teal-400 hover:text-teal-300">
                Go to dashboard →
              </Link>
            </div>
          </>
        )}

        {step === "form" && (
          <p className="text-center text-xs text-zinc-600 mt-4">
            Already have an account?{" "}
            <Link href="/signin" className="text-teal-400 hover:text-teal-300">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
