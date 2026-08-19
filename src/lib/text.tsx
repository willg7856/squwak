import Link from "next/link";
import type { ReactNode } from "react";

const TOKEN = /(@[a-z0-9_]{2,24}|#[a-zA-Z][\w-]{0,48})/g;

export function renderRichText(body: string): ReactNode[] {
  const parts = body.split(TOKEN);
  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      return (
        <span key={`${part}-${index}`} className="text-sky">
          {part}
        </span>
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
