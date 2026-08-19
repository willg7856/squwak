import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedIfEmpty } from "./seed";

const globalForDb = globalThis as unknown as { squwakDb?: DatabaseSync };

function databasePath() {
  if (process.env.SQLITE_PATH) return process.env.SQLITE_PATH;
  if (process.env.VERCEL) return "/tmp/squwak.db";
  return path.join(process.cwd(), "data", "squwak.db");
}

function migrate(db: DatabaseSync) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      bio TEXT NOT NULL DEFAULT '',
      avatar_hue INTEGER NOT NULL DEFAULT 20,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('note', 'journal')),
      mood TEXT,
      visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
      reply_to_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, note_id)
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, note_id)
    );

    CREATE TABLE IF NOT EXISTS follows (
      follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (follower_id, following_id)
    );

    CREATE INDEX IF NOT EXISTS notes_created_at ON notes(created_at DESC);
    CREATE INDEX IF NOT EXISTS notes_user_id ON notes(user_id);
    CREATE INDEX IF NOT EXISTS notes_reply_to ON notes(reply_to_id);
  `);
}

export function getDb(): DatabaseSync {
  if (globalForDb.squwakDb) return globalForDb.squwakDb;

  const file = databasePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  migrate(db);
  seedIfEmpty(db);
  globalForDb.squwakDb = db;
  return db;
}
