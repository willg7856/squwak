"use client";

import { useEffect, useState } from "react";
import { getImageBlob } from "@/lib/images";

function NoteImage({ id, className }: { id: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    getImageBlob(id).then((blob) => {
      if (!blob) return;
      objectUrl = URL.createObjectURL(blob);
      if (cancelled) {
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  if (!url) {
    return <div className={`animate-pulse bg-paper-2 ${className ?? ""}`} />;
  }

  return (
    // Object URLs from IndexedDB are local, so next/image is not a fit.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={className} />
  );
}

export function NoteImageGrid({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  const count = ids.length;

  return (
    <div
      className={`mt-3 overflow-hidden rounded-2xl border border-line ${
        count === 1 ? "" : "grid grid-cols-2 gap-0.5 bg-line"
      }`}
    >
      {ids.map((id, index) => (
        <NoteImage
          key={id}
          id={id}
          className={
            count === 1
              ? "max-h-[28rem] w-full object-cover"
              : count === 3 && index === 0
                ? "row-span-2 h-full min-h-40 w-full object-cover"
                : "h-40 w-full object-cover"
          }
        />
      ))}
    </div>
  );
}
