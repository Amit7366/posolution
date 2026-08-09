"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
  rounded?: "full" | "xl";
};

function getInitials(name?: string | null, email?: string | null) {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function UserAvatar({
  name,
  email,
  src,
  size = 36,
  className,
  rounded = "xl",
}: UserAvatarProps) {
  const initials = getInitials(name, email);
  const radius = rounded === "full" ? "rounded-full" : "rounded-xl";

  if (src) {
    return (
      <Image
        src={src}
        alt={name || email || "User"}
        width={size}
        height={size}
        className={cn("object-cover", radius, className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center bg-linear-to-br from-blue-600 to-indigo-600 font-semibold text-white",
        radius,
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.32) }}
    >
      {initials}
    </span>
  );
}
