"use client";

import Link from "next/link";

import {
  GlassCard,
  PageHero,
  PageSection,
  SiteChrome,
} from "@/components/promptrak/primitives";
import { useCases } from "@/lib/promptrak-content";

export default function UseCasesPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Use Cases"
        title="Enterprise workflows where privacy controls actually matter."
        description="Each page frames the workflow pain, before-and-after prompt handling, compliance angle, and ROI story buyers need."
      />

      <PageSection
        eyebrow="Customer Pages"
        title="Built for enterprise selling."
        description="One page each for the teams most likely to hit privacy friction first."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {useCases.map((item) => (
            <Link key={item.slug} href={`/use-cases/${item.slug}`}>
              <GlassCard className="h-full space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-teal-200">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="font-heading text-2xl font-semibold tracking-tight text-zinc-50">
                  {item.title}
                </div>
                <p className="text-sm leading-6 text-zinc-400">{item.workflowPain}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </PageSection>
    </SiteChrome>
  );
}
