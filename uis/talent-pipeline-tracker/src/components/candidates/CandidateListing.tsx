"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CandidateFilters } from "@/components/candidates/CandidateFilters";
import { CandidateList } from "@/components/candidates/CandidateList";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { isCandidateStage, isCandidateStatus } from "@/lib/constants";
import { useCandidates } from "@/hooks/useCandidates";

export function CandidateListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusValue = searchParams.get("status");
  const stageValue = searchParams.get("stage");
  const status = isCandidateStatus(statusValue) ? statusValue : undefined;
  const stage = isCandidateStage(stageValue) ? stageValue : undefined;
  const search = searchParams.get("search")?.trim() || undefined;
  const { candidates, loading, error, refetch } = useCandidates({
    status,
    stage,
    search,
  });

  const updateFilter = useCallback(
    (key: "status" | "stage" | "search", value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);

      const query = params.toString();
      router.push(query ? `/?${query}` : "/", { scroll: false });
    },
    [router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push("/", { scroll: false });
  }, [router]);

  const hasActiveFilters = Boolean(status || stage || search);
  const hasCandidates = candidates.length > 0;
  const query = searchParams.toString();
  const returnTo = query ? `/?${query}` : "/";

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
      <header className="flex flex-col justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brasa-700">Talent Pipeline</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
            Candidaturas
          </h1>
          <p className="mt-2 text-sm text-muted" aria-live="polite">
            {candidates.length} {candidates.length === 1 ? "candidatura" : "candidaturas"}
          </p>
        </div>
        <Link
          href="/candidates/new"
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-brasa-700 px-4 text-sm font-semibold text-white hover:bg-brasa-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600 focus-visible:ring-offset-2"
        >
          Nueva candidatura
        </Link>
      </header>

      <CandidateFilters
        status={status}
        stage={stage}
        search={search}
        hasActiveFilters={hasActiveFilters}
        onStatusChange={(value) => updateFilter("status", value)}
        onStageChange={(value) => updateFilter("stage", value)}
        onSearchChange={(value) => updateFilter("search", value)}
        onClear={clearFilters}
      />

      <section aria-label="Listado de candidaturas" aria-busy={loading}>
        {loading && !hasCandidates ? <LoadingState /> : null}
        {loading && hasCandidates ? (
          <p role="status" className="mb-4 text-sm font-medium text-muted">
            Actualizando…
          </p>
        ) : null}
        {error ? <ErrorState message={error} onRetry={refetch} /> : null}
        {!loading && !error && !hasCandidates ? (
          <EmptyState
            message="No hay candidaturas que coincidan con los filtros"
            action={hasActiveFilters ? { label: "Limpiar filtros", onClick: clearFilters } : undefined}
          />
        ) : null}
        {hasCandidates ? (
          <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <CandidateList candidates={candidates} returnTo={returnTo} />
          </div>
        ) : null}
      </section>
    </main>
  );
}