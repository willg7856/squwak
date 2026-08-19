import Link from "next/link";

export function Avatar({
  name,
  hue,
  size = 40,
  href,
}: {
  name: string;
  hue: number;
  size?: number;
  href?: string;
}) {
  const initial = (name.trim().charAt(0) || "?").toUpperCase();
  const style = {
    width: size,
    height: size,
    background: `linear-gradient(145deg, hsl(${hue} 42% 42%), hsl(${hue} 38% 28%))`,
    fontSize: Math.max(12, size * 0.38),
  };

  const node = (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)]"
      style={style}
      aria-hidden
    >
      {initial}
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
