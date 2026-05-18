import { Logo } from "@/components/ui/Logo";
import type { ReactNode } from "react";

export function PageShell({
  children,
  maxWidth = "lg",
}: {
  children: ReactNode;
  maxWidth?: "md" | "lg" | "xl";
}) {
  const widths = {
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
      </header>
      <main className={`mx-auto px-6 pb-20 pt-4 ${widths[maxWidth]}`}>
        {children}
      </main>
    </div>
  );
}

