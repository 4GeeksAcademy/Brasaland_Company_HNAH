export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-5 animate-spin rounded-full border-2 border-brasa-100 border-t-brasa-700"
    />
  );
}

export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 text-sm font-medium text-muted"
    >
      <Spinner />
      <span>Cargando…</span>
    </div>
  );
}