import { demoLoginAction, loginAction, signupAction } from "@/lib/actions";
import { listDemoUsers } from "@/lib/users";
import { BirdMark } from "./Icons";
import Link from "next/link";

const ERRORS: Record<string, string> = {
  invalid: "That username or password did not match.",
  username: "Usernames should be 3–20 characters: letters, numbers, underscore.",
  name: "Choose a display name between 2 and 40 characters.",
  password: "Passwords need at least 6 characters.",
  taken: "That username is already taken.",
};

export function AuthForm({
  mode,
  error,
}: {
  mode: "login" | "signup";
  error?: string;
}) {
  const demos = listDemoUsers();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <BirdMark className="h-10 w-10 text-accent" />
        <span className="font-serif text-3xl">Squwak</span>
      </Link>
      <h1 className="font-serif text-4xl leading-tight">
        {mode === "login" ? "Welcome back." : "Keep a public notebook."}
      </h1>
      <p className="mt-2 text-muted">
        {mode === "login"
          ? "Sign in to your notes and journal."
          : "Short notes, longer journal pages, one stream."}
      </p>

      {error && ERRORS[error] && (
        <p className="mt-4 rounded-xl bg-heart/10 px-3 py-2 text-sm text-heart">{ERRORS[error]}</p>
      )}

      <form action={mode === "login" ? loginAction : signupAction} className="mt-6 space-y-3">
        <label className="block text-sm font-medium">
          Username
          <input
            name="username"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-xl border border-line bg-white/70 px-3 py-2.5 outline-none focus:border-accent"
          />
        </label>
        {mode === "signup" && (
          <label className="block text-sm font-medium">
            Display name
            <input
              name="displayName"
              required
              autoComplete="name"
              className="mt-1 w-full rounded-xl border border-line bg-white/70 px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>
        )}
        <label className="block text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="mt-1 w-full rounded-xl border border-line bg-white/70 px-3 py-2.5 outline-none focus:border-accent"
          />
        </label>
        <button className="w-full rounded-full bg-accent py-3 font-semibold text-white hover:bg-accent-2">
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-ink hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already writing?{" "}
            <Link href="/login" className="font-semibold text-ink hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>

      <div className="mt-10">
        <p className="text-sm font-medium text-muted">Try a demo notebook</p>
        <p className="mt-1 text-xs text-muted">Password for all demo accounts: squwak</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {demos.map((person) => (
            <form action={demoLoginAction} key={person.username}>
              <input type="hidden" name="username" value={person.username} />
              <button className="w-full rounded-xl border border-line bg-white/60 px-3 py-2 text-left text-sm hover:border-accent">
                <span className="block font-semibold">{person.displayName}</span>
                <span className="text-muted">@{person.username}</span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
