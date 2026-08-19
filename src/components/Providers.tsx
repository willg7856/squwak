"use client";

import type { ReactNode } from "react";
import { AuthGate } from "./AuthGate";
import { NotebookProvider } from "./NotebookProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NotebookProvider>
      <AuthGate>{children}</AuthGate>
    </NotebookProvider>
  );
}
