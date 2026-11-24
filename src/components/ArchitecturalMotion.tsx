import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { useRef, type ReactNode } from 'react';

export const ARCHITECTURAL_EASE = [0.16, 1, 0.3, 1] as const;

export const VIEWPORT_CONFIG = {
  once: true,
  amount: 0.08,
} as const;

interface EditorialRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  className?: string;
  immediate?: boolean;
}

/**
 * Sequential architectural typography and content block reveal.
 * GPU-composited opacity + transform only; respects prefers-reduced-motion.
 */
export function EditorialReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 18,
  duration = 0.58,
  className = '',
  immediate = false,
}: EditorialRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const offset =
    direction === 'up'
      ? { y: distance, x: 0 }
      : direction === 'down'
      ? { y: -distance, x: 0 }
      : direction === 'left'
      ? { x: distance, y: 0 }
      : direction === 'right'
      ? { x: -distance, y: 0 }
      : { x: 0, y: 0 };

  if (immediate) {
    return (
      <motion.div
        initial={{ opacity: 0, ...offset }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration, delay, ease: ARCHITECTURAL_EASE }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={VIEWPORT_CONFIG}
      transition={{ duration, delay, ease: ARCHITECTURAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface CinematicImageRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
  className?: string;
}

/**
 * Smooth architectural clip-path unmasking paired with subtle inner scale settle.
 */
export function CinematicImageReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: CinematicImageRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const initialClip =
    direction === 'left'
      ? 'inset(0% 0% 0% 8%)'
      : direction === 'right'
      ? 'inset(0% 8% 0% 0%)'
      : 'inset(7% 0% 0% 0%)';

  return (
    <motion.div
      initial={{ opacity: 0.15, clipPath: initialClip, scale: 1.05 }}
      whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
      viewport={VIEWPORT_CONFIG}
      transition={{ duration: 0.72, delay, ease: ARCHITECTURAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxMediaProps {
  children: ReactNode;
  offsetY?: number;
  className?: string;
}

/**
 * Restrained scroll-linked vertical parallax wrapper for architectural imagery & accents.
 */
export function ParallaxMedia({
  children,
  offsetY = 18,
  className = '',
}: ParallaxMediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offsetY, offsetY]);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="w-full h-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

/**
 * Coordinates staggered entrance across grids and collections on viewport entry.
 */
export function StaggerGroup({
  children,
  className = '',
  staggerDelay = 0.08,
}: StaggerGroupProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: ARCHITECTURAL_EASE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ArchitecturalRuleProps {
  className?: string;
  origin?: 'left' | 'center';
  delay?: number;
}

export function ArchitecturalRule({
  className = 'w-14 h-[1.5px] bg-[#C5A15B] mx-auto',
  origin = 'center',
  delay = 0.12,
}: ArchitecturalRuleProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className} aria-hidden="true" />;
  }

  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0.4 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={VIEWPORT_CONFIG}
      transition={{ duration: 0.65, delay, ease: ARCHITECTURAL_EASE }}
      style={{ transformOrigin: origin === 'left' ? 'left center' : 'center center' }}
      className={className}
      aria-hidden="true"
    />
  );
}
