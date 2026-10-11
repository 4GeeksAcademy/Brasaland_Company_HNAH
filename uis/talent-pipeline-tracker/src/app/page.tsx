import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
      <div className="border-b border-line pb-6">
        <p className="text-sm font-semibold text-brasa-700">Talent Pipeline</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
          Candidaturas
        </h1>
      </div>
      <section className="py-10" aria-label="Listado de candidaturas">
        <p className="text-muted">El listado de candidaturas aparecerá aquí.</p>
        <Link
          href="/candidates/123"
          className="mt-6 inline-flex min-h-10 items-center rounded-sm border border-brasa-700 px-4 text-sm font-semibold text-brasa-800 hover:bg-brasa-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600"
        >
          Abrir un detalle de ejemplo
        </Link>
      </section>
    </main>
  );
}
