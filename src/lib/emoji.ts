import keywords from "emojilib";
import byGroup from "unicode-emoji-json/data-by-group.json";

export type EmojiItem = {
  glyph: string;
  name: string;
  keywords: string;
  group: string;
};

type UnicodeGroup = {
  name: string;
  slug: string;
  emojis: { emoji: string; name: string; slug: string }[];
};

const groups = byGroup as UnicodeGroup[];
const keywordMap = keywords as Record<string, string[]>;

export const EMOJI_CATEGORIES = [
  { slug: "smileys_emotion", label: "Smileys", icon: "😀" },
  { slug: "people_body", label: "People", icon: "👋" },
  { slug: "animals_nature", label: "Nature", icon: "🐻" },
  { slug: "food_drink", label: "Food", icon: "🍕" },
  { slug: "travel_places", label: "Places", icon: "✈️" },
  { slug: "activities", label: "Activity", icon: "⚽" },
  { slug: "objects", label: "Objects", icon: "💡" },
  { slug: "symbols", label: "Symbols", icon: "💜" },
  { slug: "flags", label: "Flags", icon: "🏁" },
] as const;

export type EmojiCategorySlug = (typeof EMOJI_CATEGORIES)[number]["slug"];

export const EMOJIS: EmojiItem[] = groups.flatMap((group) =>
  group.emojis.map((item) => {
    const extra = keywordMap[item.emoji] ?? [];
    return {
      glyph: item.emoji,
      name: item.name,
      keywords: `${item.slug.replaceAll("_", " ")} ${extra.join(" ").replaceAll("_", " ")}`.toLowerCase(),
      group: group.slug,
    };
  }),
);

export function searchEmojis(query: string, group?: string): EmojiItem[] {
  const needle = query.trim().toLowerCase();
  const pool = group ? EMOJIS.filter((item) => item.group === group) : EMOJIS;
  if (!needle) return pool;
  return pool.filter(
    (item) =>
      item.name.includes(needle) ||
      item.keywords.includes(needle) ||
      item.glyph.includes(needle),
  );
}
