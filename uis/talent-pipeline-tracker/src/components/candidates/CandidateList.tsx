import Link from "next/link";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Candidate } from "@/types/candidate";
import { StageBadge } from "@/components/candidates/StageBadge";
import { StatusBadge } from "@/components/candidates/StatusBadge";
import { CandidateRow } from "@/components/candidates/CandidateRow";

interface CandidateListProps {
  candidates: Candidate[];
}

export function CandidateList({ candidates }: CandidateListProps) {
  return (
    <>
      <div className="hidden overflow-x-auto border-y border-line bg-surface md:block">
        <table className="w-full border-collapse text-left">
          <thead className="bg-brasa-50 text-xs font-semibold uppercase text-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Candidatura</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3">Etapa</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <CandidateRow key={candidate.id} candidate={candidate} />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {candidates.map((candidate) => {
          const href = `/candidates/${encodeURIComponent(candidate.id)}`;
          const accessibleLabel = `${candidate.full_name}, ${candidate.position}, estado actual ${STATUS_LABELS[candidate.status]}, etapa actual ${STAGE_LABELS[candidate.stage]}`;

          return (
            <li key={candidate.id}>
              <Link
                href={href}
                aria-label={accessibleLabel}
                className="block border border-line bg-surface p-4 shadow-sm transition-colors hover:border-brasa-300 hover:bg-brasa-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600"
              >
                <span className="block font-semibold text-foreground">
                  {candidate.full_name}
                </span>
                <span className="mt-1 block text-sm text-muted">
                  {candidate.position}
                </span>
                {candidate.email ? (
                  <span className="mt-1 block text-sm text-muted">{candidate.email}</span>
                ) : null}
                <span className="mt-1 block text-xs text-muted">
                  Aplicó el {formatDate(candidate.applied_at)}
                </span>
                <span className="mt-4 flex flex-wrap items-center gap-2">
                  <StatusBadge status={candidate.status} />
                  <StageBadge stage={candidate.stage} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}