export type NoteKind = "note" | "journal";
export type Visibility = "public" | "private";

export type Mood =
  | "grateful"
  | "restless"
  | "calm"
  | "tender"
  | "stormy"
  | "curious"
  | "wistful"
  | "bright";

export type User = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarHue: number;
  createdAt: number;
};

export type NoteCardData = {
  id: string;
  userId: string;
  body: string;
  kind: NoteKind;
  mood: Mood | null;
  visibility: Visibility;
  replyToId: string | null;
  createdAt: number;
  username: string;
  displayName: string;
  avatarHue: number;
  likeCount: number;
  replyCount: number;
  liked: boolean;
  bookmarked: boolean;
};

export type SessionUser = User;

export const MOODS: { id: Mood; label: string; swatch: string }[] = [
  { id: "grateful", label: "Grateful", swatch: "#C45C26" },
  { id: "restless", label: "Restless", swatch: "#B4532A" },
  { id: "calm", label: "Calm", swatch: "#3D6B66" },
  { id: "tender", label: "Tender", swatch: "#A85A6A" },
  { id: "stormy", label: "Stormy", swatch: "#4A5568" },
  { id: "curious", label: "Curious", swatch: "#2F6F8F" },
  { id: "wistful", label: "Wistful", swatch: "#6B5B8A" },
  { id: "bright", label: "Bright", swatch: "#C4892A" },
];

export const NOTE_LIMIT = 280;
export const JOURNAL_LIMIT = 4000;
