"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getImageBlob } from "@/lib/images";

export function Avatar({
  name,
  hue,
  size = 40,
  href,
  avatarId,
  src,
}: {
  name: string;
  hue: number;
  size?: number;
  href?: string;
  avatarId?: string | null;
  src?: string | null;
}) {
  const [loaded, setLoaded] = useState<{ id: string; url: string } | null>(null);
  const photoUrl = src || (loaded && loaded.id === avatarId ? loaded.url : null);
  const initial = (name.trim().charAt(0) || "?").toUpperCase();
  const style = {
    width: size,
    height: size,
    background: photoUrl
      ? undefined
      : `linear-gradient(145deg, hsl(${hue} 42% 42%), hsl(${hue} 38% 28%))`,
    fontSize: Math.max(12, size * 0.38),
  };

  useEffect(() => {
    if (src || !avatarId) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    getImageBlob(avatarId).then((blob) => {
      if (!blob || cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setLoaded({ id: avatarId, url: objectUrl });
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [avatarId, src]);

  const node = (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)]"
      style={style}
      aria-hidden
    >
      {photoUrl ? (
        // Local blob URLs are not a remote image CDN.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="shrink-0">
        {node}
      </Link>
    );
  }
  return node;
}
