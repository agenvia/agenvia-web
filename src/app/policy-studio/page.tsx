import {
  DrawerPanel,
  GlassCard,
  PageHero,
  PageSection,
  SiteChrome,
} from "@/components/promptrak/primitives";
import { policyCards } from "@/lib/promptrak-content";

export default function PolicyStudioPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Policy Studio"
        title="Powerful policy control without technical chaos."
        description="Readable rules, version history, and simulation make the policy layer feel enterprise-grade and approachable."
      />

      <PageSection
        eyebrow="Policy Builder"
        title="Three-pane control surface."
        description="Versions on the left, readable policy cards in the center, and a live simulation panel on the right."
      >
        <div className="grid gap-4 xl:grid-cols-[0.7fr_1.2fr_0.9fr]">
          <DrawerPanel title="Policy Versions">
            <p>`policy-v27.4` current</p>
            <p>`policy-v27.3` previous</p>
            <p>`policy-v26.9` archived</p>
          </DrawerPanel>
          <GlassCard className="grid gap-4 md:grid-cols-2">
            {policyCards.map((item) => (
              <div key={item} className="rounded-2xl border border-zinc-700 bg-zinc-800/90 p-5">
                <div className="font-heading text-lg font-semibold tracking-tight text-zinc-50">
                  {item}
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Human-readable policy card with exact matched-rule trace available in simulation.
                </p>
              </div>
            ))}
          </GlassCard>
          <DrawerPanel title="Simulation Panel">
            <p>Paste sample prompt: &quot;Summarize PROJECT_CODE_DELTA for external release.&quot;</p>
            <p>Predicted route: minimize + output guard</p>
            <p>Matched rule trace: external release protection + strategic context suppression</p>
          </DrawerPanel>
        </div>
      </PageSection>
    </SiteChrome>
  );
}
