"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { getCandidates } from "@/services/candidates.service";
import type { Candidate, ListFilters } from "@/types/candidate";

type CandidatesState =
  | { requestKey: string | null; status: "loading"; candidates: Candidate[] }
  | { requestKey: string; status: "success"; candidates: Candidate[] }
  | {
      requestKey: string;
      status: "error";
      candidates: Candidate[];
      message: string;
    };

interface UseCandidatesResult {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCandidates(filters: ListFilters): UseCandidatesResult {
  const { status, stage, search } = filters;
  const [state, setState] = useState<CandidatesState>({
    requestKey: null,
    status: "loading",
    candidates: [],
  });
  const [requestVersion, setRequestVersion] = useState(0);
  const requestKey = JSON.stringify([status, stage, search, requestVersion]);

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadCandidates = async () => {
      try {
        const candidates = await getCandidates(
          { status, stage, search },
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setState({ requestKey, status: "success", candidates });
        }
      } catch (cause) {
        if (
          controller.signal.aborted ||
          (cause instanceof Error && cause.name === "AbortError")
        ) {
          return;
        }

        const message =
          cause instanceof ApiError
            ? cause.message
            : "No se pudieron cargar las candidaturas.";
        setState((previous) => ({
          requestKey,
          status: "error",
          candidates: previous.candidates,
          message,
        }));
      }
    };

    void loadCandidates();

    return () => controller.abort();
  }, [requestKey, search, stage, status]);

  const isCurrentRequest = state.requestKey === requestKey;

  return {
    candidates: state.candidates,
    loading: !isCurrentRequest || state.status === "loading",
    error:
      isCurrentRequest && state.status === "error" ? state.message : null,
    refetch,
  };
}