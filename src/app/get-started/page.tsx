"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Shield, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function GetStartedPage() {
  const { user, isLoaded } = useUser();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch("/api/user/api-key", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.api_key) setApiKey(d.api_key);
        else setError(d.error ?? "Failed to generate key");
        setLoading(false);
      })
      .catch(() => {
        setError("Network error");
        setLoading(false);
      });
  }, [isLoaded, user]);

  function copy() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 text-sm">Setting up your account...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20">
              <Shield className="h-4 w-4 text-teal-400" />
            </div>
            <span className="text-sm font-semibold">Agenvia</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4">
            <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors">Home</Link>
            <Link href="/developers" className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors">Docs</Link>
            <Link href="/live-demo" className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors">Live Demo</Link>
          </nav>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold mb-2">
          Welcome, {user?.firstName ?? "Developer"}
        </h1>
        <p className="text-zinc-400 text-sm mb-8">
          Your API key is ready. Use it to authenticate requests to the Agenvia gateway.
        </p>

        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-400">
            {error}
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Your API Key</span>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="font-mono text-sm text-teal-300 bg-zinc-950 rounded-md px-4 py-3 break-all">
                {apiKey}
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                Save this key — it will not be shown again after you leave this page.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-sm font-semibold mb-4">Quickstart</h2>
              <pre className="text-xs text-zinc-300 bg-zinc-950 rounded-md p-4 overflow-x-auto whitespace-pre">{`pip install agenvia

from agenvia import Agenvia

client = Agenvia(api_key="${apiKey}")

decision = client.evaluate(
    "Summarize the patient record",
    actor_id="agent-1"
)

print(decision.action)  # allow | minimize | block`}</pre>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
