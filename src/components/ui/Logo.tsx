import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-xl gap-1.5",
    md: "text-2xl gap-2",
    lg: "text-4xl gap-3",
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center font-display font-bold tracking-tight ${sizes[size]}`}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-lavender font-mono text-sm shadow-cartoon-sm"
        aria-hidden
      >
        ∇
      </span>
      <span>
        Nabla<span className="text-coral">.</span>
      </span>
    </Link>
  );
}
