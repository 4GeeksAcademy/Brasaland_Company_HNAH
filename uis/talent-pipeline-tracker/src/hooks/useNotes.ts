"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api-client";
import {
  addNote as addNoteRequest,
  deleteNote as deleteNoteRequest,
  getNotes as getNotesRequest,
} from "@/services/notes.service";
import type { Note, NoteInput } from "@/types/note";

type NotesLoadState =
  | { requestKey: string | null; status: "loading"; error: null }
  | { requestKey: string; status: "success"; error: null }
  | { requestKey: string; status: "error"; error: ApiError };

function sortNewestFirst(notes: Note[]): Note[] {
  return [...notes].sort(
    (first, second) =>
      Date.parse(second.created_at) - Date.parse(first.created_at),
  );
}

export function useNotes(candidateId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [state, setState] = useState<NotesLoadState>({
    requestKey: null,
    status: "loading",
    error: null,
  });
  const [requestVersion, setRequestVersion] = useState(0);
  const mutationVersion = useRef(0);
  const requestKey = `${candidateId}:${requestVersion}`;

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const mutationVersionAtStart = mutationVersion.current;

    const loadNotes = async () => {
      try {
        const result = await getNotesRequest(candidateId, controller.signal);
        if (controller.signal.aborted) return;
        if (mutationVersion.current === mutationVersionAtStart) {
          setNotes(sortNewestFirst(result));
        }
        setState({ requestKey, status: "success", error: null });
      } catch (cause) {
        if (
          controller.signal.aborted ||
          mutationVersion.current !== mutationVersionAtStart ||
          (cause instanceof Error && cause.name === "AbortError")
        ) {
          return;
        }

        const error =
          cause instanceof ApiError
            ? cause
            : new ApiError(0, "No se pudieron cargar las notas.");
        setState({ requestKey, status: "error", error });
      }
    };

    void loadNotes();
    return () => controller.abort();
  }, [candidateId, requestKey]);

  const addNote = useCallback(
    async (input: NoteInput): Promise<Note> => {
      const note = await addNoteRequest(candidateId, input);
      mutationVersion.current += 1;
      setNotes((current) => sortNewestFirst([...current, note]));
      setState({ requestKey, status: "success", error: null });
      return note;
    },
    [candidateId, requestKey],
  );

  const removeNote = useCallback(
    async (noteId: string): Promise<void> => {
      await deleteNoteRequest(candidateId, noteId);
      mutationVersion.current += 1;
      setNotes((current) => current.filter((note) => note.id !== noteId));
      setState({ requestKey, status: "success", error: null });
    },
    [candidateId, requestKey],
  );

  const isCurrentRequest = state.requestKey === requestKey;

  return {
    notes,
    status: isCurrentRequest ? state.status : "loading",
    loading: !isCurrentRequest || state.status === "loading",
    error: isCurrentRequest && state.status === "error" ? state.error : null,
    refetch,
    addNote,
    removeNote,
  };
}