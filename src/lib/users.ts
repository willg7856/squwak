import { getDb } from "./db";
import type { User } from "./types";
import { getUserById } from "./auth";

export type ProfileStats = {
  notes: number;
  journals: number;
  followers: number;
  following: number;
};

export function getProfileStats(userId: string): ProfileStats {
  const db = getDb();
  const notes = (
    db
      .prepare(
        "SELECT COUNT(*) as n FROM notes WHERE user_id = ? AND reply_to_id IS NULL AND kind = 'note'",
      )
      .get(userId) as { n: number }
  ).n;
  const journals = (
    db
      .prepare(
        "SELECT COUNT(*) as n FROM notes WHERE user_id = ? AND reply_to_id IS NULL AND kind = 'journal'",
      )
      .get(userId) as { n: number }
  ).n;
  const followers = (
    db.prepare("SELECT COUNT(*) as n FROM follows WHERE following_id = ?").get(userId) as {
      n: number;
    }
  ).n;
  const following = (
    db.prepare("SELECT COUNT(*) as n FROM follows WHERE follower_id = ?").get(userId) as {
      n: number;
    }
  ).n;
  return { notes, journals, followers, following };
}

export function isFollowing(followerId: string, followingId: string): boolean {
  return Boolean(
    getDb()
      .prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?")
      .get(followerId, followingId),
  );
}

export function toggleFollow(followerId: string, followingId: string): { following: boolean } {
  if (followerId === followingId) return { following: false };
  const existing = isFollowing(followerId, followingId);
  if (existing) {
    getDb()
      .prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?")
      .run(followerId, followingId);
  } else {
    getDb()
      .prepare("INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)")
      .run(followerId, followingId, Date.now());
  }
  return { following: !existing };
}

export function suggestedUsers(viewerId: string | null, limit = 3): User[] {
  const rows = getDb()
    .prepare(
      `SELECT id FROM users
       WHERE id != COALESCE(?, '')
         AND id NOT IN (SELECT following_id FROM follows WHERE follower_id = COALESCE(?, ''))
       ORDER BY created_at ASC
       LIMIT ?`,
    )
    .all(viewerId, viewerId, limit) as { id: string }[];
  return rows.map((row) => getUserById(row.id)!).filter(Boolean);
}

export function listDemoUsers(): { username: string; displayName: string }[] {
  return [
    { username: "willow", displayName: "Willow Chen" },
    { username: "kai", displayName: "Kai Okonkwo" },
    { username: "mira", displayName: "Mira Solano" },
    { username: "juniper", displayName: "Juniper Hale" },
  ];
}
