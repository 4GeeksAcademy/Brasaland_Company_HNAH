import { STATUS_BADGE_VARIANTS, STATUS_LABELS } from "@/lib/constants";
import type { CandidateStatus } from "@/types/candidate";

interface StatusBadgeProps {
  status: CandidateStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_VARIANTS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}