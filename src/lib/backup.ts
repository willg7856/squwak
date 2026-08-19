import { getImageBlob, putImage, deleteImages } from "./images";
import {
  currentUser,
  getNotebookSnapshot,
  saveNotebook,
  type NotebookState,
  type StoredNote,
} from "./local-db";

export type NotebookBackup = {
  version: 1;
  exportedAt: number;
  user: { username: string; displayName: string; avatarHue: number; avatarId: string | null };
  notes: StoredNote[];
  bookmarks: { noteId: string }[];
  images: Record<string, string>;
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function exportNotebook(): Promise<NotebookBackup | null> {
  const state = getNotebookSnapshot();
  const user = currentUser(state);
  if (!user) return null;
  const notes = state.notes.filter((note) => note.userId === user.id);
  const bookmarks = state.bookmarks
    .filter((item) => item.userId === user.id)
    .map((item) => ({ noteId: item.noteId }));
  const imageIds = [
    ...new Set(
      [...notes.flatMap((note) => note.imageIds ?? []), user.avatarId ?? ""].filter(Boolean),
    ),
  ];
  const images: Record<string, string> = {};
  for (const id of imageIds) {
    const blob = await getImageBlob(id);
    if (blob) images[id] = await blobToDataUrl(blob);
  }
  return {
    version: 1,
    exportedAt: Date.now(),
    user: {
      username: user.username,
      displayName: user.displayName,
      avatarHue: user.avatarHue,
      avatarId: user.avatarId,
    },
    notes,
    bookmarks,
    images,
  };
}

export async function importNotebook(backup: NotebookBackup): Promise<{ ok: true } | { ok: false; error: string }> {
  if (backup.version !== 1 || !Array.isArray(backup.notes)) {
    return { ok: false, error: "format" };
  }
  const state = getNotebookSnapshot();
  const user = currentUser(state);
  if (!user) return { ok: false, error: "invalid" };

  const oldIds = [
    ...state.notes.filter((note) => note.userId === user.id).flatMap((note) => note.imageIds ?? []),
    user.avatarId ?? "",
  ].filter(Boolean);
  await deleteImages(oldIds);

  for (const [id, dataUrl] of Object.entries(backup.images ?? {})) {
    try {
      await putImage(id, dataUrlToBlob(dataUrl));
    } catch {
      // Skip a broken photo rather than failing the whole restore.
    }
  }

  const notes: StoredNote[] = backup.notes.map((note) => ({
    ...note,
    userId: user.id,
    imageIds: note.imageIds ?? [],
    pinned: Boolean(note.pinned),
    updatedAt: note.updatedAt ?? note.createdAt,
  }));
  const noteIds = new Set(notes.map((note) => note.id));
  const next: NotebookState = {
    ...state,
    notes: [...state.notes.filter((note) => note.userId !== user.id), ...notes],
    bookmarks: [
      ...state.bookmarks.filter((item) => item.userId !== user.id),
      ...backup.bookmarks
        .filter((item) => noteIds.has(item.noteId))
        .map((item) => ({ userId: user.id, noteId: item.noteId })),
    ],
    users: state.users.map((item) =>
      item.id === user.id
        ? {
            ...item,
            displayName: backup.user?.displayName || item.displayName,
            avatarHue: backup.user?.avatarHue ?? item.avatarHue,
            avatarId: backup.user?.avatarId ?? item.avatarId,
          }
        : item,
    ),
  };
  saveNotebook(next);
  return { ok: true };
}
