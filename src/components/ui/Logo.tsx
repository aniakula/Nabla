import Image from "next/image";
import Link from "next/link";
import nablaLogo from "./Nabla_logo.png";

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 56,
} as const;

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = imageSizes[size];
  const showWordmark = size !== "sm";

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 font-display font-bold tracking-tight"
      aria-label="Nabla home"
    >
      <Image
        src={nablaLogo}
        alt=""
        width={px}
        height={px}
        className="rounded-lg object-contain"
        priority={size === "lg"}
      />
      {showWordmark && (
        <span className={size === "lg" ? "text-4xl" : "text-2xl"}>
          Nabla<span className="text-coral">.</span>
        </span>
      )}
    </Link>
  );
}
