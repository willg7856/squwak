"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getImageBlob } from "@/lib/images";
import { CloseIcon } from "./Icons";

function useBlobUrl(id: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    getImageBlob(id).then((blob) => {
      if (!blob || cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);
  return url;
}

export function PhotoLightbox({
  ids,
  index,
  onClose,
  onIndex,
}: {
  ids: string[];
  index: number;
  onClose: () => void;
  onIndex: (index: number) => void;
}) {
  const url = useBlobUrl(ids[index] ?? null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndex(Math.min(ids.length - 1, index + 1));
      if (event.key === "ArrowLeft") onIndex(Math.max(0, index - 1));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ids.length, index, onClose, onIndex]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/80 p-4" onClick={onClose}>
      <button
        type="button"
        aria-label="Close photo"
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink"
        onClick={onClose}
      >
        <CloseIcon className="h-5 w-5" />
      </button>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="max-h-[90vh] max-w-full rounded-2xl object-contain"
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <div className="h-48 w-48 animate-pulse rounded-2xl bg-paper-2" />
      )}
    </div>,
    document.body,
  );
}
