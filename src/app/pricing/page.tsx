import {
  GlassCard,
  PageHero,
  PageSection,
  SiteChrome,
} from "@/components/promptrak/primitives";
import { pricingTiers } from "@/lib/promptrak-content";

export default function PricingPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Pricing"
        title="Serious pricing for enterprise buyers."
        description="Keep the story simple: Pilot for controlled deployment, Enterprise for full privacy gateway coverage."
      />

      <PageSection
        eyebrow="Plans"
        title="Contact-sales first, enterprise-ready."
        description="The page avoids consumer SaaS clutter and focuses on deployment shape."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {pricingTiers.map((tier) => (
            <GlassCard key={tier.name} className="space-y-5">
              <div>
                <div className="font-heading text-3xl font-semibold tracking-tight text-zinc-50">
                  {tier.name}
                </div>
                <div className="mt-2 text-xl text-zinc-300">{tier.price}</div>
              </div>
              <p className="text-sm leading-6 text-zinc-400">{tier.description}</p>
              <div className="space-y-3">
                {tier.bullets.map((bullet) => (
                  <div key={bullet} className="rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-300">
                    {bullet}
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </PageSection>
    </SiteChrome>
  );
}
