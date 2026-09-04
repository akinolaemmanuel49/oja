import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../cn";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "default" | "lg";
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  default: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
};

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt ?? ""} className="aspect-square h-full w-full object-cover" />
      ) : (
        <span className="font-medium">{initials(fallback)}</span>
      )}
    </span>
  ),
);
Avatar.displayName = "Avatar";

export const AvatarImage = forwardRef<HTMLImageElement, HTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <img ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
  ),
);
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("flex h-full w-full items-center justify-center font-medium", className)} {...props} />
  ),
);
AvatarFallback.displayName = "AvatarFallback";
