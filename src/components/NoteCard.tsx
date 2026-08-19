"use client";

import Link from "next/link";
import { formatFullDate, relativeTime } from "@/lib/time";
import { renderRichText } from "@/lib/text";
import { MOODS, type NoteCardData } from "@/lib/types";
import { Avatar } from "./Avatar";
import { BookmarkIcon, ReplyIcon } from "./Icons";
import { NoteImageGrid } from "./NoteImages";
import { useNotebook } from "./NotebookProvider";

export function NoteCard({
  note,
  showThreadLink = true,
}: {
  note: NoteCardData;
  showThreadLink?: boolean;
}) {
  const { user, toggleBookmark, deleteNote } = useNotebook();
  const mood = MOODS.find((item) => item.id === note.mood);
  const isOwner = user?.id === note.userId;
  const bodyClass = note.kind === "journal" ? "font-journal text-[1.05rem] leading-7" : "leading-6";

  return (
    <article className="paper-card group relative border-x-0 px-4 py-4 first:border-t-0 sm:px-5">
      <div className="flex gap-3">
        <Avatar name={note.displayName} hue={note.avatarHue} href={`/u/${note.username}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link href={`/u/${note.username}`} className="font-semibold text-ink hover:underline">
              {note.displayName}
            </Link>
            <span className="text-sm text-muted">@{note.username}</span>
            <span className="text-sm text-muted" title={formatFullDate(note.createdAt)}>
              · {relativeTime(note.createdAt)}
            </span>
            {note.kind === "journal" && (
              <span className="rounded-full bg-plum/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-plum">
                Journal
              </span>
            )}
          </div>

          {mood && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: mood.swatch }}
                aria-hidden
              />
              {mood.label}
            </div>
          )}

          {note.body.trim() ? (
            <p className={`mt-2 whitespace-pre-wrap break-words text-ink ${bodyClass}`}>
              {renderRichText(note.body)}
            </p>
          ) : null}

          <NoteImageGrid ids={note.imageIds} />

          <div className="mt-3 flex items-center gap-1 text-muted">
            {showThreadLink && (
              <Link
                href={`/n/${note.id}`}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm hover:bg-sky/10 hover:text-sky"
              >
                <ReplyIcon className="h-4 w-4" />
                <span>{note.replyCount || ""}</span>
                <span className="sr-only">replies</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => toggleBookmark(note.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm hover:bg-accent/10 hover:text-accent ${note.bookmarked ? "text-accent" : ""}`}
              aria-label={note.bookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <BookmarkIcon className="h-4 w-4" filled={note.bookmarked} />
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={() => deleteNote(note.id)}
                className="ml-auto rounded-full px-2 py-1 text-xs text-muted hover:bg-heart/10 hover:text-heart"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-muted">{body}</p>
    </div>
  );
}
