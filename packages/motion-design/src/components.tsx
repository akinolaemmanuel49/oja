import { type ReactNode, useRef, useEffect, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
  type HTMLMotionProps,
} from "motion/react";
import {
  fadeUp,
  fadeIn,
  scaleIn,
  springSnappy,
} from "./variants";

// ============================================================================
// FadeUp
// ============================================================================

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function FadeUp({ children, className, delay = 0, once = true }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-40px" });
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      variants={fadeUp as Variants}
      initial={prefersReduced ? "visible" : "hidden"}
      animate={inView ? "visible" : "hidden"}
      transition={delay ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// FadeIn
// ============================================================================

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function FadeIn({ children, className, delay = 0, once = true }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-40px" });
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      variants={fadeIn as Variants}
      initial={prefersReduced ? "visible" : "hidden"}
      animate={inView ? "visible" : "hidden"}
      transition={delay ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// ScaleIn
// ============================================================================

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function ScaleIn({ children, className, delay = 0, once = true }: ScaleInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-40px" });
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      variants={scaleIn as Variants}
      initial={prefersReduced ? "visible" : "hidden"}
      animate={inView ? "visible" : "hidden"}
      transition={delay ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// SlideIn
// ============================================================================

interface SlideInProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right";
  delay?: number;
  once?: boolean;
}

const slideVariants: Record<string, Variants> = {
  left: {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, damping: 25, stiffness: 300 },
    },
  },
  right: {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, damping: 25, stiffness: 300 },
    },
  },
};

export function SlideIn({
  children,
  className,
  direction = "left",
  delay = 0,
  once = true,
}: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-40px" });
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      variants={slideVariants[direction]}
      initial={prefersReduced ? "visible" : "hidden"}
      animate={inView ? "visible" : "hidden"}
      transition={delay ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Stagger
// ============================================================================

interface StaggerProps {
  children: ReactNode;
  className?: string;
  once?: boolean;
  interval?: number;
}

export function Stagger({
  children,
  className,
  once = true,
  interval,
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  const prefersReduced = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: interval ?? 0.06,
        delayChildren: 0.08,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial={prefersReduced ? "visible" : "hidden"}
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// StaggerItem
// ============================================================================

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={fadeUp as Variants} className={className}>
      {children}
    </motion.div>
  );
}

// ============================================================================
// RouteTransition
// ============================================================================

interface RouteTransitionProps {
  children: ReactNode;
  className?: string;
}

export function RouteTransition({ children, className }: RouteTransitionProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      variants={fadeIn as Variants}
      initial={prefersReduced ? undefined : "hidden"}
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// MotionCard
// ============================================================================

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  noHover?: boolean;
  motionProps?: HTMLMotionProps<"div">;
}

export function MotionCard({
  children,
  className,
  noHover = false,
  motionProps,
}: MotionCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      variants={fadeUp as Variants}
      initial={prefersReduced ? "visible" : "hidden"}
      animate={inView ? "visible" : "hidden"}
      whileHover={
        prefersReduced || noHover
          ? undefined
          : { y: -4, transition: { type: "spring" as const, damping: 20, stiffness: 300 } }
      }
      whileTap={
        prefersReduced || noHover
          ? undefined
          : { scale: 0.985, transition: springSnappy }
      }
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// HoverLift
// ============================================================================

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  lift?: number;
}

export function HoverLift({ children, className, lift = -4 }: HoverLiftProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      whileHover={
        prefersReduced
          ? undefined
          : { y: lift, transition: { type: "spring" as const, damping: 20, stiffness: 300 } }
      }
      whileTap={
        prefersReduced
          ? undefined
          : { scale: 0.985, transition: springSnappy }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// AnimatedNumber
// ============================================================================

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatOptions?: Intl.NumberFormatOptions;
}

function formatNumber(n: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("en-US", options).format(n);
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedNumber({
  value,
  duration = 1.5,
  className,
  prefix = "",
  suffix = "",
  formatOptions,
}: AnimatedNumberProps) {
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState(
    prefersReduced ? formatNumber(value, formatOptions) : "0",
  );

  useEffect(() => {
    if (prefersReduced) {
      setDisplay(formatNumber(value, formatOptions));
      return;
    }

    let start: number | null = null;
    let prev = 0;
    const from = prev;
    const to = value;
    const durationMs = duration * 1000;

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutExpo(progress);
      const current = Math.round(from + (to - from) * eased);

      if (current !== prev) {
        setDisplay(formatNumber(current, formatOptions));
        prev = current;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [value, duration, prefersReduced, formatOptions]);

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
