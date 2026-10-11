"use client";

import { useState } from "react";
import { NoteForm } from "@/components/notes/NoteForm";
import { NoteItem } from "@/components/notes/NoteItem";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useNotes } from "@/hooks/useNotes";

interface NotesSectionProps {
  candidateId: string;
  onCountChange: (delta: 1 | -1) => void;
}

function errorMessage(cause: unknown): string {
  return cause instanceof Error
    ? cause.message
    : "No se pudo eliminar la nota. Inténtalo de nuevo.";
}

export function NotesSection({ candidateId, onCountChange }: NotesSectionProps) {
  const { notes, status, loading, error, refetch, addNote, removeNote } =
    useNotes(candidateId);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(() => new Set());
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const submitNote = async (content: string) => {
    setDeleteSuccess(false);
    await addNote({ content });
    onCountChange(1);
  };

  const deleteNote = async (noteId: string) => {
    if (!window.confirm("¿Eliminar esta nota? Esta acción no se puede deshacer.")) {
      return;
    }

    setDeleteSuccess(false);
    setDeleteErrors((current) => {
      const next = { ...current };
      delete next[noteId];
      return next;
    });
    setDeletingIds((current) => new Set(current).add(noteId));

    try {
      await removeNote(noteId);
      onCountChange(-1);
      setDeleteSuccess(true);
    } catch (cause) {
      setDeleteErrors((current) => ({
        ...current,
        [noteId]: errorMessage(cause),
      }));
    } finally {
      setDeletingIds((current) => {
        const next = new Set(current);
        next.delete(noteId);
        return next;
      });
    }
  };

  return (
    <section className="mt-10" aria-labelledby="candidate-notes-heading">
      <header className="border-b border-line pb-4">
        <h2
          id="candidate-notes-heading"
          className="font-display text-2xl font-bold text-foreground"
        >
          Notas internas
        </h2>
      </header>

      {deleteSuccess ? (
        <div className="mt-4">
          <Alert variant="success" message="Nota eliminada correctamente." />
        </div>
      ) : null}

      <NoteForm onSubmit={submitNote} />

      {loading && notes.length === 0 ? (
        <div className="py-5"><LoadingState /></div>
      ) : null}
      {loading && notes.length > 0 ? (
        <p role="status" className="py-3 text-sm text-muted">Actualizando notas…</p>
      ) : null}
      {error ? (
        <div className="py-4">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      ) : null}
      {status === "success" && notes.length === 0 ? (
        <div className="py-5">
          <EmptyState message="Aún no hay notas para esta candidatura" />
        </div>
      ) : null}
      {notes.length > 0 ? (
        <ul aria-label="Notas de la candidatura" className="divide-y divide-line">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              deleting={deletingIds.has(note.id)}
              error={deleteErrors[note.id] ?? null}
              onDelete={() => void deleteNote(note.id)}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}