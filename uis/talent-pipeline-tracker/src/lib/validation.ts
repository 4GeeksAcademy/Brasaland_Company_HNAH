export interface CandidateFormValues {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  experience_years: string;
  linkedin_url: string;
  cv_url: string;
}

export type CandidateFormField = keyof CandidateFormValues;
export type CandidateFormErrors = Partial<Record<CandidateFormField, string>>;

function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Ingresa el correo electrónico.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return "Ingresa un correo electrónico válido.";
  }
  return undefined;
}

function validatePhone(value: string): string | undefined {
  const phone = value.trim();
  const digits = phone.replace(/\D/g, "");

  if (!phone) return "Ingresa el teléfono.";
  if (!/^\+?[0-9][0-9\s()-]*$/.test(phone) || digits.length < 7) {
    return "Ingresa un teléfono válido con al menos 7 dígitos.";
  }
  return undefined;
}

function validateOptionalUrl(value: string, label: string): string | undefined {
  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;

  try {
    const url = new URL(trimmedValue);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) {
      return `Ingresa una URL válida para ${label}.`;
    }
    return undefined;
  } catch {
    return `Ingresa una URL válida para ${label}.`;
  }
}

export function validateCandidateForm(
  values: CandidateFormValues,
): CandidateFormErrors {
  const errors: CandidateFormErrors = {};

  if (!values.full_name.trim()) {
    errors.full_name = "Ingresa el nombre completo.";
  }

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(values.phone);
  if (phoneError) errors.phone = phoneError;

  if (!values.position.trim()) {
    errors.position = "Ingresa el puesto.";
  }

  if (!values.experience_years.trim()) {
    errors.experience_years = "Ingresa los años de experiencia.";
  } else {
    const years = Number(values.experience_years);
    if (!Number.isFinite(years) || years < 0) {
      errors.experience_years = "Ingresa un número igual o mayor que 0.";
    }
  }

  const linkedinError = validateOptionalUrl(values.linkedin_url, "LinkedIn");
  if (linkedinError) errors.linkedin_url = linkedinError;

  const cvError = validateOptionalUrl(values.cv_url, "el CV");
  if (cvError) errors.cv_url = cvError;

  return errors;
}