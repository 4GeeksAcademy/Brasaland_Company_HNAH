import { Alert } from "@/components/ui/Alert";
import { formatDate } from "@/lib/format";
import type { Note } from "@/types/note";

interface NoteItemProps {
  note: Note;
  deleting: boolean;
  error: string | null;
  onDelete: () => void;
}

export function NoteItem({ note, deleting, error, onDelete }: NoteItemProps) {
  return (
    <li className="border-b border-line py-4 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
          {note.content}
        </p>
        <button
          type="button"
          disabled={deleting}
          onClick={onDelete}
          className="min-h-9 shrink-0 rounded-sm border border-line px-3 text-sm font-semibold text-foreground hover:bg-rose-50 hover:text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 disabled:cursor-wait disabled:opacity-60"
        >
          {deleting ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
      {note.created_at ? (
        <time
          dateTime={note.created_at}
          className="mt-2 block text-xs text-muted"
        >
          {formatDate(note.created_at)}
        </time>
      ) : null}
      {error ? (
        <div className="mt-3">
          <Alert variant="error" message={error} />
        </div>
      ) : null}
    </li>
  );
}