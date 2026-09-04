import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../cn";

export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("skeleton-shimmer rounded-md", className)}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";
