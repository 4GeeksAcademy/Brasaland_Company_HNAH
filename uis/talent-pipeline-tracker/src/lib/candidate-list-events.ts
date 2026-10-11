export const CANDIDATE_LIST_CHANGED_EVENT = "brasaland:candidate-list-changed";

export function notifyCandidateListChanged(): void {
  window.dispatchEvent(new Event(CANDIDATE_LIST_CHANGED_EVENT));
}