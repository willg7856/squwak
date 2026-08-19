"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Mood, NoteCardData, NoteKind, User, Visibility } from "@/lib/types";
import {
  createNote as createNoteInStore,
  currentUser,
  deleteNote as deleteNoteInStore,
  getOwnNote,
  getNotebookSnapshot,
  getServerNotebookSnapshot,
  listOwnNotes,
  listOwnReplies,
  login as loginInStore,
  logout as logoutInStore,
  ownStats,
  ownTags,
  saveNotebook,
  signup as signupInStore,
  subscribeNotebook,
  toggleBookmark as toggleBookmarkInStore,
  toggleLike as toggleLikeInStore,
  updatePassword as updatePasswordInStore,
  updateProfile as updateProfileInStore,
  type AuthResult,
} from "@/lib/local-db";

type NotebookContextValue = {
  ready: boolean;
  user: User | null;
  notes: NoteCardData[];
  journalNotes: NoteCardData[];
  savedNotes: NoteCardData[];
  likedNotes: NoteCardData[];
  tags: { tag: string; count: number }[];
  stats: { notes: number; journals: number };
  search: (query?: string) => NoteCardData[];
  noteById: (id: string) => NoteCardData | null;
  repliesFor: (id: string) => NoteCardData[];
  login: (username: string, password: string) => AuthResult;
  signup: (input: { username: string; displayName: string; password: string }) => AuthResult;
  logout: () => void;
  createNote: (input: {
    body: string;
    kind: NoteKind;
    mood: Mood | null;
    visibility: Visibility;
    replyToId?: string | null;
  }) => string | null;
  deleteNote: (id: string) => void;
  toggleLike: (id: string) => void;
  toggleBookmark: (id: string) => void;
  updateProfile: (input: { displayName: string; bio: string }) => AuthResult;
  updatePassword: (password: string) => AuthResult;
};

const NotebookContext = createContext<NotebookContextValue | null>(null);

export function NotebookProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribeNotebook,
    getNotebookSnapshot,
    getServerNotebookSnapshot,
  );

  const commit = useCallback((next: ReturnType<typeof getNotebookSnapshot>) => {
    saveNotebook(next);
  }, []);

  const value = useMemo<NotebookContextValue>(() => {
    const snapshot = state;
    const user = currentUser(snapshot);

    return {
      ready: true,
      user,
      notes: listOwnNotes(snapshot),
      journalNotes: listOwnNotes(snapshot, { kind: "journal" }),
      savedNotes: listOwnNotes(snapshot, { bookmarked: true }),
      likedNotes: listOwnNotes(snapshot, { liked: true }),
      tags: ownTags(snapshot),
      stats: ownStats(snapshot),
      search: (query) => listOwnNotes(snapshot, { query }),
      noteById: (id) => getOwnNote(snapshot, id),
      repliesFor: (id) => listOwnReplies(snapshot, id),
      login: (username, password) => {
        const { state: next, result } = loginInStore(snapshot, username, password);
        if (result.ok) commit(next);
        return result;
      },
      signup: (input) => {
        const { state: next, result } = signupInStore(snapshot, input);
        if (result.ok) commit(next);
        return result;
      },
      logout: () => commit(logoutInStore(snapshot)),
      createNote: (input) => {
        const { state: next, noteId } = createNoteInStore(snapshot, input);
        if (noteId) commit(next);
        return noteId;
      },
      deleteNote: (id) => commit(deleteNoteInStore(snapshot, id)),
      toggleLike: (id) => commit(toggleLikeInStore(snapshot, id)),
      toggleBookmark: (id) => commit(toggleBookmarkInStore(snapshot, id)),
      updateProfile: (input) => {
        const { state: next, result } = updateProfileInStore(snapshot, input);
        if (result.ok) commit(next);
        return result;
      },
      updatePassword: (password) => {
        const { state: next, result } = updatePasswordInStore(snapshot, password);
        if (result.ok) commit(next);
        return result;
      },
    };
  }, [commit, state]);

  return <NotebookContext.Provider value={value}>{children}</NotebookContext.Provider>;
}

export function useNotebook() {
  const context = useContext(NotebookContext);
  if (!context) throw new Error("useNotebook must be used within NotebookProvider");
  return context;
}

export function BootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted">
      <p className="font-serif text-2xl text-ink">Squwak</p>
    </div>
  );
}
