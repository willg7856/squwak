"use client";

import { useEffect, useRef } from "react";
import { EMOJIS } from "@/lib/emoji";

export function EmojiPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        onClose();
      }
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Emoji"
      className="paper-card absolute bottom-full left-0 z-20 mb-2 w-72 p-2 shadow-lg"
    >
      <div className="grid max-h-56 grid-cols-8 gap-0.5 overflow-y-auto">
        {EMOJIS.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-paper-2"
            onClick={() => onPick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
