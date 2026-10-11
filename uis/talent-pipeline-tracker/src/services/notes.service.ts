import { request } from "@/lib/api-client";
import type { DataEnvelope } from "@/types/api";
import type { Note, NoteInput } from "@/types/note";

export async function getNotes(
  candidateId: string,
  signal?: AbortSignal,
): Promise<Note[]> {
  const response = await request<Note[] | DataEnvelope<Note>>(
    `/records/${encodeURIComponent(candidateId)}/notes`,
    { signal },
  );

  return Array.isArray(response) ? response : response.data;
}

export async function addNote(
  candidateId: string,
  input: NoteInput,
): Promise<Note> {
  return request<Note>(
    `/records/${encodeURIComponent(candidateId)}/notes`,
    { method: "POST", body: input },
  );
}

export async function deleteNote(
  candidateId: string,
  noteId: string,
): Promise<void> {
  await request<void>(
    `/records/${encodeURIComponent(candidateId)}/notes/${encodeURIComponent(noteId)}`,
    { method: "DELETE" },
  );
}