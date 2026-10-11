import { STAGE_LABELS } from "@/lib/constants";
import type { CandidateStage } from "@/types/candidate";

interface StageBadgeProps {
  stage: CandidateStage;
}

export function StageBadge({ stage }: StageBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-sm border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-foreground">
      {STAGE_LABELS[stage]}
    </span>
  );
}