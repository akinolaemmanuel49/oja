import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../cn";

// ---------------------------------------------------------------------------
// DropdownMenu — portaled popover menu built from scratch
// ---------------------------------------------------------------------------

type Align = "start" | "center" | "end";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenu components must be used within <DropdownMenu>");
  return ctx;
}

export function DropdownMenu({
  children,
  open,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const controlled = open !== undefined;
  const isOpen = controlled ? open : internalOpen;
  const setOpen = (v: boolean) => {
    if (controlled) onOpenChange?.(v);
    else setInternalOpen(v);
  };

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current && triggerRef.current.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ open: isOpen, setOpen, triggerRef }}>
      {children}
    </DropdownContext.Provider>
  );
}

interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

export function DropdownMenuTrigger({ children, onClick, ...props }: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdown();
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        setOpen(!open);
      }}
      {...(props as HTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: Align;
  className?: string;
}

export function DropdownMenuContent({
  children,
  align = "start",
  className,
}: DropdownMenuContentProps) {
  const { open, triggerRef } = useDropdown();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
    void contentRef.current;
  }, [open, triggerRef]);

  useEffect(() => {
    if (!open || !pos) return;
    const el = contentRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const winW = window.innerWidth;
    let left = pos.left;
    if (align === "end") left = pos.left - r.width + (triggerRef.current?.offsetWidth ?? 0);
    if (align === "center") left = pos.left - r.width / 2 + (triggerRef.current?.offsetWidth ?? 0) / 2;
    if (left + r.width > winW - 8) left = winW - r.width - 8;
    if (left < 8) left = 8;
    el.style.left = `${Math.max(0, left)}px`;
    el.style.top = `${pos.top}px`;
  }, [open, pos, align, triggerRef]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={contentRef}
          role="menu"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ position: "fixed", top: pos?.top ?? 0, left: pos?.left ?? 0 }}
          className={cn(
            "z-[1000] min-w-[10rem] rounded-md border bg-card p-1 text-card-foreground shadow-lg",
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

interface DropdownMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function DropdownMenuLabel({ children, className, ...props }: DropdownMenuLabelProps) {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props}>
      {children}
    </div>
  );
}

interface DropdownMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}

export interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onSelect?: () => void;
  onClick?: () => void;
  disabled?: boolean;
}

export function DropdownMenuItem({
  children,
  onSelect,
  onClick,
  disabled,
  className,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdown();
  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        onClick?.();
        onSelect?.();
        if (!disabled) setOpen(false);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "hover:bg-accent hover:text-accent-foreground",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
