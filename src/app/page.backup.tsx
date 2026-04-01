"use client";

import Link from "next/link";

import { FlowVisual } from "@/components/promptrak/flow-visual";
import {
  ComparisonTable,
  FeatureCard,
  GlassCard,
  MetricCard,
  PageHero,
  PageSection,
  PlaceholderPanel,
  SiteChrome,
  UseCaseGrid,
} from "@/components/promptrak/primitives";
import {
  benchmarkMetrics,
  comparisonRows,
  homepageUseCases,
  howItWorks,
  trustBar,
} from "@/lib/promptrak-content";
import { placeholderAssets } from "@/lib/promptrak-placeholders";

export default function HomeBackup() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Enterprise AI Security Platform"
        title="Control every token before it reaches your LLM."
        description="Agenvia enforces identity-aware access control, detects sensitive data across languages, governs agent tools, and federates privacy intelligence - all in one active gateway layer."
        primaryCta={{ href: "/pricing", label: "Book Demo" }}
        secondaryCta={{ href: "/live-demo", label: "See Live Flow" }}
        aside={<FlowVisual />}
      />

      <section className="container pb-8">
        <div className="grid gap-4 md:grid-cols-4">
          {trustBar.map((item) => (
            <GlassCard key={item} className="py-5">
              <div className="text-sm font-medium text-zinc-300">{item}</div>
            </GlassCard>
          ))}
        </div>
      </section>

      <PageSection
        eyebrow="How It Works"
        title="Nine security layers. One composable gateway."
        description="Agenvia processes every request through identity verification, threat detection, policy decision, prompt transformation, and output inspection - before and after every model call."
      >
        <div className="grid gap-4 lg:grid-cols-5">
          {howItWorks.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Why It Wins"
        title="Not another generic redaction layer."
        description="Generic DLP tools redact text. Agenvia enforces who can do what, blocks attacks in five languages, governs agent tools, and makes privacy intelligence smarter with every request."
      >
        <ComparisonTable rows={comparisonRows} />
      </PageSection>

      <PageSection
        eyebrow="Benchmark Results"
        title="100% attack detection. 100% legitimate access. No compromise."
        description="Validated on 100 enterprise-grade scenarios spanning jailbreaks, cross-domain attacks, bulk exfiltration, multilingual injections, and authorized clinical, legal, and finance workflows."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {benchmarkMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
        <div className="mt-6">
          <PlaceholderPanel asset={placeholderAssets.benchmarkStrip} />
        </div>
      </PageSection>

      <PageSection
        eyebrow="Use Cases"
        title="Built for the teams already scaling AI inside the enterprise."
        description="Start with the workflows where privacy and explainability matter most."
      >
        <UseCaseGrid
          items={homepageUseCases.map((item) => ({
            ...item,
            href: `/use-cases/${item.label.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-") === "r-and-d" ? "rd-confidentiality-protection" : item.label.toLowerCase() === "hr" ? "hr-ai-safety" : item.label.toLowerCase() === "legal" ? "legal-ai-review" : item.label.toLowerCase() === "sales" ? "sales-enablement-with-privacy-controls" : "procurement-ai-copilot"}`,
          }))}
        />
      </PageSection>

      <section className="container pb-24">
        <GlassCard className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-zinc-50">
              Put a security layer between your enterprise and every LLM.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">
              Identity control, attack detection, agent governance, and privacy learning - deployed as one composable platform.
            </p>
          </div>
          <Link
            href="/pricing"
            className="rounded-full bg-teal-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-500"
          >
            Book Demo
          </Link>
        </GlassCard>
      </section>
    </SiteChrome>
  );
}
