"use client";

import {
  FeatureCard,
  PageHero,
  PageSection,
  SiteChrome,
} from "@/components/promptrak/primitives";
import { trustPrinciples } from "@/lib/promptrak-content";

export default function TrustPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="About / Trust"
        title="Enterprise AI is moving faster than its security."
        description="DLP tools were built for files, not prompts. They redact text but ignore who is asking, what action they intend, or whether an agent tool call should be allowed. Agenvia closes that gap with a platform built specifically for LLM-era security."
      />

      <PageSection
        eyebrow="Our Approach"
        title="Six principles. All enforced at runtime."
        description="Trust is not a marketing claim — it is a set of runtime decisions made on every request, logged in full, and improvable across tenants without centralizing sensitive data."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trustPrinciples.map((principle) => (
            <FeatureCard key={principle.title} {...principle} />
          ))}
        </div>
      </PageSection>
    </SiteChrome>
  );
}
