"use client";

import type { ReactNode } from "react";
import { AuthGate } from "./AuthGate";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { NotebookProvider } from "./NotebookProvider";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NotebookProvider>
        <KeyboardShortcuts />
        <AuthGate>{children}</AuthGate>
      </NotebookProvider>
    </ThemeProvider>
  );
}
