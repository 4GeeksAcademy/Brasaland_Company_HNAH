export interface ApiValidationIssue {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
  url?: string;
}

export interface ApiErrorBody {
  detail: ApiValidationIssue[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface DataEnvelope<T> {
  data: T[];
  meta: {
    total: number;
  };
}