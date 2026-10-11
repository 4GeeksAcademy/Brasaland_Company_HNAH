import type { ApiErrorBody, ApiValidationIssue } from "@/types/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const VALIDATION_FIELD_LABELS: Record<string, string> = {
  full_name: "Nombre completo",
  email: "Correo electrónico",
  phone: "Teléfono",
  position: "Cargo",
  experience_years: "Años de experiencia",
  linkedin_url: "Perfil de LinkedIn",
  cv_url: "Hoja de vida",
  status: "Estado",
  stage: "Etapa",
  content: "Nota",
};

function isValidationIssue(value: unknown): value is ApiValidationIssue {
  if (typeof value !== "object" || value === null) return false;

  const issue = value as Record<string, unknown>;
  return (
    Array.isArray(issue.loc) &&
    typeof issue.msg === "string" &&
    typeof issue.type === "string"
  );
}

function readValidationDetails(payload: unknown): ApiValidationIssue[] {
  if (typeof payload !== "object" || payload === null) return [];

  const detail = (payload as Partial<ApiErrorBody>).detail;
  return Array.isArray(detail) ? detail.filter(isValidationIssue) : [];
}

function validationMessage(details: ApiValidationIssue[]): string {
  return details
    .map((detail) => {
      const lastLocation = detail.loc.at(-1);
      const field =
        typeof lastLocation === "string"
          ? VALIDATION_FIELD_LABELS[lastLocation] ?? lastLocation
          : "Solicitud";
      const message =
        detail.type === "missing"
          ? "es obligatorio"
          : detail.type === "value_error"
            ? "tiene un formato o valor no válido"
            : "no es válido";

      return `${field}: ${message}`;
    })
    .join(". ");
}

export class ApiError extends Error {
  readonly status: number;
  readonly details: ApiValidationIssue[];

  constructor(status: number, message: string, details: ApiValidationIssue[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function errorMessage(status: number, details: ApiValidationIssue[]): string {
  if (status === 404) return "No encontramos este registro";
  if (status === 422) {
    return validationMessage(details) || "Revisa los datos ingresados";
  }
  if (status >= 500) return "Ocurrió un error en el servidor";
  return "No se pudo completar la solicitud";
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error(
      "Falta configurar NEXT_PUBLIC_API_URL para conectar con la API.",
    );
  }

  const { body, headers: suppliedHeaders, ...requestOptions } = options;
  const headers = new Headers(suppliedHeaders);
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`,
      {
        ...requestOptions,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(0, "No se pudo conectar con el servidor");
  }

  if (response.status === 204) return undefined as T;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const details = readValidationDetails(payload);
    throw new ApiError(response.status, errorMessage(response.status, details), details);
  }

  return payload as T;
}