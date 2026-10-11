import type { Note } from "@/types/note";

export type CandidateStatus =
  | "received"
  | "in_progress"
  | "selected"
  | "discarded";

export type CandidateStage =
  | "pending"
  | "review"
  | "personal_interview"
  | "technical_interview"
  | "offer_presented";

export interface RecordOut {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: CandidateStatus;
  stage: CandidateStage;
  experience_years: number;
  notes_count: number;
  applied_at: string;
  updated_at: string;
  notes?: Note[];
}

export type Candidate = RecordOut;

export interface CandidateInput {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url?: string | null;
  cv_url?: string | null;
  experience_years: number;
}

export interface CandidatePatch {
  status?: CandidateStatus;
  stage?: CandidateStage;
}

export interface ListFilters {
  status?: CandidateStatus;
  stage?: CandidateStage;
  search?: string;
}