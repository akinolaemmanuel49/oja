import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../cn";

type AlertVariant = "default" | "destructive" | "success" | "warning";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  icon?: ReactNode;
}

const variantClasses: Record<AlertVariant, string> = {
  default: "border-border bg-background text-foreground",
  destructive: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", icon, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn("relative w-full rounded-lg border p-4 text-sm", variantClasses[variant], className)}
      {...props}
    >
      <div className="flex gap-3">
        {icon && <span className="shrink-0">{icon}</span>}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  ),
);
Alert.displayName = "Alert";

export const AlertTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";
