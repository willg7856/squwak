"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BirdMark } from "./Icons";
import { useNotebook } from "./NotebookProvider";

const ERRORS: Record<string, string> = {
  invalid: "That username or password did not match.",
  username: "Usernames should be 3–20 characters: letters, numbers, underscore.",
  name: "Choose a display name between 2 and 40 characters.",
  password: "Passwords need at least 6 characters.",
  taken: "That username is already saved in this browser.",
};

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login, signup } = useNotebook();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <BirdMark className="h-10 w-10 text-accent" />
        <span className="font-serif text-3xl">Squwak</span>
      </Link>
      <h1 className="font-serif text-4xl leading-tight">
        {mode === "login" ? "Welcome back." : "Your private notebook."}
      </h1>
      <p className="mt-2 text-muted">
        {mode === "login"
          ? "Sign in with the account you created on this device."
          : "Short notes and longer journal pages, just for you."}
      </p>

      {error && ERRORS[error] && (
        <p className="mt-4 rounded-xl bg-heart/10 px-3 py-2 text-sm text-heart">{ERRORS[error]}</p>
      )}

      <form
        className="mt-6 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const username = String(form.get("username") ?? "");
          const password = String(form.get("password") ?? "");
          const result =
            mode === "login"
              ? login(username, password)
              : signup({
                  username,
                  displayName: String(form.get("displayName") ?? ""),
                  password,
                });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.push("/home");
        }}
      >
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
      <p className="mt-6 text-xs leading-5 text-muted">
        Your account and notes stay in this browser, so you can sign back in without creating a new
        one. Clearing site data will remove them.
      </p>
    </div>
  );
}
