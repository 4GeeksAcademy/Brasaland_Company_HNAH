import type { CandidateStage, CandidateStatus } from "@/types/candidate";

export const CANDIDATE_STATUSES = [
  "received",
  "in_progress",
  "selected",
  "discarded",
] as const satisfies readonly CandidateStatus[];

export const CANDIDATE_STAGES = [
  "pending",
  "review",
  "personal_interview",
  "technical_interview",
  "offer_presented",
] as const satisfies readonly CandidateStage[];

export function isCandidateStatus(value: string | null): value is CandidateStatus {
  return value !== null && CANDIDATE_STATUSES.some((status) => status === value);
}

export function isCandidateStage(value: string | null): value is CandidateStage {
  return value !== null && CANDIDATE_STAGES.some((stage) => stage === value);
}

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  received: "Recibida",
  in_progress: "En proceso",
  selected: "Seleccionada",
  discarded: "Descartada",
};

export const STAGE_LABELS: Record<CandidateStage, string> = {
  pending: "Pendiente",
  review: "En revisión",
  personal_interview: "Entrevista personal",
  technical_interview: "Entrevista técnica",
  offer_presented: "Oferta presentada",
};

export const STATUS_BADGE_VARIANTS: Record<CandidateStatus, string> = {
  received: "bg-sky-100 text-sky-800",
  in_progress: "bg-amber-100 text-amber-900",
  selected: "bg-emerald-100 text-emerald-800",
  discarded: "bg-rose-100 text-rose-800",
};