import { getDb } from "./db";
import type { Mood, NoteCardData, NoteKind, Visibility } from "./types";

type NoteRow = {
  id: string;
  user_id: string;
  body: string;
  kind: NoteKind;
  mood: Mood | null;
  visibility: Visibility;
  reply_to_id: string | null;
  created_at: number;
  username: string;
  display_name: string;
  avatar_hue: number;
  like_count: number;
  reply_count: number;
  liked: number;
  bookmarked: number;
};

function mapNote(row: NoteRow): NoteCardData {
  return {
    id: row.id,
    userId: row.user_id,
    body: row.body,
    kind: row.kind,
    mood: row.mood,
    visibility: row.visibility,
    replyToId: row.reply_to_id,
    createdAt: row.created_at,
    username: row.username,
    displayName: row.display_name,
    avatarHue: row.avatar_hue,
    likeCount: row.like_count,
    replyCount: row.reply_count,
    liked: Boolean(row.liked),
    bookmarked: Boolean(row.bookmarked),
  };
}

function selectSql(viewerId: string | null) {
  return `
    SELECT
      notes.id,
      notes.user_id,
      notes.body,
      notes.kind,
      notes.mood,
      notes.visibility,
      notes.reply_to_id,
      notes.created_at,
      users.username,
      users.display_name,
      users.avatar_hue,
      (SELECT COUNT(*) FROM likes WHERE likes.note_id = notes.id) AS like_count,
      (SELECT COUNT(*) FROM notes replies WHERE replies.reply_to_id = notes.id) AS reply_count,
      CASE WHEN ? IS NULL THEN 0
           ELSE EXISTS(SELECT 1 FROM likes WHERE likes.note_id = notes.id AND likes.user_id = ?)
      END AS liked,
      CASE WHEN ? IS NULL THEN 0
           ELSE EXISTS(SELECT 1 FROM bookmarks WHERE bookmarks.note_id = notes.id AND bookmarks.user_id = ?)
      END AS bookmarked
    FROM notes
    JOIN users ON users.id = notes.user_id
  `;
}

const viewerArgs = (viewerId: string | null) => [viewerId, viewerId, viewerId, viewerId];

function canSee(note: { visibility: Visibility; userId: string }, viewerId: string | null) {
  return note.visibility === "public" || note.userId === viewerId;
}

export function listHomeNotes(viewerId: string): NoteCardData[] {
  const following = getDb()
    .prepare("SELECT COUNT(*) as n FROM follows WHERE follower_id = ?")
    .get(viewerId) as { n: number };

  const filter =
    following.n > 0
      ? `notes.reply_to_id IS NULL
         AND (
           notes.user_id = ?
           OR (
             notes.visibility = 'public'
             AND notes.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
           )
         )`
      : `notes.reply_to_id IS NULL
         AND (notes.visibility = 'public' OR notes.user_id = ?)`;

  const params =
    following.n > 0
      ? [...viewerArgs(viewerId), viewerId, viewerId]
      : [...viewerArgs(viewerId), viewerId];

  const rows = getDb()
    .prepare(`${selectSql(viewerId)} WHERE ${filter} ORDER BY notes.created_at DESC LIMIT 80`)
    .all(...params) as NoteRow[];
  return rows.map(mapNote);
}

export function listExploreNotes(viewerId: string | null, query?: string): NoteCardData[] {
  const q = query?.trim().replace(/^#/, "") ?? "";
  if (q) {
    const like = `%${q.replaceAll("%", "").replaceAll("_", "")}%`;
    const rows = getDb()
      .prepare(
        `${selectSql(viewerId)}
         WHERE notes.reply_to_id IS NULL
           AND notes.visibility = 'public'
           AND (notes.body LIKE ? OR users.username LIKE ? OR users.display_name LIKE ?)
         ORDER BY notes.created_at DESC
         LIMIT 80`,
      )
      .all(...viewerArgs(viewerId), like, like, like) as NoteRow[];
    return rows.map(mapNote);
  }

  const rows = getDb()
    .prepare(
      `${selectSql(viewerId)}
       WHERE notes.reply_to_id IS NULL AND notes.visibility = 'public'
       ORDER BY notes.created_at DESC
       LIMIT 80`,
    )
    .all(...viewerArgs(viewerId)) as NoteRow[];
  return rows.map(mapNote);
}

export function listJournalNotes(userId: string, viewerId: string | null): NoteCardData[] {
  const rows = getDb()
    .prepare(
      `${selectSql(viewerId)}
       WHERE notes.kind = 'journal'
         AND notes.user_id = ?
         AND notes.reply_to_id IS NULL
         AND (notes.visibility = 'public' OR notes.user_id = ?)
       ORDER BY notes.created_at DESC
       LIMIT 80`,
    )
    .all(...viewerArgs(viewerId), userId, viewerId) as NoteRow[];
  return rows.map(mapNote);
}

export function listProfileNotes(
  userId: string,
  viewerId: string | null,
  tab: "notes" | "journal" | "likes",
): NoteCardData[] {
  if (tab === "likes") {
    const rows = getDb()
      .prepare(
        `${selectSql(viewerId)}
         JOIN likes mine ON mine.note_id = notes.id
         WHERE mine.user_id = ?
           AND notes.reply_to_id IS NULL
           AND (notes.visibility = 'public' OR notes.user_id = ?)
         ORDER BY mine.created_at DESC
         LIMIT 80`,
      )
      .all(...viewerArgs(viewerId), userId, viewerId) as NoteRow[];
    return rows.map(mapNote);
  }

  const kindFilter = tab === "journal" ? "AND notes.kind = 'journal'" : "";
  const rows = getDb()
    .prepare(
      `${selectSql(viewerId)}
       WHERE notes.user_id = ?
         AND notes.reply_to_id IS NULL
         ${kindFilter}
         AND (notes.visibility = 'public' OR notes.user_id = ?)
       ORDER BY notes.created_at DESC
       LIMIT 80`,
    )
    .all(...viewerArgs(viewerId), userId, viewerId) as NoteRow[];
  return rows.map(mapNote);
}

export function listBookmarks(userId: string): NoteCardData[] {
  const rows = getDb()
    .prepare(
      `${selectSql(userId)}
       JOIN bookmarks mine ON mine.note_id = notes.id
       WHERE mine.user_id = ?
         AND (notes.visibility = 'public' OR notes.user_id = ?)
       ORDER BY mine.created_at DESC
       LIMIT 80`,
    )
    .all(...viewerArgs(userId), userId, userId) as NoteRow[];
  return rows.map(mapNote);
}

export function getNote(id: string, viewerId: string | null): NoteCardData | null {
  const row = getDb()
    .prepare(`${selectSql(viewerId)} WHERE notes.id = ?`)
    .get(...viewerArgs(viewerId), id) as NoteRow | undefined;
  if (!row) return null;
  const note = mapNote(row);
  if (!canSee(note, viewerId)) return null;
  return note;
}

export function listReplies(noteId: string, viewerId: string | null): NoteCardData[] {
  const rows = getDb()
    .prepare(
      `${selectSql(viewerId)}
       WHERE notes.reply_to_id = ?
         AND (notes.visibility = 'public' OR notes.user_id = ?)
       ORDER BY notes.created_at ASC`,
    )
    .all(...viewerArgs(viewerId), noteId, viewerId) as NoteRow[];
  return rows.map(mapNote);
}

export function createNote(input: {
  userId: string;
  body: string;
  kind: NoteKind;
  mood: Mood | null;
  visibility: Visibility;
  replyToId?: string | null;
}): NoteCardData {
  const id = crypto.randomUUID();
  getDb()
    .prepare(
      `INSERT INTO notes (id, user_id, body, kind, mood, visibility, reply_to_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.userId,
      input.body.trim(),
      input.kind,
      input.mood,
      input.visibility,
      input.replyToId ?? null,
      Date.now(),
    );
  return getNote(id, input.userId)!;
}

export function deleteNote(id: string, userId: string): boolean {
  const result = getDb().prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").run(id, userId);
  return result.changes > 0;
}

export function toggleLike(noteId: string, userId: string): { liked: boolean; likeCount: number } {
  const existing = getDb()
    .prepare("SELECT 1 FROM likes WHERE note_id = ? AND user_id = ?")
    .get(noteId, userId);
  if (existing) {
    getDb().prepare("DELETE FROM likes WHERE note_id = ? AND user_id = ?").run(noteId, userId);
  } else {
    getDb()
      .prepare("INSERT INTO likes (user_id, note_id, created_at) VALUES (?, ?, ?)")
      .run(userId, noteId, Date.now());
  }
  const likeCount = (
    getDb().prepare("SELECT COUNT(*) as n FROM likes WHERE note_id = ?").get(noteId) as { n: number }
  ).n;
  return { liked: !existing, likeCount };
}

export function toggleBookmark(noteId: string, userId: string): { bookmarked: boolean } {
  const existing = getDb()
    .prepare("SELECT 1 FROM bookmarks WHERE note_id = ? AND user_id = ?")
    .get(noteId, userId);
  if (existing) {
    getDb().prepare("DELETE FROM bookmarks WHERE note_id = ? AND user_id = ?").run(noteId, userId);
  } else {
    getDb()
      .prepare("INSERT INTO bookmarks (user_id, note_id, created_at) VALUES (?, ?, ?)")
      .run(userId, noteId, Date.now());
  }
  return { bookmarked: !existing };
}

export function trendingTags(): { tag: string; count: number }[] {
  const rows = getDb()
    .prepare(
      `SELECT body FROM notes
       WHERE visibility = 'public' AND created_at > ?
       ORDER BY created_at DESC
       LIMIT 200`,
    )
    .all(Date.now() - 1000 * 60 * 60 * 24 * 14) as { body: string }[];

  const counts = new Map<string, number>();
  for (const row of rows) {
    const tags = row.body.match(/#([a-zA-Z][\w-]{0,48})/g) ?? [];
    for (const raw of tags) {
      const tag = raw.slice(1).toLowerCase();
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}
