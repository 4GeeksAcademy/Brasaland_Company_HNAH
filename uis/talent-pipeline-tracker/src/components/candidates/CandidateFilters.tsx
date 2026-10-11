"use client";

import { useEffect, useState } from "react";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { CandidateStage, CandidateStatus } from "@/types/candidate";

interface CandidateFiltersProps {
  status?: CandidateStatus;
  stage?: CandidateStage;
  search?: string;
  hasActiveFilters: boolean;
  onStatusChange: (status?: CandidateStatus) => void;
  onStageChange: (stage?: CandidateStage) => void;
  onSearchChange: (search?: string) => void;
  onClear: () => void;
}

const controlClassName =
  "min-h-11 w-full rounded-sm border border-line bg-surface px-3 text-sm text-foreground shadow-sm focus:border-brasa-600 focus:outline-none focus:ring-2 focus:ring-brasa-600/20";

export function CandidateFilters({
  status,
  stage,
  search,
  hasActiveFilters,
  onStatusChange,
  onStageChange,
  onSearchChange,
  onClear,
}: CandidateFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(search ?? "");

  useEffect(() => {
    const syncSearchFromUrl = () => {
      setSearchDraft(new URLSearchParams(window.location.search).get("search") ?? "");
    };

    window.addEventListener("popstate", syncSearchFromUrl);
    return () => window.removeEventListener("popstate", syncSearchFromUrl);
  }, []);

  useEffect(() => {
    const normalizedSearch = searchDraft.trim();
    if (normalizedSearch === (search ?? "")) return;

    const timeoutId = window.setTimeout(() => {
      onSearchChange(normalizedSearch || undefined);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [onSearchChange, search, searchDraft]);

  const clearFilters = () => {
    setSearchDraft("");
    onClear();
  };

  return (
    <div className="mb-7 flex flex-col gap-4 border-y border-line bg-surface px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="flex min-w-44 flex-1 flex-col gap-1.5 text-sm font-semibold text-foreground">
        Estado
        <select
          className={controlClassName}
          value={status ?? ""}
          onChange={(event) =>
            onStatusChange((event.currentTarget.value || undefined) as CandidateStatus | undefined)
          }
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      <label className="flex min-w-48 flex-1 flex-col gap-1.5 text-sm font-semibold text-foreground">
        Etapa
        <select
          className={controlClassName}
          value={stage ?? ""}
          onChange={(event) =>
            onStageChange((event.currentTarget.value || undefined) as CandidateStage | undefined)
          }
        >
          <option value="">Todas las etapas</option>
          {Object.entries(STAGE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      <label className="flex min-w-56 flex-[2] flex-col gap-1.5 text-sm font-semibold text-foreground">
        Búsqueda
        <input
          className={controlClassName}
          type="search"
          placeholder="Buscar por nombre o email"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.currentTarget.value)}
        />
      </label>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={clearFilters}
          className="min-h-11 shrink-0 rounded-sm border border-line px-4 text-sm font-semibold text-foreground hover:bg-brasa-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600"
        >
          Limpiar filtros
        </button>
      ) : null}
    </div>
  );
}