import Link from "next/link";
import type { ReactNode } from "react";

const TOKEN = /(@[a-z0-9_]{2,24}|#[a-zA-Z][\w-]{0,48})/g;

export function renderRichText(body: string): ReactNode[] {
  const parts = body.split(TOKEN);
  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      const username = part.slice(1);
      return (
        <Link
          key={`${part}-${index}`}
          href={`/u/${username}`}
          className="text-sky hover:underline"
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith("#")) {
      const tag = part.slice(1);
      return (
        <Link
          key={`${part}-${index}`}
          href={`/explore?q=${encodeURIComponent(tag)}`}
          className="text-sky hover:underline"
        >
          {part}
        </Link>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function extractTags(body: string): string[] {
  const matches = body.match(/#([a-zA-Z][\w-]{0,48})/g) ?? [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
}
