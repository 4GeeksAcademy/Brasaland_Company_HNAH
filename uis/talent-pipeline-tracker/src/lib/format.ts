const bogotaDateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeZone: "America/Bogota",
});

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : bogotaDateFormatter.format(date);
}

export function formatExperience(years: number): string {
  return `${years} ${years === 1 ? "año" : "años"}`;
}