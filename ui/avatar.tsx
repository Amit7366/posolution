import * as React from "react";
import { cn } from "@/lib/utils";
import Image, { ImageProps } from "next/image";

// Main Avatar container
const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = "Avatar";

// Avatar Image
const AvatarImage = React.forwardRef<
  HTMLImageElement,
  Omit<ImageProps, "src" | "width" | "height"> & {
    src: string;
    width?: number | `${number}`;
    height?: number | `${number}`;
  }
>(({ className, width, height, ...props }, ref) => {
  const parsedWidth = typeof width === 'string' ? parseInt(width, 10) : width ?? 100;
  const parsedHeight = typeof height === 'string' ? parseInt(height, 10) : height ?? 100;

  return (
    <Image
      ref={ref}
      className={cn("h-full w-full object-cover rounded-md", className)}
      width={parsedWidth}
      height={parsedHeight}
     
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

// Fallback initials or placeholder
const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm font-medium", className)}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

// Export all as named exports
export { Avatar, AvatarImage, AvatarFallback };
