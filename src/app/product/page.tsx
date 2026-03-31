"use client";

import {
  FeatureCard,
  PageHero,
  PageSection,
  PlaceholderPanel,
  SiteChrome,
  Timeline,
} from "@/components/agenvia/primitives";
import {
  architectureLayers,
  featureBlocks,
  requestTimeline,
} from "@/lib/agenvia-content";
import { placeholderAssets } from "@/lib/agenvia-placeholders";

export default function ProductPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Product Overview"
        title="A 9-layer security platform for enterprise AI."
        description="Agenvia sits between your tools and every LLM. It enforces identity-aware access, detects threats in multiple languages, governs agent tool calls, and improves privacy intelligence through federated learning — in one deployable layer."
        secondaryCta={{ href: "/live-demo", label: "See Live Flow" }}
        aside={<PlaceholderPanel asset={placeholderAssets.productArchitecture} />}
      />

      <PageSection
        eyebrow="Architecture"
        title="Layered by design. Composable by default."
        description="Each layer handles a distinct security concern — identity, detection, policy, transformation, agent governance, and learning. Add only the layers your deployment needs."
      >
        <div className="grid gap-4 md:grid-cols-5">
          {architectureLayers.map((item, index) => (
            <FeatureCard
              key={item}
              title={`Layer ${index + 1}`}
              body={item}
              icon={featureBlocks[index % featureBlocks.length].icon}
            />
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Core Capabilities"
        title="Six capabilities that go beyond redaction."
        description="From transformer-powered detection to differential privacy federated learning — each capability is production-deployed and benchmark-validated."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureBlocks.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="One Request"
        title="What happens to every request, step by step."
        description="From identity check to output delivery — five deterministic stages, each logged and auditable, with no sensitive data escaping the trust boundary."
      >
        <Timeline steps={requestTimeline} />
      </PageSection>
    </SiteChrome>
  );
}
