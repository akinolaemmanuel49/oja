/**
 * Shared animation primitives for the Ọjà design system.
 *
 * These are thin wrappers around `motion/react` that enforce a consistent
 * motion vocabulary (spring presets, stagger patterns, fade-up variants)
 * across both the admin dashboard and the public storefront.
 *
 * Import from: `@oja/motion-design`
 */
export {
  // Wrappers
  FadeUp,
  ScaleIn,
  SlideIn,
  Stagger,
  StaggerItem,
  RouteTransition,
  MotionCard,
  HoverLift,
  AnimatedNumber,
  FadeIn,
} from "./components";

// Re-export key motion primitives for convenience
export {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion,
} from "motion/react";

// Re-export all variant definitions and spring presets
export {
  fadeUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerFast,
  staggerSlow,
  springDefault,
  springGentle,
  springSnappy,
  springBouncy,
  heroTextStagger,
} from "./variants";
