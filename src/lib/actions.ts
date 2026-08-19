"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  clearSession,
  createSession,
  createUser,
  getCurrentUser,
  updatePassword,
  updateUser,
  usernameAvailable,
  verifyLogin,
} from "./auth";
import {
  createNote,
  deleteNote,
  toggleBookmark,
  toggleLike,
} from "./notes";
import { toggleFollow } from "./users";
import { JOURNAL_LIMIT, NOTE_LIMIT, type Mood, type NoteKind, type Visibility } from "./types";

function revalidateNotePaths(username?: string, noteId?: string) {
  revalidatePath("/home");
  revalidatePath("/explore");
  revalidatePath("/journal");
  revalidatePath("/bookmarks");
  if (username) revalidatePath(`/u/${username}`);
  if (noteId) revalidatePath(`/n/${noteId}`);
}

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const user = verifyLogin(username, password);
  if (!user) {
    redirect("/login?error=invalid");
  }
  await createSession(user);
  redirect("/home");
}

export async function demoLoginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "willow");
  const user = verifyLogin(username, "squwak");
  if (!user) redirect("/login?error=invalid");
  await createSession(user);
  redirect("/home");
}

export async function signupAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    redirect("/signup?error=username");
  }
  if (displayName.length < 2 || displayName.length > 40) {
    redirect("/signup?error=name");
  }
  if (password.length < 6) {
    redirect("/signup?error=password");
  }
  if (!usernameAvailable(username)) {
    redirect("/signup?error=taken");
  }

  const user = createUser({ username, displayName, password });
  await createSession(user);
  redirect("/home");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function createNoteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const kind = (String(formData.get("kind") ?? "note") as NoteKind) === "journal" ? "journal" : "note";
  const body = String(formData.get("body") ?? "").trim();
  const moodRaw = String(formData.get("mood") ?? "");
  const visibility: Visibility =
    String(formData.get("visibility") ?? "public") === "private" ? "private" : "public";
  const replyToId = String(formData.get("replyToId") ?? "") || null;
  const mood = (moodRaw || null) as Mood | null;

  const limit = kind === "journal" ? JOURNAL_LIMIT : NOTE_LIMIT;
  if (!body || body.length > limit) {
    redirect(replyToId ? `/n/${replyToId}` : "/home");
  }

  const note = createNote({
    userId: user.id,
    body,
    kind: replyToId ? "note" : kind,
    mood: kind === "journal" ? mood : null,
    visibility: replyToId ? "public" : visibility,
    replyToId,
  });

  revalidateNotePaths(user.username, replyToId ?? note.id);
  redirect(replyToId ? `/n/${replyToId}` : note.kind === "journal" ? "/journal" : "/home");
}

export async function deleteNoteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  deleteNote(id, user.id);
  revalidateNotePaths(user.username, id);
}

export async function toggleLikeAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  toggleLike(id, user.id);
  revalidateNotePaths(user.username, id);
}

export async function toggleBookmarkAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  toggleBookmark(id, user.id);
  revalidateNotePaths(user.username, id);
}

export async function toggleFollowAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const username = String(formData.get("username") ?? "");
  const { getUserByUsername } = await import("./auth");
  const target = getUserByUsername(username);
  if (!target) return;
  toggleFollow(user.id, target.id);
  revalidatePath(`/u/${username}`);
  revalidatePath("/home");
  revalidatePath("/explore");
}

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const displayName = String(formData.get("displayName") ?? "");
  const bio = String(formData.get("bio") ?? "");
  if (displayName.trim().length < 2) redirect("/settings?error=name");
  updateUser(user.id, { displayName, bio: bio.slice(0, 180) });
  revalidatePath(`/u/${user.username}`);
  revalidatePath("/settings");
  redirect("/settings?saved=1");
}

export async function updatePasswordAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) redirect("/settings?error=password");
  updatePassword(user.id, password);
  redirect("/settings?saved=1");
}
