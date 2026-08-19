import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { FollowButton } from "@/components/FollowButton";
import { getCurrentUser, getUserByUsername } from "@/lib/auth";
import { listProfileNotes } from "@/lib/notes";
import { getProfileStats, isFollowing } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === "journal" || tabParam === "likes" ? tabParam : "notes";
  const profile = getUserByUsername(username);
  if (!profile) notFound();

  const user = await getCurrentUser();
  const stats = getProfileStats(profile.id);
  const following = user ? isFollowing(user.id, profile.id) : false;
  const notes = listProfileNotes(profile.id, user?.id ?? null, tab);
  const isSelf = user?.id === profile.id;

  const tabs = [
    { id: "notes" as const, label: "Notes", href: `/u/${profile.username}` },
    { id: "journal" as const, label: "Journal", href: `/u/${profile.username}?tab=journal` },
    { id: "likes" as const, label: "Likes", href: `/u/${profile.username}?tab=likes` },
  ];

  return (
    <AppShell user={user} title={profile.displayName}>
      <div className="border-b border-line">
        <div
          className="h-28"
          style={{
            background: `linear-gradient(120deg, hsl(${profile.avatarHue} 35% 72%), hsl(${(profile.avatarHue + 40) % 360} 30% 58%))`,
          }}
        />
        <div className="px-5 pb-5">
          <div className="-mt-8 flex items-end justify-between">
            <Avatar name={profile.displayName} hue={profile.avatarHue} size={84} />
            <div className="mb-1 flex gap-2">
              {isSelf ? (
                <Link
                  href="/settings"
                  className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
                >
                  Edit profile
                </Link>
              ) : (
                <FollowButton username={profile.username} following={following} isSelf={false} />
              )}
            </div>
          </div>
          <h1 className="mt-3 font-serif text-3xl">{profile.displayName}</h1>
          <p className="text-muted">@{profile.username}</p>
          {profile.bio && <p className="mt-3 max-w-xl leading-6">{profile.bio}</p>}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>
              <strong>{stats.notes}</strong> notes
            </span>
            <span>
              <strong>{stats.journals}</strong> journal pages
            </span>
            <span>
              <strong>{stats.followers}</strong> readers
            </span>
            <span>
              <strong>{stats.following}</strong> following
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3">
          {tabs.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`border-b-2 py-3 text-center text-sm font-semibold ${
                tab === item.id ? "border-accent text-ink" : "border-transparent text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      {notes.length === 0 ? (
        <EmptyState title="This tab is empty." body="When they write, it will land here." />
      ) : (
        notes.map((note) => (
          <NoteCard key={note.id} note={note} currentUserId={user?.id ?? null} />
        ))
      )}
    </AppShell>
  );
}
