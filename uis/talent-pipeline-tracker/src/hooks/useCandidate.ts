"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { getCandidateById } from "@/services/candidates.service";
import type { Candidate } from "@/types/candidate";

type CandidateLoadState =
  | { requestKey: string | null; status: "loading"; error: null }
  | { requestKey: string; status: "success"; error: null }
  | { requestKey: string; status: "error"; error: ApiError };

export function useCandidate(id: string) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [state, setState] = useState<CandidateLoadState>({
    requestKey: null,
    status: "loading",
    error: null,
  });
  const [requestVersion, setRequestVersion] = useState(0);
  const requestKey = `${id}:${requestVersion}`;

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadCandidate = async () => {
      try {
        const result = await getCandidateById(id, controller.signal);
        if (controller.signal.aborted) return;
        setCandidate(result);
        setState({ requestKey, status: "success", error: null });
      } catch (cause) {
        if (
          controller.signal.aborted ||
          (cause instanceof Error && cause.name === "AbortError")
        ) {
          return;
        }

        const error =
          cause instanceof ApiError
            ? cause
            : new ApiError(0, "No se pudo conectar con el servidor");
        setState({ requestKey, status: "error", error });
      }
    };

    void loadCandidate();
    return () => controller.abort();
  }, [id, requestKey]);

  const isCurrentRequest = state.requestKey === requestKey;

  return {
    candidate,
    loading: !isCurrentRequest || state.status === "loading",
    error: isCurrentRequest && state.status === "error" ? state.error : null,
    refetch,
    setCandidate,
  };
}