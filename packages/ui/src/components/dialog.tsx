import {
  createContext,
  useContext,
  useEffect,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../cn";

// ---------------------------------------------------------------------------
// Dialog (modal) built from scratch — React context + portal + motion
// ---------------------------------------------------------------------------

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>");
  return ctx;
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
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
    <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps extends HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
  children: ReactNode;
}

export function DialogTrigger({ asChild, children, onClick, ...props }: DialogTriggerProps) {
  const { setOpen } = useDialog();
  return (
    <span
      onClick={(e) => {
        onClick?.(e as unknown as MouseEvent<HTMLSpanElement>);
        setOpen(true);
      }}
      className={cn(asChild ? "" : "inline-block", props.className)}
      {...props}
    >
      {children}
    </span>
  );
}

interface DialogCloseProps extends HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
  children: ReactNode;
}

export function DialogClose({ asChild, children, onClick, ...props }: DialogCloseProps) {
  const { setOpen } = useDialog();
  return (
    <span
      onClick={(e) => {
        onClick?.(e as unknown as MouseEvent<HTMLSpanElement>);
        setOpen(false);
      }}
      className={asChild ? "" : undefined}
      {...props}
    >
      {children}
    </span>
  );
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
  closeOnOverlay?: boolean;
}

export function DialogContent({
  children,
  className,
  closeOnOverlay = true,
}: DialogContentProps) {
  const { open, setOpen } = useDialog();

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closeOnOverlay ? () => setOpen(false) : undefined}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-xl border bg-card p-6 text-card-foreground shadow-lg",
              className,
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function DialogOverlay({ className }: { className?: string }) {
  return <div className={cn("absolute inset-0 bg-black/40", className)} aria-hidden="true" />;
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
