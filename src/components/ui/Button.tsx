import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-coral text-offwhite border-ink hover:bg-peach shadow-cartoon hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-cartoon-sm active:translate-x-1 active:translate-y-1 active:shadow-none",
  secondary:
    "bg-mint text-ink border-ink hover:bg-sky shadow-cartoon hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-cartoon-sm active:translate-x-1 active:translate-y-1 active:shadow-none",
  ghost:
    "bg-transparent text-ink border-transparent hover:bg-sand/60 shadow-none",
};

type BaseProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkProps = BaseProps & {
  href: string;
};

export function Button({
  children,
  variant = "primary",
  className = "",
  href,
  ...props
}: ButtonProps | LinkProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-2xl border-2 px-6 py-3 font-display text-lg font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
