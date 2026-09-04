import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Check, ChevronUp } from "lucide-react";
import { cn } from "../cn";

// ---------------------------------------------------------------------------
// Select — custom portaled dropdown (replaces @radix-ui/react-select)
// ---------------------------------------------------------------------------

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelect() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("Select components must be used within <Select>");
  return ctx;
}

interface SelectProps<T extends string = string> {
  value: T | undefined;
  onValueChange: (value: T) => void;
  disabled?: boolean;
  children: ReactNode;
}

export function Select<T extends string = string>({ value, onValueChange, disabled, children }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <SelectContext.Provider
      value={{
        value: (value ?? "") as string,
        onValueChange: onValueChange as (value: string) => void,
        open: open && !disabled,
        setOpen: disabled ? () => {} : setOpen,
        triggerRef,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

interface SelectValueProps {
  placeholder?: string;
  children?: ReactNode;
}

// Displays the currently selected value. Standalone: shows the raw value string.
export function SelectValue({ placeholder, children }: SelectValueProps) {
  const { value } = useSelect();
  return <>{children ?? value ?? placeholder ?? "Select..."}</>;
}

interface SelectTriggerProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

export function SelectTrigger({ className, id, style, children }: SelectTriggerProps) {
  const { open, setOpen, triggerRef } = useSelect();
  return (
    <button
      ref={triggerRef}
      type="button"
      id={id}
      style={style}
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors",
        "hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span className="truncate">{children}</span>
      <ChevronDown
        className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
      />
    </button>
  );
}

interface SelectContentProps {
  children: ReactNode;
  className?: string;
}

export function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen, triggerRef } = useSelect();
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, [open, triggerRef]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, triggerRef]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    }
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      const content = contentRef.current;
      const trigger = triggerRef.current;
      if (content && content.contains(t)) return;
      if (trigger && trigger.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [open, triggerRef]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && pos && (
        <motion.div
          ref={contentRef}
          role="listbox"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width }}
          className={cn(
            "z-[1000] max-h-72 overflow-auto rounded-md border bg-card p-1 text-card-foreground shadow-lg",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  const { value: selected, onValueChange, setOpen } = useSelect();
  const isSelected = selected === value;
  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isSelected && "font-medium text-accent-foreground",
        className,
      )}
    >
      <span className="truncate">{children}</span>
      {isSelected && <Check className="h-4 w-4" />}
    </div>
  );
}

export function SelectLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function SelectSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}

export function SelectScrollUpButton({ className }: { className?: string }) {
  return <div className={cn("flex items-center justify-center py-1 text-muted-foreground", className)}><ChevronUp className="h-4 w-4" /></div>;
}

export function SelectScrollDownButton({ className }: { className?: string }) {
  return <div className={cn("flex items-center justify-center py-1 text-muted-foreground", className)}><ChevronDown className="h-4 w-4" /></div>;
}
