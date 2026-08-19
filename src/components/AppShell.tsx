"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { dailyPrompt } from "@/lib/time";
import { Avatar } from "./Avatar";
import {
  BirdMark,
  BookIcon,
  BookmarkIcon,
  CompassIcon,
  GearIcon,
  HomeIcon,
} from "./Icons";
import { useNotebook } from "./NotebookProvider";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/explore", label: "Search", icon: CompassIcon },
  { href: "/journal", label: "Journal", icon: BookIcon },
  { href: "/bookmarks", label: "Saved", icon: BookmarkIcon },
];

export function AppShell({
  title,
  headerNav,
  children,
  showRail = true,
}: {
  title: string;
  headerNav?: { href: string; label: string; active: boolean }[];
  children: ReactNode;
  showRail?: boolean;
}) {
  const { user, tags, logout } = useNotebook();
  const prompt = dailyPrompt();

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)_300px]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line px-4 py-6 md:flex">
        <Link href={user ? "/home" : "/"} className="mb-8 flex items-center gap-2.5 px-2">
          <BirdMark className="h-9 w-9 text-accent" />
          <span className="font-serif text-2xl tracking-tight text-ink">Squwak</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-full px-3 py-2.5 text-[17px] font-medium text-ink hover:bg-paper-2"
            >
              <item.icon className="h-6 w-6" />
              {item.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-full px-3 py-2.5 text-[17px] font-medium text-ink hover:bg-paper-2"
            >
              <GearIcon className="h-6 w-6" />
              Settings
            </Link>
          )}
        </nav>
        {user ? (
          <div className="mt-auto space-y-3">
            <Link
              href="/home"
              className="btn-accent block rounded-full py-3 text-center font-semibold"
            >
              New note
            </Link>
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-full px-3 py-2 text-left text-sm text-muted hover:bg-paper-2"
            >
              Sign out @{user.username}
            </button>
          </div>
        ) : (
          <Link
            href="/signup"
            className="btn-accent mt-auto block rounded-full py-3 text-center font-semibold"
          >
            Start a notebook
          </Link>
        )}
      </aside>

      <main className="min-w-0 border-line md:border-r">
        <header className="sticky top-0 z-10 border-b border-line bg-paper/85 backdrop-blur">
          <div className="flex items-center gap-2 px-2 md:px-3">
            <Link href="/home" className="shrink-0 md:hidden">
              <BirdMark className="h-8 w-8 text-accent" />
            </Link>
            {headerNav ? (
              <nav className="flex min-w-0 flex-1">
                {headerNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex-1 py-3 text-center text-sm font-semibold ${
                      item.active
                        ? "border-b-2 border-accent text-ink"
                        : "border-b-2 border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            ) : (
              <h1 className="min-w-0 flex-1 px-2 py-3 font-serif text-xl text-ink">{title}</h1>
            )}
            <div className="flex shrink-0 items-center gap-1">
              <ThemeToggle />
              {user && (
                <Link href="/settings" className="md:hidden">
                  <Avatar
                    name={user.displayName}
                    hue={user.avatarHue}
                    avatarId={user.avatarId}
                    size={32}
                  />
                </Link>
              )}
            </div>
          </div>
        </header>
        {children}
        <nav className="sticky bottom-0 z-10 grid grid-cols-4 border-t border-line bg-paper/95 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1 text-[11px] text-ink"
            >
              <item.icon className="h-5 w-5 text-ink" />
              {item.label}
            </Link>
          ))}
        </nav>
      </main>

      {showRail && (
        <aside className="sticky top-0 hidden h-screen overflow-y-auto p-4 lg:block">
          <div className="space-y-4">
            <Link
              href="/explore"
              className="block rounded-2xl border border-line bg-paper-2 px-4 py-3 text-sm text-ink"
            >
              Search your notes
            </Link>

            <section className="rounded-2xl border border-line bg-paper-2 p-4">
              <h2 className="font-serif text-lg text-ink">Today’s prompt</h2>
              <p className="mt-2 font-journal text-[1.05rem] leading-7 text-ink">{prompt}</p>
              <Link href="/journal" className="mt-3 inline-block text-sm font-semibold text-accent">
                Write a page →
              </Link>
            </section>

            <section className="rounded-2xl border border-line bg-paper-2 p-4">
              <h2 className="font-serif text-lg text-ink">Your tags</h2>
              <ul className="mt-3 space-y-2">
                {tags.length === 0 && <li className="text-sm text-muted">Tags appear when you use #words.</li>}
                {tags.map((item) => (
                  <li key={item.tag}>
                    <Link href={`/explore?q=${encodeURIComponent(item.tag)}`} className="block">
                      <div className="font-semibold">#{item.tag}</div>
                      <div className="text-xs text-muted">{item.count} notes</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      )}
    </div>
  );
}
