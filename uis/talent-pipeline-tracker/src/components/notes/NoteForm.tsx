"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";

interface NoteFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export function NoteForm({ onSubmit }: NoteFormProps) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Escribe el contenido de la nota antes de añadirla.");
      setSuccess(false);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await onSubmit(trimmedContent);
      setContent("");
      setSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo añadir la nota. Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="border-b border-line py-5" onSubmit={submitNote}>
      <label
        htmlFor="candidate-note-content"
        className="block text-sm font-semibold text-foreground"
      >
        Nueva nota
      </label>
      <textarea
        id="candidate-note-content"
        className="mt-2 min-h-28 w-full resize-y rounded-sm border border-line bg-surface px-3 py-2 text-sm text-foreground focus:border-brasa-600 focus:outline-none focus:ring-2 focus:ring-brasa-600/20 disabled:opacity-60"
        value={content}
        disabled={saving}
        onChange={(event) => {
          setContent(event.currentTarget.value);
          setError(null);
          setSuccess(false);
        }}
      />
      {error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-rose-800">
          {error}
        </p>
      ) : null}
      {success ? (
        <div className="mt-3">
          <Alert variant="success" message="Nota añadida correctamente." />
        </div>
      ) : null}
      <button
        type="submit"
        disabled={saving}
        className="mt-3 inline-flex min-h-10 items-center rounded-sm bg-brasa-700 px-4 text-sm font-semibold text-white hover:bg-brasa-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Añadir nota"}
      </button>
    </form>
  );
}