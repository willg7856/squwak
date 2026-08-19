"use client";

import { useEffect, useState } from "react";
import { getImageBlob } from "@/lib/images";
import { PhotoLightbox } from "./PhotoLightbox";

function NoteImage({
  id,
  className,
  onOpen,
}: {
  id: string;
  className?: string;
  onOpen: () => void;
}) {
  const [loaded, setLoaded] = useState<{ id: string; url: string } | null>(null);
  const url = loaded && loaded.id === id ? loaded.url : null;

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    getImageBlob(id).then((blob) => {
      if (!blob || cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setLoaded({ id, url: objectUrl });
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
    <button type="button" className="block w-full" onClick={onOpen}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className={className} />
    </button>
  );
}

export function NoteImageGrid({ ids }: { ids: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (ids.length === 0) return null;
  const count = ids.length;

  return (
    <>
      <div
        className={`mt-3 overflow-hidden rounded-2xl border border-line ${
          count === 1 ? "" : "grid grid-cols-2 gap-0.5 bg-line"
        }`}
      >
        {ids.map((id, index) => (
          <NoteImage
            key={id}
            id={id}
            onOpen={() => setOpenIndex(index)}
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
      {openIndex !== null && (
        <PhotoLightbox
          ids={ids}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndex={setOpenIndex}
        />
      )}
    </>
  );
}
