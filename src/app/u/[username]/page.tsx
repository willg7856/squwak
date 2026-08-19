"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { useNotebook } from "@/components/NotebookProvider";

function ProfileBody() {
  const { username } = useParams<{ username: string }>();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab = tabParam === "journal" || tabParam === "likes" ? tabParam : "notes";
  const { user, notes, journalNotes, likedNotes, stats } = useNotebook();

  if (!user) return null;

  if (username.toLowerCase() !== user.username) {
    return (
      <AppShell title="Profile">
        <EmptyState
          title="This notebook is private."
          body="Squwak only shows your own notes and journal."
        />
      </AppShell>
    );
  }

  const items = tab === "journal" ? journalNotes : tab === "likes" ? likedNotes : notes;
  const tabs = [
    { id: "notes" as const, label: "Notes", href: `/u/${user.username}` },
    { id: "journal" as const, label: "Journal", href: `/u/${user.username}?tab=journal` },
    { id: "likes" as const, label: "Liked", href: `/u/${user.username}?tab=likes` },
  ];

  return (
    <AppShell title={user.displayName}>
      <div className="border-b border-line">
        <div
          className="h-28"
          style={{
            background: `linear-gradient(120deg, hsl(${user.avatarHue} 35% 72%), hsl(${(user.avatarHue + 40) % 360} 30% 58%))`,
          }}
        />
        <div className="px-5 pb-5">
          <div className="-mt-8 flex items-end justify-between">
            <Avatar name={user.displayName} hue={user.avatarHue} size={84} />
            <Link
              href="/settings"
              className="mb-1 rounded-full border border-line px-4 py-2 text-sm font-semibold"
            >
              Edit profile
            </Link>
          </div>
          <h1 className="mt-3 font-serif text-3xl">{user.displayName}</h1>
          <p className="text-muted">@{user.username}</p>
          {user.bio && <p className="mt-3 max-w-xl leading-6">{user.bio}</p>}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>
              <strong>{stats.notes}</strong> notes
            </span>
            <span>
              <strong>{stats.journals}</strong> journal pages
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
      {items.length === 0 ? (
        <EmptyState title="This tab is empty." body="When you write, it will land here." />
      ) : (
        items.map((note) => <NoteCard key={note.id} note={note} />)
      )}
    </AppShell>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileBody />
    </Suspense>
  );
}
