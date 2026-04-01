import {
  PageHero,
  PageSection,
  SiteChrome,
} from "@/components/promptrak/primitives";
import { listPatterns } from "@/lib/api/patterns";
import type { FLPattern, PatternStats } from "@/lib/api/types";
import PatternTable from "./pattern-table";

export default async function PatternRepositoryPage() {
  let patterns: FLPattern[] = [];
  let stats: PatternStats = { promoted: 0, candidate: 0, retired: 0, shadow_rejected: 0 };

  try {
    const data = await listPatterns();
    patterns = data.patterns ?? [];
    stats = data.stats ?? stats;
  } catch {
    // Backend unreachable
  }

  return (
    <SiteChrome>
      <PageHero
        eyebrow="Pattern Repository"
        title="Learned intelligence, made visible."
        description="Live FL patterns from the backend — promoted, candidate, shadow rejected, and retired. Use the filter bar to inspect each state."
      />

      <PageSection
        eyebrow="Repository"
        title="A privacy pattern table that feels premium."
        description="Each row shows the real pattern regex, label, confidence, votes, and tenant count pulled from the live database."
      >
        <PatternTable initialPatterns={patterns} initialStats={stats} />
      </PageSection>
    </SiteChrome>
  );
}
