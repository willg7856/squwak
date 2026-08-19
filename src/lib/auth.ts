import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import type { User } from "./types";

const COOKIE = "squwak_session";

function secretKey() {
  const secret = process.env.SESSION_SECRET ?? "dev-squwak-secret-change-me";
  return new TextEncoder().encode(secret);
}

type SessionPayload = { sub: string; username: string };

function mapUser(row: {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_hue: number;
  created_at: number;
}): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarHue: row.avatar_hue,
    createdAt: row.created_at,
  };
}

export async function createSession(user: User) {
  const token = await new SignJWT({ username: user.username } satisfies Omit<SessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function readSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await readSessionUserId();
  if (!userId) return null;
  return getUserById(userId);
}

export function getUserById(id: string): User | null {
  const row = getDb()
    .prepare(
      `SELECT id, username, display_name, bio, avatar_hue, created_at
       FROM users WHERE id = ?`,
    )
    .get(id) as
    | {
        id: string;
        username: string;
        display_name: string;
        bio: string;
        avatar_hue: number;
        created_at: number;
      }
    | undefined;
  return row ? mapUser(row) : null;
}

export function getUserByUsername(username: string): User | null {
  const row = getDb()
    .prepare(
      `SELECT id, username, display_name, bio, avatar_hue, created_at
       FROM users WHERE lower(username) = lower(?)`,
    )
    .get(username) as
    | {
        id: string;
        username: string;
        display_name: string;
        bio: string;
        avatar_hue: number;
        created_at: number;
      }
    | undefined;
  return row ? mapUser(row) : null;
}

export function verifyLogin(username: string, password: string): User | null {
  const row = getDb()
    .prepare(
      `SELECT id, username, display_name, bio, avatar_hue, created_at, password_hash
       FROM users WHERE lower(username) = lower(?)`,
    )
    .get(username) as
    | {
        id: string;
        username: string;
        display_name: string;
        bio: string;
        avatar_hue: number;
        created_at: number;
        password_hash: string;
      }
    | undefined;
  if (!row) return null;
  if (!bcrypt.compareSync(password, row.password_hash)) return null;
  return mapUser(row);
}

export function createUser(input: {
  username: string;
  displayName: string;
  password: string;
}): User {
  const id = crypto.randomUUID();
  const username = input.username.trim().toLowerCase();
  getDb()
    .prepare(
      `INSERT INTO users (id, username, display_name, bio, avatar_hue, password_hash, created_at)
       VALUES (?, ?, ?, '', ?, ?, ?)`,
    )
    .run(
      id,
      username,
      input.displayName.trim(),
      Math.floor(Math.random() * 360),
      bcrypt.hashSync(input.password, 10),
      Date.now(),
    );

  const follow = getDb().prepare(
    "INSERT OR IGNORE INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)",
  );
  for (const demo of ["user-willow", "user-kai", "user-mira", "user-juniper"]) {
    follow.run(id, demo, Date.now());
  }

  return getUserById(id)!;
}

export function updateUser(
  userId: string,
  input: { displayName: string; bio: string },
): User {
  getDb()
    .prepare("UPDATE users SET display_name = ?, bio = ? WHERE id = ?")
    .run(input.displayName.trim(), input.bio.trim(), userId);
  return getUserById(userId)!;
}

export function updatePassword(userId: string, password: string) {
  getDb()
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .run(bcrypt.hashSync(password, 10), userId);
}

export function usernameAvailable(username: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM users WHERE lower(username) = lower(?)")
    .get(username);
  return !row;
}
