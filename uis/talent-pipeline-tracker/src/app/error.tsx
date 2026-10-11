"use client";

import Link from "next/link";
import { ErrorState } from "@/components/ui/ErrorState";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-16">
      <ErrorState message="No pudimos cargar esta página." onRetry={reset} />
      <Link
        href="/"
        className="mt-6 inline-flex min-h-10 items-center rounded-sm border border-line bg-surface px-4 text-sm font-semibold text-foreground hover:bg-brasa-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600"
      >
        Volver al listado
      </Link>
    </main>
  );
}