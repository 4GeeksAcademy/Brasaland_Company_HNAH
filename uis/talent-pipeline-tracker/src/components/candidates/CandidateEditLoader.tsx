"use client";

import Link from "next/link";
import { CandidateForm } from "@/components/candidates/CandidateForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useCandidate } from "@/hooks/useCandidate";

interface CandidateEditLoaderProps {
  id: string;
}

export function CandidateEditLoader({ id }: CandidateEditLoaderProps) {
  const { candidate, loading, error, refetch } = useCandidate(id);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
        <p className="text-sm font-semibold text-brasa-700">Talent Pipeline</p>
        <h1 className="mb-7 mt-2 border-b border-line pb-6 font-display text-3xl font-bold text-foreground">
          Editar candidatura
        </h1>
        <LoadingState />
      </main>
    );
  }

  if (error?.status === 404) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
        <h1 className="font-display text-3xl font-bold text-foreground">
          No encontramos esta candidatura
        </h1>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-10 items-center rounded-sm border border-line bg-surface px-4 text-sm font-semibold text-foreground hover:bg-brasa-50"
        >
          Volver al listado
        </Link>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
        <ErrorState message={error.message} onRetry={refetch} />
        <Link
          href={`/candidates/${encodeURIComponent(id)}`}
          className="mt-6 inline-flex min-h-10 items-center rounded-sm border border-line bg-surface px-4 text-sm font-semibold text-foreground hover:bg-brasa-50"
        >
          Cancelar
        </Link>
      </main>
    );
  }

  if (!candidate) return null;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
      <p className="text-sm font-semibold text-brasa-700">Talent Pipeline</p>
      <h1 className="mb-7 mt-2 border-b border-line pb-6 font-display text-3xl font-bold text-foreground">
        Editar candidatura
      </h1>
      <CandidateForm key={candidate.id} mode="edit" candidate={candidate} />
    </main>
  );
}