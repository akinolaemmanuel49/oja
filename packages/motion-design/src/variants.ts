/**
 * Animation variant definitions and spring presets for the Ọjà design system.
 */

// ---------------------------------------------------------------------------
// Variant objects
// ---------------------------------------------------------------------------

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 300 },
  },
} as const;

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" as const } },
} as const;

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, damping: 20, stiffness: 300 },
  },
} as const;

export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 300 },
  },
} as const;

export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 300 },
  },
} as const;

export const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
} as const;

export const staggerFast = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
} as const;

export const staggerSlow = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
} as const;

export const heroTextStagger = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Spring presets
// ---------------------------------------------------------------------------

export const springDefault = { type: "spring" as const, damping: 20, stiffness: 300 } as const;
export const springGentle = { type: "spring" as const, damping: 25, stiffness: 200 } as const;
export const springSnappy = { type: "spring" as const, damping: 18, stiffness: 400 } as const;
export const springBouncy = { type: "spring" as const, damping: 10, stiffness: 250 } as const;
