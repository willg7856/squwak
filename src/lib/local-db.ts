import bcrypt from "bcryptjs";
import { JOURNAL_LIMIT, MAX_NOTE_IMAGES, NOTE_LIMIT, type Mood, type NoteCardData, type NoteKind, type SearchFilters, type User, type Visibility } from "./types";
import { dayKey, endOfDay, parseDayKey, startOfDay } from "./time";

const STORAGE_KEY = "squwak.notebook.v1";

export type StoredUser = User & { passwordHash: string };

export type StoredNote = {
  id: string;
  userId: string;
  body: string;
  kind: NoteKind;
  mood: Mood | null;
  visibility: Visibility;
  replyToId: string | null;
  imageIds: string[];
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
};

type StoredBookmark = { userId: string; noteId: string };

export type NotebookState = {
  users: StoredUser[];
  notes: StoredNote[];
  bookmarks: StoredBookmark[];
  sessionUserId: string | null;
};

export type AuthResult = { ok: true } | { ok: false; error: string };

const empty: NotebookState = {
  users: [],
  notes: [],
  bookmarks: [],
  sessionUserId: null,
};

const emptyState = (): NotebookState => ({
  users: [],
  notes: [],
  bookmarks: [],
  sessionUserId: null,
});

function canUseStorage() {
  return typeof window !== "undefined";
}

const listeners = new Set<() => void>();
let snapshot = emptyState();
let snapshotRaw: string | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function parseNotebook(raw: string): NotebookState {
  const parsed = JSON.parse(raw) as Partial<NotebookState> & {
    notes?: Array<StoredNote & { imageIds?: string[] }>;
    users?: Array<StoredUser & { avatarId?: string | null }>;
  };
  return {
    users: (parsed.users ?? []).map((user) => ({
      ...user,
      avatarId: user.avatarId ?? null,
    })),
    notes: (parsed.notes ?? []).map((note) => ({
      ...note,
      imageIds: note.imageIds ?? [],
      pinned: Boolean(note.pinned),
      updatedAt: note.updatedAt ?? note.createdAt,
    })),
    bookmarks: parsed.bookmarks ?? [],
    sessionUserId: parsed.sessionUserId ?? null,
  };
}

export function getNotebookSnapshot(): NotebookState {
  if (!canUseStorage()) return snapshot;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === snapshotRaw) return snapshot;
  snapshotRaw = raw;
  try {
    snapshot = raw ? parseNotebook(raw) : emptyState();
  } catch {
    snapshot = emptyState();
  }
  return snapshot;
}

export function subscribeNotebook(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getServerNotebookSnapshot() {
  return empty;
}

export function saveNotebook(state: NotebookState) {
  snapshot = state;
  snapshotRaw = JSON.stringify(state);
  if (canUseStorage()) window.localStorage.setItem(STORAGE_KEY, snapshotRaw);
  emit();
}

function publicUser(user: StoredUser): User {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarHue: user.avatarHue,
    avatarId: user.avatarId ?? null,
    createdAt: user.createdAt,
  };
}

export function currentUser(state: NotebookState): User | null {
  if (!state.sessionUserId) return null;
  const user = state.users.find((item) => item.id === state.sessionUserId);
  return user ? publicUser(user) : null;
}

function hydrateNote(state: NotebookState, note: StoredNote, viewerId: string): NoteCardData | null {
  const author = state.users.find((item) => item.id === note.userId);
  if (!author || author.id !== viewerId) return null;
  return {
    id: note.id,
    userId: note.userId,
    body: note.body,
    kind: note.kind,
    mood: note.mood,
    visibility: note.visibility,
    replyToId: note.replyToId,
    createdAt: note.createdAt,
    username: author.username,
    displayName: author.displayName,
    avatarHue: author.avatarHue,
    avatarId: author.avatarId ?? null,
    imageIds: note.imageIds ?? [],
    replyCount: state.notes.filter((item) => item.replyToId === note.id).length,
    bookmarked: state.bookmarks.some(
      (bookmark) => bookmark.noteId === note.id && bookmark.userId === viewerId,
    ),
    pinned: Boolean(note.pinned),
    updatedAt: note.updatedAt ?? note.createdAt,
  };
}

export function listOwnNotes(
  state: NotebookState,
  options: { kind?: NoteKind; bookmarked?: boolean; query?: string; filters?: SearchFilters } = {},
): NoteCardData[] {
  const user = currentUser(state);
  if (!user) return [];
  const filters = options.filters;
  const query = (filters?.query ?? options.query)?.trim().replace(/^#/, "").toLowerCase() ?? "";
  const tag = filters?.tag?.replace(/^#/, "").toLowerCase() ?? "";
  const kind = filters?.kind && filters.kind !== "all" ? filters.kind : options.kind;
  const from = filters?.from ? startOfDay(parseDayKey(filters.from).getTime()) : null;
  const to = filters?.to ? endOfDay(parseDayKey(filters.to).getTime()) : null;

  return state.notes
    .filter((note) => note.userId === user.id && !note.replyToId)
    .filter((note) => (kind ? note.kind === kind : true))
    .filter((note) =>
      options.bookmarked
        ? state.bookmarks.some((bookmark) => bookmark.noteId === note.id && bookmark.userId === user.id)
        : true,
    )
    .map((note) => hydrateNote(state, note, user.id))
    .filter((note): note is NoteCardData => Boolean(note))
    .filter((note) => {
      if (filters?.mood && note.mood !== filters.mood) return false;
      if (filters?.photos && note.imageIds.length === 0) return false;
      if (from !== null && note.createdAt < from) return false;
      if (to !== null && note.createdAt > to) return false;
      if (tag && !note.body.toLowerCase().includes(`#${tag}`)) return false;
      if (!query) return true;
      return (
        note.body.toLowerCase().includes(query) ||
        note.username.toLowerCase().includes(query) ||
        note.displayName.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
}

export function getOwnNote(state: NotebookState, id: string): NoteCardData | null {
  const user = currentUser(state);
  if (!user) return null;
  const note = state.notes.find((item) => item.id === id);
  if (!note) return null;
  return hydrateNote(state, note, user.id);
}

export function listOwnReplies(state: NotebookState, noteId: string): NoteCardData[] {
  const user = currentUser(state);
  if (!user) return [];
  return state.notes
    .filter((note) => note.replyToId === noteId && note.userId === user.id)
    .map((note) => hydrateNote(state, note, user.id))
    .filter((note): note is NoteCardData => Boolean(note))
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function ownTags(state: NotebookState): { tag: string; count: number }[] {
  const user = currentUser(state);
  if (!user) return [];
  const counts = new Map<string, number>();
  for (const note of state.notes) {
    if (note.userId !== user.id) continue;
    const tags = note.body.match(/#([a-zA-Z][\w-]{0,48})/g) ?? [];
    for (const raw of tags) {
      const tag = raw.slice(1).toLowerCase();
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function ownActivity(state: NotebookState): Record<string, number> {
  const user = currentUser(state);
  const counts: Record<string, number> = {};
  if (!user) return counts;
  for (const note of state.notes) {
    if (note.userId !== user.id || note.replyToId) continue;
    const key = dayKey(note.createdAt);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function ownStats(state: NotebookState) {
  const user = currentUser(state);
  if (!user) return { notes: 0, journals: 0 };
  const mine = state.notes.filter((note) => note.userId === user.id && !note.replyToId);
  return {
    notes: mine.filter((note) => note.kind === "note").length,
    journals: mine.filter((note) => note.kind === "journal").length,
  };
}

export function login(state: NotebookState, username: string, password: string): { state: NotebookState; result: AuthResult } {
  const user = state.users.find((item) => item.username === username.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return { state, result: { ok: false, error: "invalid" } };
  }
  return { state: { ...state, sessionUserId: user.id }, result: { ok: true } };
}

export function signup(
  state: NotebookState,
  input: { username: string; displayName: string; password: string },
): { state: NotebookState; result: AuthResult } {
  const username = input.username.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const password = input.password;

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { state, result: { ok: false, error: "username" } };
  }
  if (displayName.length < 2 || displayName.length > 40) {
    return { state, result: { ok: false, error: "name" } };
  }
  if (password.length < 6) {
    return { state, result: { ok: false, error: "password" } };
  }
  if (state.users.some((item) => item.username === username)) {
    return { state, result: { ok: false, error: "taken" } };
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    username,
    displayName,
    bio: "",
    avatarHue: Math.floor(Math.random() * 360),
    avatarId: null,
    createdAt: Date.now(),
    passwordHash: bcrypt.hashSync(password, 10),
  };

  return {
    state: {
      ...state,
      users: [...state.users, user],
      sessionUserId: user.id,
    },
    result: { ok: true },
  };
}

export function logout(state: NotebookState): NotebookState {
  return { ...state, sessionUserId: null };
}

export function createNote(
  state: NotebookState,
  input: {
    body: string;
    kind: NoteKind;
    mood: Mood | null;
    replyToId?: string | null;
    imageIds?: string[];
    createdAt?: number;
  },
): { state: NotebookState; noteId: string | null } {
  const user = currentUser(state);
  if (!user) return { state, noteId: null };
  const body = input.body.trim();
  const imageIds = (input.imageIds ?? []).slice(0, MAX_NOTE_IMAGES);
  const kind = input.replyToId ? "note" : input.kind;
  const limit = kind === "journal" ? JOURNAL_LIMIT : NOTE_LIMIT;
  if ((!body && imageIds.length === 0) || body.length > limit) return { state, noteId: null };
  const createdAt = input.createdAt && input.createdAt <= Date.now() + 60_000 ? input.createdAt : Date.now();

  const note: StoredNote = {
    id: crypto.randomUUID(),
    userId: user.id,
    body,
    kind,
    mood: kind === "journal" ? input.mood : null,
    visibility: "private",
    replyToId: input.replyToId ?? null,
    imageIds,
    createdAt,
    updatedAt: Date.now(),
    pinned: false,
  };

  return { state: { ...state, notes: [note, ...state.notes] }, noteId: note.id };
}

export function updateNote(
  state: NotebookState,
  input: {
    id: string;
    body: string;
    mood: Mood | null;
    imageIds: string[];
    createdAt?: number;
  },
): { state: NotebookState; ok: boolean } {
  const user = currentUser(state);
  if (!user) return { state, ok: false };
  const existing = state.notes.find((note) => note.id === input.id && note.userId === user.id);
  if (!existing) return { state, ok: false };
  const body = input.body.trim();
  const imageIds = input.imageIds.slice(0, MAX_NOTE_IMAGES);
  const limit = existing.kind === "journal" ? JOURNAL_LIMIT : NOTE_LIMIT;
  if ((!body && imageIds.length === 0) || body.length > limit) return { state, ok: false };
  const createdAt =
    input.createdAt && input.createdAt <= Date.now() + 60_000 ? input.createdAt : existing.createdAt;
  return {
    state: {
      ...state,
      notes: state.notes.map((note) =>
        note.id === existing.id
          ? {
              ...note,
              body,
              mood: existing.kind === "journal" ? input.mood : null,
              imageIds,
              createdAt,
              updatedAt: Date.now(),
            }
          : note,
      ),
    },
    ok: true,
  };
}

export function togglePin(state: NotebookState, noteId: string): NotebookState {
  const user = currentUser(state);
  if (!user) return state;
  const note = state.notes.find((item) => item.id === noteId && item.userId === user.id && !item.replyToId);
  if (!note) return state;
  return {
    ...state,
    notes: state.notes.map((item) => (item.id === noteId ? { ...item, pinned: !item.pinned } : item)),
  };
}

export function noteTreeImageIds(state: NotebookState, id: string): string[] {
  return state.notes
    .filter((note) => note.id === id || note.replyToId === id)
    .flatMap((note) => note.imageIds ?? []);
}

export function deleteNote(state: NotebookState, id: string): NotebookState {
  const user = currentUser(state);
  if (!user) return state;
  const owned = state.notes.find((note) => note.id === id && note.userId === user.id);
  if (!owned) return state;
  const remove = new Set(
    state.notes
      .filter((note) => note.id === id || note.replyToId === id)
      .map((note) => note.id),
  );
  return {
    ...state,
    notes: state.notes.filter((note) => !remove.has(note.id)),
    bookmarks: state.bookmarks.filter((bookmark) => !remove.has(bookmark.noteId)),
  };
}

export function toggleBookmark(state: NotebookState, noteId: string): NotebookState {
  const user = currentUser(state);
  if (!user) return state;
  const note = state.notes.find((item) => item.id === noteId && item.userId === user.id);
  if (!note) return state;
  const existing = state.bookmarks.some(
    (bookmark) => bookmark.noteId === noteId && bookmark.userId === user.id,
  );
  return {
    ...state,
    bookmarks: existing
      ? state.bookmarks.filter(
          (bookmark) => !(bookmark.noteId === noteId && bookmark.userId === user.id),
        )
      : [...state.bookmarks, { userId: user.id, noteId }],
  };
}

export function updateProfile(
  state: NotebookState,
  input: { displayName: string; username: string; avatarId: string | null },
): { state: NotebookState; result: AuthResult } {
  const user = currentUser(state);
  if (!user) return { state, result: { ok: false, error: "invalid" } };
  const displayName = input.displayName.trim();
  const username = input.username.trim().toLowerCase();
  if (displayName.length < 2 || displayName.length > 40) {
    return { state, result: { ok: false, error: "name" } };
  }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { state, result: { ok: false, error: "username" } };
  }
  if (state.users.some((item) => item.username === username && item.id !== user.id)) {
    return { state, result: { ok: false, error: "taken" } };
  }
  return {
    state: {
      ...state,
      users: state.users.map((item) =>
        item.id === user.id ? { ...item, displayName, username, avatarId: input.avatarId } : item,
      ),
    },
    result: { ok: true },
  };
}

export function updatePassword(
  state: NotebookState,
  password: string,
): { state: NotebookState; result: AuthResult } {
  const user = currentUser(state);
  if (!user) return { state, result: { ok: false, error: "invalid" } };
  if (password.length < 6) return { state, result: { ok: false, error: "password" } };
  return {
    state: {
      ...state,
      users: state.users.map((item) =>
        item.id === user.id ? { ...item, passwordHash: bcrypt.hashSync(password, 10) } : item,
      ),
    },
    result: { ok: true },
  };
}
