"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { JOURNAL_LIMIT, MOODS, NOTE_LIMIT, type Mood, type NoteKind } from "@/lib/types";
import { Avatar } from "./Avatar";
import { useNotebook } from "./NotebookProvider";

export function Composer({
  defaultKind = "note",
  replyToId,
  prompt,
}: {
  defaultKind?: NoteKind;
  replyToId?: string;
  prompt?: string;
}) {
  const { user, createNote } = useNotebook();
  const router = useRouter();
  const [kind, setKind] = useState<NoteKind>(replyToId ? "note" : defaultKind);
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<Mood | "">("");
  const [isPrivate, setIsPrivate] = useState(true);

  const limit = kind === "journal" ? JOURNAL_LIMIT : NOTE_LIMIT;
  const remaining = limit - body.length;
  const placeholder = useMemo(() => {
    if (replyToId) return "Write a reply…";
    if (kind === "journal") return prompt ?? "What stayed with you today?";
    return "A note, a thought, a scrap of the day…";
  }, [kind, prompt, replyToId]);

  if (!user) return null;

  return (
    <form
      className="paper-card border-x-0 px-4 py-4 sm:px-5"
      onSubmit={(event) => {
        event.preventDefault();
        const noteId = createNote({
          body,
          kind,
          mood: mood || null,
          visibility: isPrivate ? "private" : "public",
          replyToId,
        });
        if (!noteId) return;
        setBody("");
        setMood("");
        if (replyToId) router.push(`/n/${replyToId}`);
        else if (kind === "journal") router.push("/journal");
      }}
    >
      <div className="flex gap-3">
        <Avatar name={user.displayName} hue={user.avatarHue} />
        <div className="min-w-0 flex-1">
          {!replyToId && (
            <div className="mb-3 inline-flex rounded-full bg-paper-2 p-1 text-sm">
              <button
                type="button"
                onClick={() => setKind("note")}
                className={`rounded-full px-3 py-1 font-medium ${kind === "note" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
              >
                Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setKind("journal");
                  setIsPrivate(true);
                }}
                className={`rounded-full px-3 py-1 font-medium ${kind === "journal" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
              >
                Journal
              </button>
            </div>
          )}

          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value.slice(0, limit))}
            placeholder={placeholder}
            rows={kind === "journal" ? 5 : 3}
            className={`w-full resize-none bg-transparent text-[17px] outline-none placeholder:text-muted/70 ${kind === "journal" ? "font-journal leading-7" : "leading-6"}`}
            required
          />

          {kind === "journal" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {MOODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMood(mood === item.id ? "" : item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                    mood === item.id
                      ? "border-ink bg-ink text-paper"
                      : "border-line text-muted hover:border-ink/40"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: item.swatch }}
                    aria-hidden
                  />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {!replyToId && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(event) => setIsPrivate(event.target.checked)}
                  className="accent-accent"
                />
                Keep private
              </label>
            )}
            <span
              className={`ml-auto text-sm tabular-nums ${remaining < 20 ? "text-heart" : "text-muted"}`}
            >
              {remaining}
            </span>
            <button
              type="submit"
              disabled={!body.trim()}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {replyToId ? "Reply" : kind === "journal" ? "Keep page" : "Squwak"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
