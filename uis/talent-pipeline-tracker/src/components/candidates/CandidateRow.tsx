import Link from "next/link";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Candidate } from "@/types/candidate";
import { StageBadge } from "@/components/candidates/StageBadge";
import { StatusBadge } from "@/components/candidates/StatusBadge";

interface CandidateRowProps {
  candidate: Candidate;
}

export function CandidateRow({ candidate }: CandidateRowProps) {
  const href = `/candidates/${encodeURIComponent(candidate.id)}`;
  const accessibleLabel = `${candidate.full_name}, ${candidate.position}, estado actual ${STATUS_LABELS[candidate.status]}, etapa actual ${STAGE_LABELS[candidate.stage]}`;

  return (
    <tr className="group border-b border-line last:border-b-0 hover:bg-brasa-50/70">
      <td className="px-4 py-4 align-middle">
        <Link
          href={href}
          aria-label={accessibleLabel}
          className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600"
        >
          <span className="font-semibold text-foreground group-hover:text-brasa-800">
            {candidate.full_name}
          </span>
          <span className="mt-1 block text-sm text-muted">{candidate.position}</span>
          {candidate.email ? (
            <span className="mt-1 block text-xs text-muted">{candidate.email}</span>
          ) : null}
          <span className="mt-1 block text-xs text-muted">
            Aplicó el {formatDate(candidate.applied_at)}
          </span>
        </Link>
      </td>
      <td className="px-4 py-4 align-middle">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="block rounded-sm">
          <StatusBadge status={candidate.status} />
        </Link>
      </td>
      <td className="px-4 py-4 align-middle">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="block rounded-sm">
          <StageBadge stage={candidate.stage} />
        </Link>
      </td>
    </tr>
  );
}