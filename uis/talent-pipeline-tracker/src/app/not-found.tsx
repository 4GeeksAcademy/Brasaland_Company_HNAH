import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-16">
      <p className="text-sm font-semibold text-brasa-700">Talent Pipeline</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
        No encontramos esta página
      </h1>
      <p className="mt-3 text-muted">La dirección puede haber cambiado o no existir.</p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-10 items-center rounded-sm bg-brasa-700 px-4 text-sm font-semibold text-white hover:bg-brasa-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600 focus-visible:ring-offset-2"
      >
        Volver al listado
      </Link>
    </main>
  );
}