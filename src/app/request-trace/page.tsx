"use client";
import { useEffect, useState } from "react";
import {
  DrawerPanel,
  GlassCard,
  PageHero,
  PageSection,
  SiteChrome,
} from "@/components/promptrak/primitives";
import type { GatewayPromptResponse } from "@/lib/api/types";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium", timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function RequestTracePage() {
  const [result, setResult] = useState<GatewayPromptResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("lastGatewayResult");
    if (stored) {
      try { setResult(JSON.parse(stored) as GatewayPromptResponse); } catch { /* ignore */ }
    }
  }, []);

  const traceCards = result
    ? [
        ["Original Findings", result.findings.length > 0
          ? result.findings.map((f) => `[${f.label.toUpperCase()}] "${f.text}" (confidence: ${(f.confidence * 100).toFixed(0)}%)`).join("\n")
          : "No sensitive entities detected."],
        ["Policy Reasoning", result.policy_reasons.length > 0
          ? result.policy_reasons.join("\n")
          : `Action: ${result.action} · Risk: ${result.risk_level} · Score: ${result.risk_score.toFixed(2)}`],
        ["Sanitized Prompt", result.sanitized_prompt || "(not sanitized — prompt was allowed or blocked)"],
        ["Outbound Prompt to LLM", result.outbound_prompt || "(same as sanitized or blocked)"],
        ["Model Output", result.model_response || "(no response — prompt was blocked)"],
        ["Output Guard Verdict", result.output_blocked
          ? `Blocked. Leakage detected: ${result.output_findings.join(", ")}`
          : "Allowed — no output leakage detected."],
      ]
    : [
        ["Original Prompt", "No recent gateway request found. Submit a prompt on the Live Demo page first."],
        ["Findings",          "—"],
        ["Policy Reasoning",  "—"],
        ["Transformed Prompt","—"],
        ["Model Output",      "—"],
        ["Output Guard Verdict", "—"],
      ];

  return (
    <SiteChrome>
      <PageHero
        eyebrow="Request Trace"
        title="Make every prompt explainable."
        description="Full forensic audit of the most recent gateway request — findings, policy reasoning, transformations, output handling, and audit metadata."
      />

      <PageSection
        eyebrow="Trace Detail"
        title="Content journey on the left, trust metadata on the right."
        description={result ? `Showing trace for request ${result.request_id}` : "Submit a prompt on the Live Demo page to see a live trace here."}
      >
        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-4">
            {traceCards.map(([title, body]) => (
              <GlassCard key={title}>
                <div className="font-heading text-xl font-semibold tracking-tight text-zinc-50">
                  {title}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-400">{body}</p>
              </GlassCard>
            ))}
          </div>

          <div className="space-y-4">
            <DrawerPanel title="Request Metadata">
              <p>Request ID: <code className="text-xs">{result?.request_id ?? "—"}</code></p>
              <p>Tenant: {result?.tenant_id ?? "—"}</p>
              <p>Actor: {result?.actor_id ?? "—"}</p>
              <p>Created: {result?.created_at ? formatDate(result.created_at) : "—"}</p>
            </DrawerPanel>
            <DrawerPanel title="Trust Metadata">
              <p>Action: <strong>{result?.action ?? "—"}</strong></p>
              <p>Recommended route: <strong>{result?.recommended_route ?? "—"}</strong></p>
              <p>Risk level: <strong>{result?.risk_level ?? "—"}</strong></p>
              <p>Risk score: <strong>{result?.risk_score?.toFixed(2) ?? "—"}</strong></p>
              <p>Exposure: <strong>{result?.exposure_risk ?? "—"}</strong></p>
              <p>Model route: <code className="text-xs">{result?.model_route || "—"}</code></p>
              <p>Policy version: <code className="text-xs">{result?.policy_version ?? "—"}</code></p>
            </DrawerPanel>
            <DrawerPanel title="Audit Trail Footer">
              <p>Transformations were deterministic and versioned.</p>
              {result?.output_blocked ? (
                <p className="mt-2 text-rose-600 text-sm font-medium">Output was blocked by the leakage guard.</p>
              ) : (
                <p className="mt-2 text-teal-600 text-sm">Output passed the leakage guard.</p>
              )}
              <a href="/live-demo" className="mt-3 inline-block text-xs text-teal-600 underline hover:text-teal-800">
                ← Back to Live Demo
              </a>
            </DrawerPanel>
          </div>
        </div>
      </PageSection>
    </SiteChrome>
  );
}
