"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/images";
import { JOURNAL_LIMIT, MAX_NOTE_IMAGES, MOODS, NOTE_LIMIT, type Mood, type NoteKind } from "@/lib/types";
import { Avatar } from "./Avatar";
import { EmojiPicker } from "./EmojiPicker";
import { CloseIcon, EmojiIcon, ImageIcon } from "./Icons";
import { useNotebook } from "./NotebookProvider";

type DraftImage = { key: string; blob: Blob; url: string };

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const [kind, setKind] = useState<NoteKind>(replyToId ? "note" : defaultKind);
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<Mood | "">("");
  const [images, setImages] = useState<DraftImage[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const imagesRef = useRef<DraftImage[]>([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const limit = kind === "journal" ? JOURNAL_LIMIT : NOTE_LIMIT;
  const remaining = limit - body.length;
  const canPost = Boolean(body.trim() || images.length) && !busy;
  const placeholder = useMemo(() => {
    if (replyToId) return "Write a reply…";
    if (kind === "journal") return prompt ?? "What stayed with you today?";
    return "A note, a thought, a scrap of the day…";
  }, [kind, prompt, replyToId]);

  useEffect(() => {
    return () => {
      for (const image of imagesRef.current) URL.revokeObjectURL(image.url);
    };
  }, []);

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? body.length;
    const end = textarea?.selectionEnd ?? body.length;
    const next = `${body.slice(0, start)}${emoji}${body.slice(end)}`;
    if (next.length > limit) return;
    setBody(next);
    requestAnimationFrame(() => {
      textarea?.focus();
      const pos = start + emoji.length;
      textarea?.setSelectionRange(pos, pos);
    });
  }

  async function onPickFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError("");
    const remainingSlots = MAX_NOTE_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`You can attach up to ${MAX_NOTE_IMAGES} photos.`);
      return;
    }
    const files = [...fileList].slice(0, remainingSlots);
    try {
      const next: DraftImage[] = [];
      for (const file of files) {
        const blob = await compressImage(file);
        next.push({ key: crypto.randomUUID(), blob, url: URL.createObjectURL(blob) });
      }
      setImages((current) => [...current, ...next]);
    } catch {
      setError("That photo could not be added. Try a smaller jpg, png, or gif.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(key: string) {
    setImages((current) => {
      const target = current.find((image) => image.key === key);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((image) => image.key !== key);
    });
  }

  if (!user) return null;

  return (
    <form
      className="paper-card border-x-0 px-4 py-4 sm:px-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!canPost) return;
        setBusy(true);
        setError("");
        const noteId = await createNote({
          body,
          kind,
          mood: mood || null,
          replyToId,
          images: images.map((image) => image.blob),
        });
        setBusy(false);
        if (!noteId) {
          setError("Could not save that note.");
          return;
        }
        for (const image of images) URL.revokeObjectURL(image.url);
        setBody("");
        setMood("");
        setImages([]);
        setEmojiOpen(false);
        if (replyToId) router.push(`/n/${replyToId}`);
        else if (kind === "journal") router.push("/journal");
      }}
    >
      <div className="flex gap-3">
        <Avatar name={user.displayName} hue={user.avatarHue} avatarId={user.avatarId} />
        <div className="min-w-0 flex-1">
          {!replyToId && (
            <div className="mb-3 inline-flex rounded-full border border-line bg-paper-2 p-1 text-sm">
              <button
                type="button"
                onClick={() => setKind("note")}
                className={`rounded-full px-3 py-1 font-medium ${kind === "note" ? "bg-card text-ink shadow-sm" : "text-muted"}`}
              >
                Note
              </button>
              <button
                type="button"
                onClick={() => setKind("journal")}
                className={`rounded-full px-3 py-1 font-medium ${kind === "journal" ? "bg-card text-ink shadow-sm" : "text-muted"}`}
              >
                Journal
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={body}
            onChange={(event) => setBody(event.target.value.slice(0, limit))}
            placeholder={placeholder}
            rows={kind === "journal" ? 5 : 3}
            className={`w-full resize-none bg-transparent text-[17px] text-ink outline-none placeholder:text-muted ${kind === "journal" ? "font-journal leading-7" : "leading-6"}`}
          />

          {images.length > 0 && (
            <div className={`mt-3 overflow-hidden rounded-2xl border border-line ${images.length === 1 ? "" : "grid grid-cols-2 gap-0.5 bg-line"}`}>
              {images.map((image) => (
                <div key={image.key} className="relative">
                  {
                    // Object URLs are local drafts, not a remote image CDN.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.url}
                      alt=""
                      className={images.length === 1 ? "max-h-72 w-full object-cover" : "h-36 w-full object-cover"}
                    />
                  }
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => removeImage(image.key)}
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink/80 text-paper hover:bg-ink"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

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

          {error && <p className="mt-3 text-sm text-heart">{error}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => onPickFiles(event.target.files)}
            />
            <button
              type="button"
              aria-label="Add photo"
              disabled={images.length >= MAX_NOTE_IMAGES}
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-accent hover:bg-accent/10 disabled:opacity-40"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                ref={emojiButtonRef}
                type="button"
                aria-label="Add emoji"
                aria-expanded={emojiOpen}
                onClick={() => setEmojiOpen((open) => !open)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-accent hover:bg-accent/10"
              >
                <EmojiIcon className="h-5 w-5" />
              </button>
              <EmojiPicker
                open={emojiOpen}
                anchorRef={emojiButtonRef}
                onClose={() => setEmojiOpen(false)}
                onPick={insertEmoji}
              />
            </div>
            <span
              className={`ml-auto text-sm tabular-nums ${remaining < 20 ? "text-heart" : "text-muted"}`}
            >
              {remaining}
            </span>
            <button
              type="submit"
              disabled={!canPost}
              className="btn-accent rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {replyToId ? "Reply" : kind === "journal" ? "Keep page" : "Squwak"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
