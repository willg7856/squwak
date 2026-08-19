"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { deleteImages, putImage } from "@/lib/images";
import type { Mood, NoteCardData, NoteKind, User } from "@/lib/types";
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
  noteTreeImageIds,
  ownStats,
  ownTags,
  saveNotebook,
  signup as signupInStore,
  subscribeNotebook,
  toggleBookmark as toggleBookmarkInStore,
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
    replyToId?: string | null;
    images?: Blob[];
  }) => Promise<string | null>;
  deleteNote: (id: string) => void;
  toggleBookmark: (id: string) => void;
  updateProfile: (input: {
    displayName: string;
    username: string;
    avatar?: Blob | null;
  }) => Promise<AuthResult>;
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
      createNote: async (input) => {
        const imageIds: string[] = [];
        try {
          for (const blob of input.images ?? []) {
            const id = crypto.randomUUID();
            await putImage(id, blob);
            imageIds.push(id);
          }
          const current = getNotebookSnapshot();
          const { state: next, noteId } = createNoteInStore(current, {
            body: input.body,
            kind: input.kind,
            mood: input.mood,
            replyToId: input.replyToId,
            imageIds,
          });
          if (noteId) {
            commit(next);
            return noteId;
          }
          await deleteImages(imageIds);
          return null;
        } catch {
          await deleteImages(imageIds);
          return null;
        }
      },
      deleteNote: (id) => {
        const imageIds = noteTreeImageIds(snapshot, id);
        commit(deleteNoteInStore(snapshot, id));
        void deleteImages(imageIds);
      },
      toggleBookmark: (id) => commit(toggleBookmarkInStore(snapshot, id)),
      updateProfile: async (input) => {
        const previousAvatarId = user?.avatarId ?? null;
        let avatarId = previousAvatarId;
        try {
          if (input.avatar === null) {
            avatarId = null;
          } else if (input.avatar) {
            const id = crypto.randomUUID();
            await putImage(id, input.avatar);
            avatarId = id;
          }
          const current = getNotebookSnapshot();
          const { state: next, result } = updateProfileInStore(current, {
            displayName: input.displayName,
            username: input.username,
            avatarId,
          });
          if (result.ok) {
            commit(next);
            if (previousAvatarId && previousAvatarId !== avatarId) {
              void deleteImages([previousAvatarId]);
            }
          } else if (avatarId && avatarId !== previousAvatarId) {
            await deleteImages([avatarId]);
          }
          return result;
        } catch {
          if (avatarId && avatarId !== previousAvatarId) {
            await deleteImages([avatarId]);
          }
          return { ok: false as const, error: "invalid" };
        }
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
