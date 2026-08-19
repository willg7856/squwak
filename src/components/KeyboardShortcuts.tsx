"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) {
        if (event.key === "Escape") (event.target as HTMLElement).blur();
        return;
      }
      if (event.key === "n") {
        event.preventDefault();
        router.push("/home");
        requestAnimationFrame(() => document.getElementById("squwak-composer")?.focus());
      }
      if (event.key === "j") {
        event.preventDefault();
        router.push("/journal");
        requestAnimationFrame(() => document.getElementById("squwak-composer")?.focus());
      }
      if (event.key === "/") {
        event.preventDefault();
        router.push("/explore");
        requestAnimationFrame(() => document.getElementById("squwak-search")?.focus());
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  return null;
}
