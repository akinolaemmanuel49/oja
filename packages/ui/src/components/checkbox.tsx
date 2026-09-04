import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../cn";

// ---------------------------------------------------------------------------
// Checkbox — custom (replaces @radix-ui/react-checkbox)
// ---------------------------------------------------------------------------

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, id, disabled, ...props }, ref) => {
    const isChecked = checked ?? false;
    return (
      <span className={cn("inline-flex", className)}>
        <input
          ref={ref}
          type="checkbox"
          id={id}
          checked={isChecked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
            "border-input bg-background hover:border-gray-400",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            isChecked && "border-primary bg-primary text-primary-foreground",
          )}
          onClick={() => onCheckedChange?.(!isChecked)}
        >
          {isChecked && (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
              <path
                d="M2.5 6.5l2 2 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
    );
  },
);
Checkbox.displayName = "Checkbox";
