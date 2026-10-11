import { request } from "@/lib/api-client";
import type {
  Candidate,
  CandidateInput,
  CandidatePatch,
  ListFilters,
} from "@/types/candidate";
import type { PaginatedResponse } from "@/types/api";

type CandidateListResponse = Candidate[] | PaginatedResponse<Candidate>;

const PAGE_SIZE = 1000;

function buildListQuery(filters: ListFilters, page: number): string {
  const params = new URLSearchParams();
  params.set("limit", String(PAGE_SIZE));
  params.set("page", String(page));

  if (filters.status) params.set("status", filters.status);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.search?.trim()) params.set("search", filters.search.trim());

  return params.toString();
}

export async function getCandidates(
  filters: ListFilters = {},
  signal?: AbortSignal,
): Promise<Candidate[]> {
  const candidates: Candidate[] = [];
  let page = 1;

  while (true) {
    const query = buildListQuery(filters, page);
    const response = await request<CandidateListResponse>(
      `/records?${query}`,
      { signal },
    );

    if (Array.isArray(response)) return response;

    candidates.push(...response.data);
    if (
      candidates.length >= response.total ||
      response.data.length === 0 ||
      response.data.length < response.limit
    ) {
      return candidates;
    }

    page = response.page + 1;
  }
}

export async function getCandidateById(
  id: string,
  signal?: AbortSignal,
): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`, { signal });
}

export async function createCandidate(input: CandidateInput): Promise<Candidate> {
  return request<Candidate>("/records", { method: "POST", body: input });
}

export async function replaceCandidate(
  id: string,
  input: CandidateInput,
): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
  });
}

export async function patchCandidate(
  id: string,
  patch: CandidatePatch,
): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
}

export async function deleteCandidate(id: string): Promise<void> {
  await request<void>(`/records/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}