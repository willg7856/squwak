"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EMOJI_CATEGORIES, searchEmojis, type EmojiCategorySlug } from "@/lib/emoji";

const PANEL_WIDTH = 336;

export function EmojiPicker({
  open,
  anchorRef,
  onClose,
  onPick,
}: {
  open: boolean;
  anchorRef: { current: HTMLElement | null };
  onClose: () => void;
  onPick: (emoji: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<EmojiCategorySlug>("smileys_emotion");
  const [position, setPosition] = useState({ top: 0, left: 0, maxHeight: 360 });
  const searching = query.trim().length > 0;
  const matches = useMemo(
    () => searchEmojis(query, searching ? undefined : group),
    [group, query, searching],
  );

  useLayoutEffect(() => {
    if (!open) return;

    function place() {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const openBelow = spaceBelow >= 240 || spaceBelow >= spaceAbove;
      const available = Math.max(180, openBelow ? spaceBelow : spaceAbove);
      const maxHeight = Math.min(440, available);
      let left = rect.left;
      if (left + PANEL_WIDTH > window.innerWidth - 8) {
        left = window.innerWidth - PANEL_WIDTH - 8;
      }
      if (left < 8) left = 8;
      const top = openBelow ? rect.bottom + 8 : rect.top - maxHeight - 8;
      setPosition({ top: Math.max(8, top), left, maxHeight });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef, open]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchorRef, onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Emoji"
      className="paper-card fixed z-50 flex flex-col overflow-hidden p-2 shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        width: PANEL_WIDTH,
        maxHeight: position.maxHeight,
      }}
    >
      <input
        ref={searchRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search all emoji"
        className="mb-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-accent"
      />
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {matches.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted">No matching emoji.</p>
        ) : (
          <div className="grid grid-cols-8">
            {matches.map((item) => (
              <button
                key={`${item.group}-${item.glyph}`}
                type="button"
                title={item.name}
                aria-label={item.name}
                className="flex aspect-square items-center justify-center rounded-lg text-[22px] leading-none hover:bg-paper-2"
                onClick={() => onPick(item.glyph)}
              >
                {item.glyph}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-1 grid grid-cols-9 border-t border-line pt-1">
        {EMOJI_CATEGORIES.map((item) => (
          <button
            key={item.slug}
            type="button"
            title={item.label}
            aria-label={item.label}
            aria-pressed={!searching && group === item.slug}
            className={`flex h-8 items-center justify-center rounded-lg text-base ${
              !searching && group === item.slug ? "bg-paper-2" : "hover:bg-paper-2"
            }`}
            onClick={() => {
              setGroup(item.slug);
              setQuery("");
            }}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}
