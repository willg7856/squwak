"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useNotebook } from "@/components/NotebookProvider";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { user, updateProfile, updatePassword } = useNotebook();
  const { theme, setTheme } = useTheme();
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  if (!user) return null;

  return (
    <AppShell title="Settings" showRail={false}>
      <div className="space-y-8 px-5 py-6">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const result = updateProfile({
              displayName: String(form.get("displayName") ?? ""),
              bio: String(form.get("bio") ?? ""),
            });
            setProfileMessage(result.ok ? "saved" : result.error);
          }}
        >
          <h2 className="font-serif text-2xl">Profile</h2>
          {profileMessage === "saved" && (
            <p className="rounded-xl bg-sky/10 px-3 py-2 text-sm text-sky">Saved.</p>
          )}
          {profileMessage === "name" && (
            <p className="rounded-xl bg-heart/10 px-3 py-2 text-sm text-heart">
              Display name needs at least 2 characters.
            </p>
          )}
          <label className="block text-sm font-medium">
            Display name
            <input
              name="displayName"
              defaultValue={user.displayName}
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm font-medium">
            Bio
            <textarea
              name="bio"
              defaultValue={user.bio}
              maxLength={180}
              rows={3}
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-accent"
            />
          </label>
          <p className="text-sm text-muted">Username @{user.username} stays put.</p>
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">
            Save profile
          </button>
        </form>

        <div className="space-y-3 border-t border-line pt-8">
          <h2 className="font-serif text-2xl">Appearance</h2>
          <p className="text-sm text-muted">Choose a light or dark notebook.</p>
          <div className="inline-flex rounded-full bg-paper-2 p-1 text-sm">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`rounded-full px-3 py-1 font-medium ${theme === "light" ? "bg-card text-ink shadow-sm" : "text-muted"}`}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`rounded-full px-3 py-1 font-medium ${theme === "dark" ? "bg-card text-ink shadow-sm" : "text-muted"}`}
            >
              Dark
            </button>
          </div>
        </div>

        <form
          className="space-y-3 border-t border-line pt-8"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const result = updatePassword(String(form.get("password") ?? ""));
            setPasswordMessage(result.ok ? "saved" : result.error);
            if (result.ok) event.currentTarget.reset();
          }}
        >
          <h2 className="font-serif text-2xl">Password</h2>
          {passwordMessage === "saved" && (
            <p className="rounded-xl bg-sky/10 px-3 py-2 text-sm text-sky">Saved.</p>
          )}
          {passwordMessage === "password" && (
            <p className="rounded-xl bg-heart/10 px-3 py-2 text-sm text-heart">
              Password needs at least 6 characters.
            </p>
          )}
          <label className="block text-sm font-medium">
            New password
            <input
              name="password"
              type="password"
              minLength={6}
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-accent"
            />
          </label>
          <button className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
            Update password
          </button>
        </form>
      </div>
    </AppShell>
  );
}
