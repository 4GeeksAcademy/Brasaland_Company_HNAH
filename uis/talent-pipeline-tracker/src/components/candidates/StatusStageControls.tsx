"use client";

import { useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { ErrorState } from "@/components/ui/ErrorState";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { patchCandidate } from "@/services/candidates.service";
import type {
  Candidate,
  CandidateStage,
  CandidateStatus,
} from "@/types/candidate";
import type { Dispatch, SetStateAction } from "react";

type CandidateChange =
  | { field: "status"; value: CandidateStatus }
  | { field: "stage"; value: CandidateStage };

interface FailedChange {
  change: CandidateChange;
  message: string;
}

interface StatusStageControlsProps {
  candidate: Candidate;
  setCandidate: Dispatch<SetStateAction<Candidate | null>>;
}

const selectClassName =
  "mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 text-sm text-foreground focus:border-brasa-600 focus:outline-none focus:ring-2 focus:ring-brasa-600/20 disabled:cursor-wait disabled:opacity-60";

function applyChange(candidate: Candidate, change: CandidateChange): Candidate {
  if (change.field === "status") {
    return { ...candidate, status: change.value };
  }

  return { ...candidate, stage: change.value };
}

export function StatusStageControls({
  candidate,
  setCandidate,
}: StatusStageControlsProps) {
  const [pending, setPending] = useState({ status: false, stage: false });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [failedChange, setFailedChange] = useState<FailedChange | null>(null);
  const pendingRef = useRef({ status: false, stage: false });
  const versions = useRef({ status: 0, stage: 0 });
  const mutationSequence = useRef(0);
  const latestAppliedSequence = useRef(0);

  const saveChange = async (change: CandidateChange) => {
    if (pendingRef.current[change.field]) return;

    const requestVersion = ++versions.current[change.field];
    const requestSequence = ++mutationSequence.current;
    const previousChange: CandidateChange =
      change.field === "status"
        ? { field: "status", value: candidate.status }
        : { field: "stage", value: candidate.stage };

    pendingRef.current[change.field] = true;
    setPending((current) => ({ ...current, [change.field]: true }));
    setFeedback(null);
    setFailedChange(null);
    setCandidate((current) => current && applyChange(current, change));

    try {
      const updated = await patchCandidate(
        candidate.id,
        change.field === "status"
          ? { status: change.value }
          : { stage: change.value },
      );

      if (versions.current[change.field] !== requestVersion) return;

      latestAppliedSequence.current = Math.max(
        latestAppliedSequence.current,
        requestSequence,
      );
      setCandidate((current) => {
        if (!current) return updated;

        return {
          ...current,
          status: change.field === "status" ? updated.status : current.status,
          stage: change.field === "stage" ? updated.stage : current.stage,
          updated_at:
            requestSequence === latestAppliedSequence.current
              ? updated.updated_at
              : current.updated_at,
        };
      });

      const successMessage =
        change.field === "status"
          ? `Estado actualizado a ${STATUS_LABELS[change.value]}`
          : `Etapa actualizada a ${STAGE_LABELS[change.value]}`;
      setFeedback(successMessage);
    } catch (cause) {
      if (versions.current[change.field] !== requestVersion) return;

      setCandidate((current) => current && applyChange(current, previousChange));
      const message =
        cause instanceof Error
          ? cause.message
          : "No se pudo actualizar la candidatura.";
      setFailedChange({ change, message });
    } finally {
      if (versions.current[change.field] === requestVersion) {
        pendingRef.current[change.field] = false;
        setPending((current) => ({ ...current, [change.field]: false }));
      }
    }
  };

  const retryFailedChange = () => {
    if (failedChange) void saveChange(failedChange.change);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-foreground">
          Estado
          {pending.status ? (
            <span role="status" className="ml-2 text-xs font-normal text-muted">
              Guardando…
            </span>
          ) : null}
          <select
            className={selectClassName}
            value={candidate.status}
            disabled={pending.status}
            onChange={(event) =>
              void saveChange({
                field: "status",
                value: event.currentTarget.value as CandidateStatus,
              })
            }
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-foreground">
          Etapa
          {pending.stage ? (
            <span role="status" className="ml-2 text-xs font-normal text-muted">
              Guardando…
            </span>
          ) : null}
          <select
            className={selectClassName}
            value={candidate.stage}
            disabled={pending.stage}
            onChange={(event) =>
              void saveChange({
                field: "stage",
                value: event.currentTarget.value as CandidateStage,
              })
            }
          >
            {Object.entries(STAGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {failedChange ? (
        <ErrorState message={failedChange.message} onRetry={retryFailedChange} />
      ) : feedback ? (
        <Alert variant="success" message={feedback} />
      ) : null}
    </div>
  );
}