"use client";

import Link from "next/link";
import { StatusStageControls } from "@/components/candidates/StatusStageControls";
import { StageBadge } from "@/components/candidates/StageBadge";
import { StatusBadge } from "@/components/candidates/StatusBadge";
import { NotesSection } from "@/components/notes/NotesSection";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatDate, formatExperience } from "@/lib/format";
import { useCandidate } from "@/hooks/useCandidate";
import type { ReactNode } from "react";

interface CandidateDetailProps {
  id: string;
  returnTo: string;
}

const backLinkClassName =
  "inline-flex min-h-10 items-center rounded-sm border border-line bg-surface px-4 text-sm font-semibold text-foreground hover:bg-brasa-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600";

export function CandidateDetail({ id, returnTo }: CandidateDetailProps) {
  const { candidate, loading, error, refetch, setCandidate } = useCandidate(id);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
        <Link href={returnTo} className={backLinkClassName}>
          ← Volver al listado
        </Link>
        <div className="mt-8"><LoadingState /></div>
      </main>
    );
  }

  if (error?.status === 404) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
        <h1 className="font-display text-3xl font-bold text-foreground">
          No encontramos esta candidatura
        </h1>
        <Link href={returnTo} className={`${backLinkClassName} mt-6`}>
          Volver al listado
        </Link>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
        <Link href={returnTo} className={backLinkClassName}>
          ← Volver al listado
        </Link>
        <div className="mt-8">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      </main>
    );
  }

  if (!candidate) return null;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={returnTo} className={backLinkClassName}>
          ← Volver al listado
        </Link>
        <Link
          href={`/candidates/${encodeURIComponent(candidate.id)}/edit`}
          className="inline-flex min-h-10 items-center rounded-sm bg-brasa-700 px-4 text-sm font-semibold text-white hover:bg-brasa-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600 focus-visible:ring-offset-2"
        >
          Editar
        </Link>
      </div>

      <header className="mt-8 border-b border-line pb-6">
        <p className="text-sm font-semibold text-brasa-700">Talent Pipeline</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
          {candidate.full_name}
        </h1>
        <p className="mt-2 text-muted">{candidate.position}</p>
      </header>

      <section className="border-b border-line py-6" aria-label="Estado de la candidatura">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Estado y etapa
        </h2>
        <div className="mb-4 flex flex-wrap gap-2">
          <StatusBadge status={candidate.status} />
          <StageBadge stage={candidate.stage} />
        </div>
        <StatusStageControls candidate={candidate} setCandidate={setCandidate} />
      </section>

      <dl className="grid gap-x-10 sm:grid-cols-2">
        <DetailField label="ID" value={<span className="break-all">{candidate.id}</span>} />
        <DetailField
          label="Correo electrónico"
          value={<a className="text-brasa-800 underline" href={`mailto:${candidate.email}`}>{candidate.email}</a>}
        />
        <DetailField
          label="Teléfono"
          value={<a className="text-brasa-800 underline" href={`tel:${candidate.phone.replace(/[^\d+]/g, "")}`}>{candidate.phone}</a>}
        />
        <DetailField label="Puesto" value={candidate.position} />
        <DetailField
          label="LinkedIn"
          value={candidate.linkedin_url ? (
            <a className="break-all text-brasa-800 underline" href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">
              Ver perfil
            </a>
          ) : "No registrado"}
        />
        <DetailField
          label="CV"
          value={candidate.cv_url ? (
            <a className="break-all text-brasa-800 underline" href={candidate.cv_url} target="_blank" rel="noopener noreferrer">
              Ver CV
            </a>
          ) : "No registrado"}
        />
        <DetailField label="Experiencia" value={formatExperience(candidate.experience_years)} />
        <DetailField
          label="Fecha de aplicación"
          value={formatDate(candidate.applied_at)}
        />
        <DetailField
          label="Última actualización"
          value={formatDate(candidate.updated_at)}
        />
        <DetailField
          label="Notas"
          value={`${candidate.notes_count} ${candidate.notes_count === 1 ? "nota" : "notas"}`}
        />
      </dl>

      <NotesSection
        candidateId={candidate.id}
        onCountChange={(delta) =>
          setCandidate((current) =>
            current
              ? { ...current, notes_count: Math.max(0, current.notes_count + delta) }
              : current,
          )
        }
      />
    </main>
  );
}

interface DetailFieldProps {
  label: string;
  value: ReactNode;
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="border-b border-line py-4">
      <dt className="text-xs font-semibold uppercase text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}