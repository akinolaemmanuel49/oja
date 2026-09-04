import { forwardRef, cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement } from "react";
import { motion } from "motion/react";
import { cn } from "../cn";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | "default";
type Size = "xs" | "sm" | "default" | "lg" | "icon" | "icon-sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs",
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-gray-200 shadow-xs",
  outline:
    "border border-input bg-background text-foreground hover:bg-gray-50 hover:text-foreground",
  ghost: "text-foreground hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:bg-red-600 shadow-xs",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs gap-1.5",
  sm: "h-8 px-3 text-sm gap-1.5",
  default: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2",
  icon: "h-9 w-9",
  "icon-sm": "h-8 w-8",
};

const baseClasses =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none";

function classesFor(variant: Variant, size: Size, className?: string, loading = false) {
  return cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    loading && "opacity-80",
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", loading = false, disabled, children, type = "button", onClick, asChild }, ref) => {
    // NOTE: we deliberately do not spread all HTMLAttributes onto motion.button
    // (type conflicts on `onDrag`). Only the interactive props needed by our
    // consumers are forwarded explicitly.
    if (asChild && isValidElement(children)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const child = children as ReactElement<any>;
      const mergedClassName = cn(
        classesFor(variant, size, child.props?.className, loading),
        child.props?.className,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return cloneElement(child, { ref: ref as any, className: mergedClassName });
    }
    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        whileTap={disabled || loading ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        disabled={disabled || loading}
        className={classesFor(variant, size, className, loading)}
      >
        {loading ? <Spinner className="h-4 w-4" /> : children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";

export function buttonVariants({
  variant = "primary",
  size = "default",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
