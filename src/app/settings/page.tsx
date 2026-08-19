"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { ImageIcon } from "@/components/Icons";
import { useNotebook } from "@/components/NotebookProvider";
import { useTheme } from "@/components/ThemeProvider";
import { compressAvatar } from "@/lib/images";
import { exportNotebook, importNotebook, type NotebookBackup } from "@/lib/backup";

const ERRORS: Record<string, string> = {
  name: "Display name needs 2–40 characters.",
  username: "Usernames should be 3–20 characters: letters, numbers, underscore.",
  taken: "That username is already saved in this browser.",
  invalid: "Could not save those changes.",
  photo: "That photo could not be used. Try a jpg or png.",
};

export default function SettingsPage() {
  const { user, updateProfile, updatePassword } = useNotebook();
  const { theme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [avatar, setAvatar] = useState<Blob | null | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!user) return null;

  async function onPickPhoto(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setProfileMessage(null);
    try {
      const blob = await compressAvatar(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setAvatar(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setProfileMessage("photo");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAvatar(null);
  }

  return (
    <AppShell title="Settings" showRail={false}>
      <div className="space-y-8 px-5 py-6">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setProfileMessage(null);
            const result = await updateProfile({
              displayName,
              username,
              avatar,
            });
            setBusy(false);
            setProfileMessage(result.ok ? "saved" : result.error);
            if (result.ok) {
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
              setAvatar(undefined);
            }
          }}
        >
          <h2 className="font-serif text-2xl">Account</h2>
          {profileMessage === "saved" && (
            <p className="rounded-xl bg-sky/10 px-3 py-2 text-sm text-sky">Saved.</p>
          )}
          {profileMessage && profileMessage !== "saved" && (
            <p className="rounded-xl bg-heart/10 px-3 py-2 text-sm text-heart">
              {ERRORS[profileMessage] ?? ERRORS.invalid}
            </p>
          )}

          <div className="flex items-center gap-4">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onPickPhoto(event.target.files)}
            />
            <button
              type="button"
              aria-label="Change profile photo"
              onClick={() => fileRef.current?.click()}
              className="relative shrink-0"
            >
              <Avatar
                name={displayName || user.displayName}
                hue={user.avatarHue}
                avatarId={avatar === null ? null : user.avatarId}
                src={previewUrl}
                size={84}
              />
              <span className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-on-accent shadow-sm">
                <ImageIcon className="h-4 w-4" />
              </span>
            </button>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="block text-sm font-semibold text-accent"
              >
                Change photo
              </button>
              {(previewUrl || (user.avatarId && avatar !== null)) && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="block text-sm text-muted hover:text-heart"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <label className="block text-sm font-medium">
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value.slice(0, 40))}
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm font-medium">
            Username
            <span className="mt-1 flex items-center rounded-xl border border-line bg-paper focus-within:border-accent">
              <span className="pl-3 text-muted">@</span>
              <input
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))
                }
                className="w-full bg-transparent px-1 py-2.5 text-ink outline-none"
              />
            </span>
          </label>
          <button
            disabled={busy}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-40"
          >
            Save
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

        <div className="space-y-3 border-t border-line pt-8">
          <h2 className="font-serif text-2xl">Backup</h2>
          <p className="text-sm text-muted">
            This notebook lives in this browser. Export a copy if you switch devices, or before
            clearing site data.
          </p>
          {backupMessage === "exported" && (
            <p className="rounded-xl bg-sky/10 px-3 py-2 text-sm text-sky">Downloaded a backup.</p>
          )}
          {backupMessage === "imported" && (
            <p className="rounded-xl bg-sky/10 px-3 py-2 text-sm text-sky">Notebook restored.</p>
          )}
          {backupMessage && backupMessage !== "exported" && backupMessage !== "imported" && (
            <p className="rounded-xl bg-heart/10 px-3 py-2 text-sm text-heart">{backupMessage}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper"
              onClick={async () => {
                const backup = await exportNotebook();
                if (!backup) {
                  setBackupMessage("Could not export.");
                  return;
                }
                const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `squwak-backup-${new Date().toISOString().slice(0, 10)}.json`;
                link.click();
                URL.revokeObjectURL(url);
                setBackupMessage("exported");
              }}
            >
              Export notebook
            </button>
            <label className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
              Import backup
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  try {
                    const parsed = JSON.parse(await file.text()) as NotebookBackup;
                    const result = await importNotebook(parsed);
                    setBackupMessage(result.ok ? "imported" : "That file could not be restored.");
                  } catch {
                    setBackupMessage("That file could not be restored.");
                  }
                }}
              />
            </label>
          </div>
          <p className="text-xs text-muted">
            Shortcuts: <kbd>n</kbd> new note, <kbd>j</kbd> journal, <kbd>/</kbd> search,{" "}
            <kbd>⌘</kbd>+<kbd>Enter</kbd> to post.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
