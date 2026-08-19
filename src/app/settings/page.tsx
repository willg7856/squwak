import { AppShell } from "@/components/AppShell";
import { updatePasswordAction, updateProfileAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { saved, error } = await searchParams;

  return (
    <AppShell user={user} title="Settings" showRail={false}>
      <div className="space-y-8 px-5 py-6">
        {saved && (
          <p className="rounded-xl bg-sky/10 px-3 py-2 text-sm text-sky">Saved.</p>
        )}
        {error === "name" && (
          <p className="rounded-xl bg-heart/10 px-3 py-2 text-sm text-heart">
            Display name needs at least 2 characters.
          </p>
        )}
        {error === "password" && (
          <p className="rounded-xl bg-heart/10 px-3 py-2 text-sm text-heart">
            Password needs at least 6 characters.
          </p>
        )}

        <form action={updateProfileAction} className="space-y-3">
          <h2 className="font-serif text-2xl">Profile</h2>
          <label className="block text-sm font-medium">
            Display name
            <input
              name="displayName"
              defaultValue={user.displayName}
              className="mt-1 w-full rounded-xl border border-line bg-white/70 px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm font-medium">
            Bio
            <textarea
              name="bio"
              defaultValue={user.bio}
              maxLength={180}
              rows={3}
              className="mt-1 w-full rounded-xl border border-line bg-white/70 px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <p className="text-sm text-muted">Username @{user.username} stays put.</p>
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">
            Save profile
          </button>
        </form>

        <form action={updatePasswordAction} className="space-y-3 border-t border-line pt-8">
          <h2 className="font-serif text-2xl">Password</h2>
          <label className="block text-sm font-medium">
            New password
            <input
              name="password"
              type="password"
              minLength={6}
              className="mt-1 w-full rounded-xl border border-line bg-white/70 px-3 py-2.5 outline-none focus:border-accent"
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
