import Link from "next/link";
import type { ReactNode } from "react";

const INLINE =
  /(@[a-z0-9_]{2,24}|#[a-zA-Z][\w-]{0,48}|\*\*[^*]+?\*\*|\*[^*\n]+?\*|_[^_\n]+?_)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(INLINE);
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("@")) {
      return (
        <span key={key} className="text-sky">
          {part}
        </span>
      );
    }
    if (part.startsWith("#")) {
      const tag = part.slice(1);
      return (
        <Link key={key} href={`/explore?q=${encodeURIComponent(tag)}`} className="text-sky hover:underline">
          {part}
        </Link>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (
      (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) ||
      (part.startsWith("_") && part.endsWith("_") && part.length > 2)
    ) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <span key={key}>{part}</span>;
  });
}

export function renderRichText(body: string): ReactNode {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  function flushList() {
    if (list.length === 0) return;
    const items = list;
    list = [];
    blocks.push(
      <ul key={`list-${blocks.length}`} className="my-2 list-disc space-y-1 pl-5">
        {items.map((item, index) => (
          <li key={index}>{renderInline(item, `li-${blocks.length}-${index}`)}</li>
        ))}
      </ul>,
    );
  }

  lines.forEach((line, index) => {
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    flushList();
    if (line.trim() === "") {
      blocks.push(<span key={`br-${index}`} className="block h-3" />);
      return;
    }
    blocks.push(
      <span key={`p-${index}`} className="block">
        {renderInline(line, `p-${index}`)}
      </span>,
    );
  });
  flushList();
  return blocks;
}
