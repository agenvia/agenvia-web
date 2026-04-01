import { notFound } from "next/navigation";

import {
  DrawerPanel,
  GlassCard,
  PageHero,
  PageSection,
  SiteChrome,
} from "@/components/promptrak/primitives";
import { useCases } from "@/lib/promptrak-content";

export function generateStaticParams() {
  return useCases.map((item) => ({ slug: item.slug }));
}

export default function UseCaseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const useCase = useCases.find((item) => item.slug === params.slug);

  if (!useCase) {
    notFound();
  }

  return (
    <SiteChrome>
      <PageHero
        eyebrow="Use Case"
        title={useCase.title}
        description={useCase.fit}
      />

      <PageSection
        eyebrow="Workflow"
        title="Before and after the gateway."
        description="Each use-case page pairs real workflow pain with safer prompt handling and a business outcome."
      >
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <GlassCard>
              <div className="font-heading text-xl font-semibold tracking-tight text-zinc-50">
                Workflow Pain
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{useCase.workflowPain}</p>
            </GlassCard>
            <GlassCard>
              <div className="font-heading text-xl font-semibold tracking-tight text-zinc-50">
                Before
              </div>
              <p className="mt-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200">
                {useCase.before}
              </p>
            </GlassCard>
            <GlassCard>
              <div className="font-heading text-xl font-semibold tracking-tight text-zinc-50">
                After
              </div>
              <p className="mt-3 rounded-2xl border border-teal-500/20 bg-teal-500/10 p-4 text-sm leading-6 text-teal-200">
                {useCase.after}
              </p>
            </GlassCard>
          </div>
          <div className="space-y-4">
            <DrawerPanel title="How Agenvia Fits">
              <p>{useCase.fit}</p>
            </DrawerPanel>
            <DrawerPanel title="Compliance / Audit Angle">
              <p>{useCase.compliance}</p>
            </DrawerPanel>
            <DrawerPanel title="ROI">
              <p>{useCase.roi}</p>
            </DrawerPanel>
          </div>
        </div>
      </PageSection>
    </SiteChrome>
  );
}
