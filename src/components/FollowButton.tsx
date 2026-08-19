import { toggleFollowAction } from "@/lib/actions";

export function FollowButton({
  username,
  following,
  isSelf,
}: {
  username: string;
  following: boolean;
  isSelf: boolean;
}) {
  if (isSelf) return null;
  return (
    <form action={toggleFollowAction}>
      <input type="hidden" name="username" value={username} />
      <button
        type="submit"
        className={
          following
            ? "rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-heart hover:text-heart"
            : "rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink/90"
        }
      >
        {following ? "Following" : "Follow"}
      </button>
    </form>
  );
}
