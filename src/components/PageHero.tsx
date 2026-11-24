import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import {
  ARCHITECTURAL_EASE,
  EditorialReveal,
  ParallaxMedia,
} from './ArchitecturalMotion.tsx';
import { SafeImage } from './SafeImage.tsx';

interface PageHeroProps {
  kicker: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imagePositionClassName?: string;
  actions?: ReactNode;
}

export function PageHero({
  kicker,
  title,
  description,
  imageSrc,
  imageAlt,
  imagePositionClassName = 'object-[70%_center] sm:object-[62%_center] lg:object-center',
  actions,
}: PageHeroProps) {
  const prefersReduced = Boolean(useReducedMotion());

  return (
    <section className="relative bg-[#00214A] text-white min-h-[390px] sm:min-h-[430px] lg:min-h-[480px] flex items-center py-14 sm:py-16 lg:py-20 overflow-hidden border-b border-[#C5A15B]/25">
      {/* Full-Width Architectural Background Photograph with Subtle Reveal & Parallax */}
      <ParallaxMedia offsetY={16} className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={prefersReduced ? false : { opacity: 0.78, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: ARCHITECTURAL_EASE }}
          className="w-full h-full will-change-transform"
        >
          <SafeImage
            src={imageSrc}
            alt={imageAlt}
            className={`w-full h-full object-cover ${imagePositionClassName}`}
          />
        </motion.div>
      </ParallaxMedia>

      {/* Balanced Official Navy Directional Gradient Overlay Preserving Image Prominence */}
      <div
        className="absolute inset-0 bg-[#00214A]/45 sm:bg-transparent pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#00214A]/92 via-[#00214A]/70 sm:via-[#00214A]/58 to-[#00214A]/18 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#00214A]/55 via-transparent to-[#00214A]/20 pointer-events-none"
        aria-hidden="true"
      />

      {/* Left-Aligned Architectural Copy Positioned Over Negative Space */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-5">
          <EditorialReveal immediate delay={0} duration={0.35} distance={8}>
            <div className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C5A15B]">
              <span className="w-6 h-px bg-[#C5A15B]/80 shrink-0" aria-hidden="true" />
              <span>{kicker}</span>
            </div>
          </EditorialReveal>

          <EditorialReveal immediate delay={0.04} duration={0.38} distance={10}>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[48px] font-semibold text-white tracking-tight leading-[1.12] [text-wrap:balance] drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]">
              {title}
            </h1>
          </EditorialReveal>

          <EditorialReveal immediate delay={0.08} duration={0.38} distance={8}>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
              {description}
            </p>
          </EditorialReveal>

          {actions && (
            <EditorialReveal immediate delay={0.12} duration={0.38} distance={8}>
              <div className="pt-1 flex flex-wrap items-center gap-3">
                {actions}
              </div>
            </EditorialReveal>
          )}
        </div>
      </div>
    </section>
  );
}
