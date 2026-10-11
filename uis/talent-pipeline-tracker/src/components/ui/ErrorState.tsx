interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="max-w-xl border-l-4 border-rose-600 bg-rose-50 px-5 py-4 text-rose-950"
    >
      <p className="font-semibold">No se pudo completar la operación</p>
      <p className="mt-1 text-sm">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-10 items-center rounded-sm bg-rose-800 px-4 text-sm font-semibold text-white hover:bg-rose-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2"
      >
        Reintentar
      </button>
    </section>
  );
}