import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

const barlow = localFont({
  src: [
    { path: "../../../../fonts/barlow-400.woff2", weight: "400" },
    { path: "../../../../fonts/barlow-500.woff2", weight: "500" },
    { path: "../../../../fonts/barlow-600.woff2", weight: "600" },
    { path: "../../../../fonts/barlow-700.woff2", weight: "700" },
    { path: "../../../../fonts/barlow-800.woff2", weight: "800" },
  ],
  variable: "--font-brasal-sans",
  display: "swap",
});

const merriweather = localFont({
  src: "../../../../fonts/merriweather-700.woff2",
  weight: "700",
  variable: "--font-brasal-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Talent Pipeline · Brasaland People & Culture",
  description: "Herramienta interna de People & Culture de Brasaland.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${barlow.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
          <Link
            href="/"
            className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brasa-600"
          >
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-sm bg-brasa-700 font-display text-lg font-bold text-white"
            >
              B
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground sm:text-base">
                Brasaland · People &amp; Culture
              </span>
              <span className="mt-1 text-xs text-muted">Talent Pipeline</span>
            </span>
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
