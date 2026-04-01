import { placeholderAssets } from "@/lib/promptrak-placeholders";
import {
  PageHero,
  PageSection,
  PlaceholderPanel,
  SiteChrome,
} from "@/components/promptrak/primitives";
import LiveDemoClient from "./live-demo-client";

export default function LiveDemoPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Live Demo"
        title="Watch the gateway think."
        description="Enter any prompt containing sensitive data. Agenvia detects entities, routes risk, transforms the prompt, calls Gemini, and guards the output in one explainable flow."
        primaryCta={{ href: "/pricing", label: "Book Demo" }}
        secondaryCta={{ href: "/request-trace", label: "Open Trace Detail" }}
        aside={<PlaceholderPanel asset={placeholderAssets.liveFlowReplay} />}
      />

      <PageSection
        eyebrow="Live Gateway"
        title="Three-panel live processing layout."
        description="Left shows the raw input and detected entities. Centre shows each processing stage. Right shows the final LLM response and protection summary."
      >
        <LiveDemoClient />
      </PageSection>
    </SiteChrome>
  );
}
