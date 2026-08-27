import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: 32,
  md: 40,
  lg: 48,
} as const;

const WORDMARK = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
} as const;

type BrandLogoProps = {
  size?: keyof typeof SIZES;
  showWordmark?: boolean;
  href?: string | null;
  onDark?: boolean;
  className?: string;
  priority?: boolean;
  wordmark?: string;
};

export default function BrandLogo({
  size = "sm",
  showWordmark = true,
  href = "/",
  onDark = false,
  className,
  priority = false,
  wordmark = "posulation",
}: BrandLogoProps) {
  const px = SIZES[size];

  const content = (
    <>
      <Image
        src="/posulation-icon.png"
        alt=""
        width={px}
        height={px}
        className="shrink-0 object-contain"
        priority={priority}
      />
      {showWordmark && (
        <span
          className={cn(
            "font-black tracking-tight",
            WORDMARK[size],
            onDark
              ? "text-white"
              : "bg-linear-to-r from-brand-blue via-brand-cyan to-brand-green bg-clip-text text-transparent"
          )}
        >
          {wordmark}
        </span>
      )}
    </>
  );

  const classes = cn("inline-flex items-center gap-2.5", className);

  if (href) {
    return (
      <Link href={href} className={classes} aria-label="posulation home">
        {content}
      </Link>
    );
  }

  return (
    <span className={classes} aria-label="posulation">
      {content}
    </span>
  );
}
