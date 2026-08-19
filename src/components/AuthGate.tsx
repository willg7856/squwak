"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BootScreen, useNotebook } from "./NotebookProvider";

const PROTECTED = ["/home", "/journal", "/bookmarks", "/settings", "/explore", "/n/", "/u/"];

export function AuthGate({ children }: { children: ReactNode }) {
  const { ready, user } = useNotebook();
  const router = useRouter();
  const pathname = usePathname();
  const needsAuth = PROTECTED.some((path) => pathname === path || pathname.startsWith(path));

  useEffect(() => {
    if (!ready) return;
    if (needsAuth && !user) router.replace("/login");
    if ((pathname === "/login" || pathname === "/signup" || pathname === "/") && user) {
      router.replace("/home");
    }
  }, [needsAuth, pathname, ready, router, user]);

  if (!ready) return <BootScreen />;
  if (needsAuth && !user) return <BootScreen />;
  return <>{children}</>;
}
