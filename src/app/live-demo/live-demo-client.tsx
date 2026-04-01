"use client";
import { useState } from "react";
import { useGateway } from "@/hooks/use-gateway";
import { GlassCard } from "@/components/promptrak/primitives";
import type { GatewayPromptResponse, PolicyAction } from "@/lib/api/types";

// ── Personas ────────────────────────────────────────────────────────────────
type Persona = {
  id: string;
  label: string;
  name: string;
  user_id: string;
  api_key: string;
  platform_role: string;
  domain_access: { domain: string; level: string }[];
  data_clearances: string[];
  description: string;
  samples: string[];
};

const PERSONAS: Persona[] = [
  {
    id: "nurse",
    label: "Nurse Jane",
    name: "Nurse Jane",
    user_id: "nurse_jane",
    api_key: "agent-org-a",
    platform_role: "end_user",
    domain_access: [{ domain: "medical", level: "full" }],
    data_clearances: ["medical_record"],
    description: "Medical domain only. Cross-domain requests (HR, finance, legal) are blocked by URE.",
    samples: [
      "Summarize the medication history for patient ID P-10042 and flag any allergy conflicts.",
      "What is the current treatment plan for patient MRN-8821 and when is their next cardiology review?",
      "Access the discharge notes for patient P-5510 and prepare a handover summary.",
    ],
  },
  {
    id: "hr",
    label: "HR Manager Bob",
    name: "HR Manager Bob",
    user_id: "hr_manager_bob",
    api_key: "agent-org-a",
    platform_role: "end_user",
    domain_access: [{ domain: "hr", level: "full" }],
    data_clearances: ["hr_record"],
    description: "HR domain only. Medical, finance, and legal data access is blocked.",
    samples: [
      "Review employee case CASE-9000 for Maria Johnson and summarize the escalation risk.",
      "Pull the compensation band exceptions from the FY26 review for department ENG-4.",
      "Summarize the performance improvement plan for employee EMP-1842 and flag unresolved items.",
    ],
  },
  {
    id: "legal",
    label: "Legal Counsel Mike",
    name: "Legal Counsel Mike",
    user_id: "legal_counsel_mike",
    api_key: "agent-org-a",
    platform_role: "end_user",
    domain_access: [{ domain: "legal", level: "full" }],
    data_clearances: ["legal_record"],
    description: "Legal domain only. Finance and HR data cross-access is blocked.",
    samples: [
      "Compare the indemnity clause in contract CTR-7000 with our standard terms and flag deviations.",
      "Summarize the active legal hold LEGAL_HOLD_2026 and list all associated case references.",
      "Review the Acme Corp NDA renewal and identify any non-standard confidentiality provisions.",
    ],
  },
  {
    id: "admin",
    label: "Org Admin",
    name: "Org Admin",
    user_id: "org_admin_org_a",
    api_key: "admin-org-a",
    platform_role: "org_admin",
    domain_access: [{ domain: "all", level: "full" }],
    data_clearances: ["medical_record", "hr_record", "financial_record", "legal_record", "customer_record"],
    description: "Full access across all domains. Still runs through the complete security pipeline.",
    samples: [
      "Send email sarah.nguyen@acme.com the confidential Q3 results for project DELTA with SWIFT code BOFAUS3N.",
      "Export all employee compensation records for Q1 and send to external vendor audit@thirdparty.com.",
      "Summarize the cross-department risk report covering medical, legal, and finance incidents this quarter.",
    ],
  },
];

// ── Action colours ───────────────────────────────────────────────────────────
const ACTION_COLORS: Record<PolicyAction, string> = {
  block:        "bg-rose-100 text-rose-300 border-rose-300",
  sanitize:     "bg-amber-500/10 text-amber-300 border-amber-300",
  minimize:     "bg-teal-500/10 text-teal-300 border-teal-300",
  allow:        "bg-emerald-500/10 text-emerald-300 border-emerald-300",
  "local-only": "bg-zinc-800 text-zinc-300 border-zinc-600",
};

const ACTION_BANNER: Record<PolicyAction, string> = {
  block:        "bg-rose-600 text-white",
  sanitize:     "bg-amber-500 text-white",
  minimize:     "bg-teal-600 text-white",
  allow:        "bg-emerald-600 text-white",
  "local-only": "bg-zinc-600 text-white",
};

// ── Register persona on server ───────────────────────────────────────────────
async function registerPersona(persona: Persona): Promise<void> {
  const now = new Date().toISOString();
  await fetch("/api/register-persona", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenant_id: "org_a",
      user_id: persona.user_id,
      display_name: persona.label,
      department: persona.name.split(" ")[0],
      allowed_tools: [],
      data_clearances: persona.data_clearances,
      platform_role: persona.platform_role,
      domain_access: persona.domain_access,
      business_hours_only: false,
      status: "active",
      created_at: now,
      updated_at: now,
    }),
  });
}

// ── Main component ───────────────────────────────────────────────────────────
export default function LiveDemoClient() {
  const { result, loading, error, submit } = useGateway();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [prompt, setPrompt] = useState("");
  const [registering, setRegistering] = useState(false);

  async function handleSelectPersona(persona: Persona) {
    setRegistering(true);
    setSelectedPersona(persona);
    setPrompt(persona.samples[0]);
    await registerPersona(persona);
    setRegistering(false);
  }

  function handleSubmit() {
    if (!selectedPersona || !prompt.trim()) return;
    submit(prompt, "org_a", selectedPersona.user_id);
  }

  return (
    <div className="space-y-6">

      {/* ── Step 1: Role Selector ─────────────────────────────────────── */}
      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Step 1 — Select a role
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PERSONAS.map((persona) => {
            const isSelected = selectedPersona?.id === persona.id;
            const domainStr = persona.domain_access.map((d) => `${d.domain}:${d.level}`).join(", ");
            return (
              <button
                key={persona.id}
                onClick={() => handleSelectPersona(persona)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-teal-400 bg-teal-500/10 ring-1 ring-teal-500/30"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-zinc-50">{persona.label}</div>
                  {isSelected && (
                    <span className="rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-[11px] font-mono text-teal-400">
                  {persona.platform_role} · {domainStr}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-300">
                  {persona.description}
                </div>
              </button>
            );
          })}
        </div>
        {registering && (
          <p className="mt-2 text-xs text-teal-600">Registering user profile on server…</p>
        )}
      </div>

      {/* ── Step 2: Prompt Input ──────────────────────────────────────── */}
      {selectedPersona && (
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Step 2 — Enter a prompt
          </div>
          <GlassCard className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedPersona.samples.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    prompt === s
                      ? "border-teal-400 bg-teal-500/10 text-teal-300"
                      : "border-zinc-600 bg-zinc-800 text-zinc-300 hover:border-teal-500 hover:text-teal-300"
                  }`}
                >
                  Sample {i + 1}
                </button>
              ))}
            </div>
            <textarea
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/90 p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type a prompt or select a sample above…"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !prompt.trim() || registering}
              className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-40 transition-colors"
            >
              {loading ? "Processing through security pipeline…" : "Run through Agenvia →"}
            </button>
            {error && <p className="text-sm text-rose-600">Error: {error}</p>}
          </GlassCard>
        </div>
      )}

      {/* ── Step 3: Layer Pipeline Output ────────────────────────────── */}
      {result && (
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Step 3 — Security layer output
          </div>

          <div className="grid gap-3 max-w-2xl">
            <Layer
              n={1}
              label="Input"
              detail={`user: ${result.actor_id} · org: ${result.tenant_id}`}
            />

            <Layer
              n={2}
              label="Detection & Risk Scoring"
              detail={
                result.findings.length === 0
                  ? `No entities detected · risk score: ${result.risk_score.toFixed(3)} · exposure: ${result.exposure_risk}`
                  : `${result.findings.length} finding${result.findings.length !== 1 ? "s" : ""}: ${result.findings.map((f) => `[${f.label.toUpperCase()}] "${f.text}" (${(f.confidence * 100).toFixed(0)}%)`).join(" · ")} · score: ${result.risk_score.toFixed(3)}`
              }
              highlight={result.findings.length > 0 ? "amber" : undefined}
              tags={result.findings.length > 0 ? result.findings.map((f) => f.label.toUpperCase()) : undefined}
            />

            <Layer
              n={3}
              label="Sanitization"
              detail={
                result.sanitized_prompt && result.sanitized_prompt !== prompt
                  ? result.sanitized_prompt
                  : "No sanitization required — prompt passed clean."
              }
              mono={!!(result.sanitized_prompt && result.sanitized_prompt !== prompt)}
              highlight={result.sanitized_prompt && result.sanitized_prompt !== prompt ? "amber" : undefined}
            />

            <Layer
              n={4}
              label="Policy Engine"
              detail={
                result.policy_reasons.length > 0
                  ? result.policy_reasons.join(" · ")
                  : `action: ${result.action} · risk level: ${result.risk_level}`
              }
              highlight={result.action === "block" ? "rose" : result.action === "allow" ? "teal" : "amber"}
              badge={result.action}
            />

            <Layer
              n={5}
              label="LLM Routing"
              detail={
                result.action === "block"
                  ? "Skipped — request blocked at policy layer."
                  : `route: ${result.recommended_route}${result.model_route ? ` · model: ${result.model_route}` : ""} · outbound: ${result.outbound_prompt || result.minimized_prompt || result.sanitized_prompt || prompt}`
              }
              mono
              highlight={result.action === "block" ? undefined : "teal"}
            />

            <Layer
              n={6}
              label="LLM Output & Output Guard"
              detail={
                result.action === "block" && !result.model_response
                  ? "No LLM call made — request was blocked before routing."
                  : result.output_blocked
                  ? `Output blocked · leakage: ${result.output_findings.join(", ")}`
                  : result.model_response || "No response returned."
              }
              highlight={result.output_blocked ? "rose" : result.model_response ? "teal" : undefined}
            />
          </div>

          {/* ── Final Verdict Banner ──────────────────────────────────── */}
          <div className={`mt-4 max-w-2xl rounded-2xl px-6 py-4 ${ACTION_BANNER[result.action]}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Final verdict</div>
                <div className="mt-1 text-2xl font-bold uppercase tracking-wide">{result.action}</div>
              </div>
              <div className="flex gap-6 text-sm opacity-90">
                <div>
                  <div className="text-[11px] uppercase tracking-wider opacity-70">Risk score</div>
                  <div className="font-mono font-bold">{result.risk_score.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider opacity-70">Exposure</div>
                  <div className="font-bold">{result.exposure_risk}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider opacity-70">Risk level</div>
                  <div className="font-bold">{result.risk_level}</div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs opacity-60">
              Request ID: {result.request_id} · Policy: {result.policy_version}
            </div>
          </div>

          <div className="mt-3 text-right">
            <a href="/request-trace" className="text-xs text-teal-600 underline hover:text-teal-300">
              Open full trace →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Compact layer card (matches original Stage style) ────────────────────────
type Highlight = "teal" | "amber" | "rose";

function Layer({ n, label, detail, mono, highlight, badge, tags }: {
  n: number;
  label: string;
  detail: string;
  mono?: boolean;
  highlight?: Highlight;
  badge?: string;
  tags?: string[];
}) {
  const base = highlight === "rose"
    ? "border-rose-500/20 bg-rose-500/10"
    : highlight === "amber"
    ? "border-amber-500/20 bg-amber-500/10"
    : highlight === "teal"
    ? "border-teal-500/20 bg-teal-500/10"
    : "border-zinc-700 bg-zinc-800/90";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${base}`}>
      <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        Layer {n}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-zinc-50">{label}</span>
        {badge && (
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${ACTION_COLORS[badge as PolicyAction]}`}>
            {badge}
          </span>
        )}
        {tags && tags.map((t) => (
          <span key={t} className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300">
            {t}
          </span>
        ))}
      </div>
      <p className={`mt-1 text-xs leading-5 ${mono ? "font-mono text-zinc-300 break-all" : "text-zinc-300"}`}>
        {detail}
      </p>
    </div>
  );
}
