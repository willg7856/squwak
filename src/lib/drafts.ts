import type { Mood, NoteKind } from "./types";

const STORAGE_KEY = "squwak.drafts.v1";

export type Draft = {
  body: string;
  kind: NoteKind;
  mood: Mood | "";
  datedAt: number;
};

function readAll(): Record<string, Draft> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, Draft>;
  } catch {
    return {};
  }
}

export function readDraft(key: string): Draft | null {
  return readAll()[key] ?? null;
}

export function writeDraft(key: string, draft: Draft) {
  if (typeof window === "undefined") return;
  const all = readAll();
  const empty = !draft.body.trim() && !draft.mood;
  if (empty) delete all[key];
  else all[key] = draft;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function clearDraft(key: string) {
  if (typeof window === "undefined") return;
  const all = readAll();
  delete all[key];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
