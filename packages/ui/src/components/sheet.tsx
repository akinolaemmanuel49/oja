import {
  createContext,
  useContext,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../cn";

// ---------------------------------------------------------------------------
// Sheet — side drawer (replaces @radix-ui/react-sheet)
// ---------------------------------------------------------------------------

type Side = "top" | "bottom" | "left" | "right";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheet() {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("Sheet components must be used within <Sheet>");
  return ctx;
}

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange]);

  return (
    <SheetContext.Provider value={{ open, setOpen: onOpenChange }}>{children}</SheetContext.Provider>
  );
}

interface SheetTriggerProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function SheetTrigger({ children, onClick, ...props }: SheetTriggerProps) {
  const { setOpen } = useSheet();
  return (
    <span
      onClick={(e) => {
        onClick?.(e as unknown as React.MouseEvent<HTMLSpanElement>);
        setOpen(true);
      }}
      className="inline-block"
      {...props}
    >
      {children}
    </span>
  );
}

interface SheetContentProps {
  side?: Side;
  className?: string;
  children: ReactNode;
}

const sideClasses: Record<Side, string> = {
  top: "inset-x-0 top-0 border-b",
  bottom: "inset-x-0 bottom-0 border-t",
  left: "inset-y-0 left-0 h-full w-72 border-r",
  right: "inset-y-0 right-0 h-full w-72 border-l",
};

const sideAnimate: Record<Side, { x: number; y: number }> = {
  top: { x: 0, y: -80 },
  bottom: { x: 0, y: 80 },
  left: { x: -80, y: 0 },
  right: { x: 80, y: 0 },
};

export function SheetContent({ side = "right", className, children }: SheetContentProps) {
  const { open, setOpen } = useSheet();

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1200]">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ ...sideAnimate[side], opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ ...sideAnimate[side], opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className={cn("fixed flex flex-col bg-card shadow-lg", sideClasses[side], className)}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 p-4 text-left", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

interface SheetCloseProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export function SheetClose({ children, ...props }: SheetCloseProps) {
  const { setOpen } = useSheet();
  return (
    <span onClick={() => setOpen(false)} className="cursor-pointer" {...props}>
      {children}
    </span>
  );
}
