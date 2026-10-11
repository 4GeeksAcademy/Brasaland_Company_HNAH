"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { ApiError } from "@/lib/api-client";
import { notifyCandidateListChanged } from "@/lib/candidate-list-events";
import { validateCandidateForm } from "@/lib/validation";
import type {
  CandidateFormErrors,
  CandidateFormField,
  CandidateFormValues,
} from "@/lib/validation";
import { createCandidate, replaceCandidate } from "@/services/candidates.service";
import type { Candidate, CandidateInput } from "@/types/candidate";

type FormField = CandidateFormField;

interface CandidateFormProps {
  mode: "create" | "edit";
  candidate?: Candidate;
}

const fieldOrder: CandidateFormField[] = [
  "full_name",
  "email",
  "phone",
  "position",
  "experience_years",
  "linkedin_url",
  "cv_url",
];

function isCandidateFormField(value: string): value is CandidateFormField {
  return fieldOrder.some((field) => field === value);
}

const inputClassName =
  "min-h-11 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-brasa-600 focus:outline-none focus:ring-2 focus:ring-brasa-600/20";

function candidateValues(candidate?: Candidate): CandidateFormValues {
  return {
    full_name: candidate?.full_name ?? "",
    email: candidate?.email ?? "",
    phone: candidate?.phone ?? "",
    position: candidate?.position ?? "",
    experience_years:
      candidate === undefined ? "" : String(candidate.experience_years),
    linkedin_url: candidate?.linkedin_url ?? "",
    cv_url: candidate?.cv_url ?? "",
  };
}

function toCandidateInput(values: CandidateFormValues): CandidateInput {
  return {
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    position: values.position.trim(),
    experience_years: Number(values.experience_years),
    // The API accepts explicit null values for empty optional URL fields.
    linkedin_url: values.linkedin_url.trim() || null,
    cv_url: values.cv_url.trim() || null,
  };
}

function serverFieldErrors(error: ApiError): CandidateFormErrors {
  const result: CandidateFormErrors = {};

  for (const issue of error.details) {
    const field = issue.loc.at(-1);
    if (typeof field !== "string" || !isCandidateFormField(field)) {
      continue;
    }

    if (result[field]) continue;

    if (issue.type === "missing") {
      result[field] = "Este campo es obligatorio.";
    } else if (field === "email") {
      result.email = "El servidor rechazó el formato del correo electrónico.";
    } else if (field === "experience_years") {
      result.experience_years = "El servidor rechazó los años de experiencia.";
    } else if (field === "linkedin_url" || field === "cv_url") {
      result[field] = "El servidor rechazó esta URL.";
    } else {
      result[field] = "El servidor rechazó este valor.";
    }
  }

  return result;
}

export function CandidateForm({ mode, candidate }: CandidateFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(() => candidateValues(candidate));
  const [errors, setErrors] = useState<CandidateFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRefs = useRef<Partial<Record<CandidateFormField, HTMLInputElement | null>>>({});

  const validateField = (field: CandidateFormField) => {
    const error = validateCandidateForm(values)[field];
    setErrors((current) => {
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const updateField = (field: CandidateFormField, value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setServerError(null);
    const error = validateCandidateForm(nextValues)[field];
    setErrors((current) => {
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    const validationErrors = validateCandidateForm(values);
    setErrors(validationErrors);
    setServerError(null);
    const firstInvalidField = fieldOrder.find((field) => validationErrors[field]);
    if (firstInvalidField) {
      inputRefs.current[firstInvalidField]?.focus();
      return;
    }

    setSaving(true);
    try {
      const payload = toCandidateInput(values);
      const result = mode === "create"
        ? await createCandidate(payload)
        : candidate
          ? await replaceCandidate(candidate.id, payload)
          : null;
      if (!result) return;
      notifyCandidateListChanged();
      const notice = mode === "create" ? "created=1" : "updated=1";
      router.push(`/candidates/${encodeURIComponent(result.id)}?${notice}`);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setServerError(cause.message);
        if (cause.status === 422) {
          setErrors((current) => ({ ...current, ...serverFieldErrors(cause) }));
        }
      } else {
        setServerError("No se pudo conectar con el servidor");
      }
    } finally {
      setSaving(false);
    }
  };

  const cancelHref =
    mode === "create" ? "/" : `/candidates/${encodeURIComponent(candidate?.id ?? "")}`;

  const fieldProps = (field: FormField) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      updateField(field, event.currentTarget.value),
    onBlur: () => validateField(field),
    "aria-required": fieldOrder.slice(0, 5).includes(field),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": [
      ...(field === "position" ? ["position-examples"] : []),
      ...(errors[field] ? [`${field}-error`] : []),
    ].join(" ") || undefined,
    ref: (element: HTMLInputElement | null) => {
      inputRefs.current[field] = element;
    },
  });

  const fieldError = (field: CandidateFormField) =>
    errors[field] ? (
      <p id={`${field}-error`} role="alert" className="mt-1 text-sm text-rose-800">
        {errors[field]}
      </p>
    ) : null;

  return (
    <form className="max-w-3xl" noValidate onSubmit={submitForm}>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className="block text-sm font-semibold text-foreground">
            Nombre completo <span aria-hidden="true">*</span>
          </label>
          <input className={`${inputClassName} mt-1`} type="text" autoComplete="name" placeholder="Ej. Laura Restrepo" {...fieldProps("full_name")} />
          {fieldError("full_name")}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-foreground">
            Correo electrónico <span aria-hidden="true">*</span>
          </label>
          <input className={`${inputClassName} mt-1`} type="email" autoComplete="email" placeholder="Ej. laura@ejemplo.com" {...fieldProps("email")} />
          {fieldError("email")}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-foreground">
            Teléfono <span aria-hidden="true">*</span>
          </label>
          <input className={`${inputClassName} mt-1`} type="tel" autoComplete="tel" placeholder="+57 300 123 4567 o +1 305 555 0100" {...fieldProps("phone")} />
          {fieldError("phone")}
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-semibold text-foreground">
            Puesto <span aria-hidden="true">*</span>
          </label>
          <input className={`${inputClassName} mt-1`} type="text" placeholder="Ej. Cocinero/a de parrilla" {...fieldProps("position")} />
          {fieldError("position")}
          <p id="position-examples" className="mt-1 text-xs text-muted">
            También puedes usar Cajero/a, Mesero/a o Supervisor/a de local.
          </p>
        </div>

        <div>
          <label htmlFor="experience_years" className="block text-sm font-semibold text-foreground">
            Años de experiencia <span aria-hidden="true">*</span>
          </label>
          <input
            className={`${inputClassName} mt-1`}
            type="number"
            min="0"
            step="0.5"
            placeholder="Ej. 2.5"
            {...fieldProps("experience_years")}
          />
          {fieldError("experience_years")}
        </div>

        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-semibold text-foreground">
            LinkedIn
          </label>
          <input className={`${inputClassName} mt-1`} type="url" placeholder="https://linkedin.com/in/tu-perfil" {...fieldProps("linkedin_url")} />
          {fieldError("linkedin_url")}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cv_url" className="block text-sm font-semibold text-foreground">
            Enlace al CV
          </label>
          <input className={`${inputClassName} mt-1`} type="url" placeholder="https://ejemplo.com/hoja-de-vida.pdf" {...fieldProps("cv_url")} />
          {fieldError("cv_url")}
        </div>
      </div>

      {serverError ? (
        <div className="mt-6">
          <Alert variant="error" message={serverError} />
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-5">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-brasa-700 px-5 text-sm font-semibold text-white hover:bg-brasa-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? "Guardando…" : mode === "create" ? "Crear candidatura" : "Guardar cambios"}
        </button>
        <Link
          href={cancelHref}
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-line bg-surface px-5 text-sm font-semibold text-foreground hover:bg-brasa-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}