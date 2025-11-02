/**
 * Centralized Animation Variants Library
 *
 * This module provides reusable Framer Motion animation variants for consistent
 * animations throughout the application. All animations use GPU-accelerated
 * properties (transform and opacity) for optimal performance.
 *
 * @module animations
 */

import type { Variants } from "framer-motion";

/**
 * Fade in with slide up motion
 *
 * Use for: Messages, cards, any content appearing
 * Duration: 300ms
 * Properties: opacity (0→1), translateY (20px→0)
 *
 * @example
 * ```tsx
 * <motion.div variants={fadeSlideUp} initial="initial" animate="animate">
 *   Content
 * </motion.div>
 * ```
 */
export const fadeSlideUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

/**
 * Panel slide with spring physics
 *
 * Use for: Collapsible panels, sidebars
 * Physics: Natural spring feel (stiffness: 300, damping: 30)
 * Properties: translateX (-300px→0), opacity (0→1)
 *
 * @example
 * ```tsx
 * <motion.div variants={panelSlide} initial="initial" animate="animate">
 *   Panel Content
 * </motion.div>
 * ```
 */
export const panelSlide: Variants = {
  initial: {
    x: -300,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: -300,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

/**
 * Stagger children animations
 *
 * Use for: Sequential reveals (panels, list items)
 * Delay: 100ms between each child element
 *
 * @example
 * ```tsx
 * <motion.div variants={staggerContainer} initial="initial" animate="animate">
 *   <motion.div variants={fadeSlideUp}>Child 1</motion.div>
 *   <motion.div variants={fadeSlideUp}>Child 2</motion.div>
 * </motion.div>
 * ```
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1, // 100ms between children
    },
  },
};

/**
 * Card hover effect with subtle scale and shadow
 *
 * Use for: Agent cards, interactive elements
 * Scale: 1.0 → 1.02 (subtle lift effect)
 * Shadow: Elevated shadow on hover
 *
 * @example
 * ```tsx
 * <motion.div whileHover="hover" variants={cardHover}>
 *   Card Content
 * </motion.div>
 * ```
 */
export const cardHover: Variants = {
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

/**
 * Bouncing animation for typing indicator dots
 *
 * Use for: Loading indicators, typing dots
 * Motion: Vertical bounce (0 → -10px → 0)
 * Duration: 600ms per cycle
 * Repeats: Infinitely
 *
 * @example
 * ```tsx
 * {[0, 1, 2].map((i) => (
 *   <motion.span
 *     key={i}
 *     variants={bounceAnimation}
 *     initial="initial"
 *     animate="animate"
 *     transition={{ delay: i * 0.15 }}
 *   />
 * ))}
 * ```
 */
export const bounceAnimation: Variants = {
  initial: {
    y: 0,
  },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0,
    },
  },
};

/**
 * Spring physics configuration for natural motion
 *
 * These presets can be used with any motion component for consistent spring behavior.
 */
export const springPhysics = {
  /** Natural, snappy feel (recommended for panels) */
  natural: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
  /** Softer, more gentle (for cards) */
  soft: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
  },
  /** Bouncy, playful (for small elements) */
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 20,
  },
} as const;

/**
 * Standard easing curves for transitions
 */
export const easings = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  smooth: [0.43, 0.13, 0.23, 0.96],
} as const;
