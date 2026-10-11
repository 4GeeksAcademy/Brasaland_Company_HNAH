import Link from "next/link";

export const instant = false;

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
      <p className="text-sm font-semibold text-brasa-700">Talent Pipeline</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
        Editar candidatura {id}
      </h1>
      <p className="mt-4 text-muted">El formulario estará disponible más adelante.</p>
      <Link
        href={`/candidates/${encodeURIComponent(id)}`}
        className="mt-8 inline-flex min-h-10 items-center rounded-sm border border-line bg-surface px-4 text-sm font-semibold text-foreground hover:bg-brasa-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600"
      >
        Volver al detalle
      </Link>
    </main>
  );
}