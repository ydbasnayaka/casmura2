import { useState } from 'react';
import { ArchitecturalRule, EditorialReveal } from './ArchitecturalMotion.tsx';

export interface MarqueeLogoItem {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
}

const UPLOADED_CLIENT_LOGOS: MarqueeLogoItem[] = [
  {
    id: 'soneva-fushi',
    name: 'Soneva Fushi',
    src: '/assets/clients/soneva-fushi.png',
    width: 198,
    height: 119,
  },
  {
    id: 'niva-kuramathi',
    name: 'Niva Kuramathi Maldives',
    src: '/assets/clients/niva-kuramathi.png',
    width: 190,
    height: 89,
  },
  {
    id: 'le-meridien',
    name: 'Le Méridien Maldives Resort & Spa',
    src: '/assets/clients/le-meridien.png',
    width: 204,
    height: 58,
  },
  {
    id: 'cinnamon-dhonveli',
    name: 'Cinnamon Dhonveli Maldives',
    src: '/assets/clients/cinnamon-dhonveli.png',
    width: 191,
    height: 73,
  },
  {
    id: 'outrigger-maldives',
    name: 'Outrigger Maldives Maafushivaru Resort',
    src: '/assets/clients/outrigger-maldives.png',
    width: 200,
    height: 65,
  },
  {
    id: 'anantara-kihavah',
    name: 'Anantara Kihavah Maldives Villas',
    src: '/assets/clients/anantara-kihavah.png',
    width: 177,
    height: 98,
  },
  {
    id: 'centara-grand',
    name: 'Centara Grand Lagoon Maldives',
    src: '/assets/clients/centara-grand.png',
    width: 157,
    height: 89,
  },
  {
    id: 'conrad-maldives',
    name: 'Conrad Maldives Rangali Island',
    src: '/assets/clients/conrad-maldives.png',
    width: 179,
    height: 70,
  },
];

// Second sequence staggered by half the array so opposite rows never align identically
const ROW_TWO_LOGOS: MarqueeLogoItem[] = [
  ...UPLOADED_CLIENT_LOGOS.slice(4),
  ...UPLOADED_CLIENT_LOGOS.slice(0, 4),
];

function LogoTrackGroup({
  logos,
  ariaHidden = false,
}: {
  logos: MarqueeLogoItem[];
  ariaHidden?: boolean;
}) {
  return (
    <div
      className="flex items-center shrink-0 gap-10 sm:gap-14 lg:gap-16 pr-10 sm:pr-14 lg:pr-16"
      aria-hidden={ariaHidden || undefined}
    >
      {logos.map((logo) => (
        <div
          key={logo.id}
          className="shrink-0 flex items-center justify-center w-[132px] sm:w-[158px] lg:w-[178px] h-[54px] sm:h-[62px] lg:h-[68px] px-2 transition-transform duration-200 hover:scale-[1.04]"
        >
          <img
            src={logo.src}
            alt={ariaHidden ? '' : logo.name}
            width={logo.width}
            height={logo.height}
            decoding="async"
            draggable={false}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full w-auto h-auto object-contain select-none"
          />
        </div>
      ))}
    </div>
  );
}

export function ClientLogoMarquee() {
  const [touchPaused, setTouchPaused] = useState(false);

  return (
    <section
      aria-labelledby="valued-clients-heading"
      className="bg-[#F3F1EC] py-10 sm:py-12 lg:py-14 border-b border-[#00214A]/10 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8">
          <EditorialReveal delay={0}>
            <h2
              id="valued-clients-heading"
              className="font-display text-lg sm:text-2xl lg:text-[28px] font-bold text-[#00214A] tracking-[0.06em] uppercase [text-wrap:balance]"
            >
              OUR VALUED CLIENTS
            </h2>
          </EditorialReveal>
          <ArchitecturalRule className="w-14 h-[1.5px] bg-[#C5A15B] mx-auto" />
          <EditorialReveal delay={0.1}>
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
              Building lasting partnerships through quality, precision and architectural excellence.
            </p>
          </EditorialReveal>
        </div>

        {/* Clean Architectural Glass Marquee Surface with Soft Edge Fades */}
        <EditorialReveal delay={0.16}>
          <div
            onTouchStart={() => setTouchPaused(true)}
            onTouchEnd={() => setTouchPaused(false)}
            onTouchCancel={() => setTouchPaused(false)}
            className={`marquee-container relative bg-white/95 rounded-2xl border border-[#00214A]/10 shadow-[0_16px_38px_-18px_rgba(0,33,74,0.12)] py-5 sm:py-6 space-y-4 sm:space-y-5 overflow-hidden touch-pan-y ${
              touchPaused ? 'marquee-paused' : ''
            }`}
          >
          {/* Left & Right Soft Edge Fades */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-20 z-10 bg-gradient-to-r from-white via-white/85 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-20 z-10 bg-gradient-to-l from-white via-white/85 to-transparent"
            aria-hidden="true"
          />

          {/* Row 1: Right-to-Left Seamless Infinite Loop */}
          <div className="marquee-track-row overflow-hidden">
            <div className="marquee-track-left flex w-max items-center">
              <LogoTrackGroup logos={UPLOADED_CLIENT_LOGOS} />
              <LogoTrackGroup logos={UPLOADED_CLIENT_LOGOS} ariaHidden />
            </div>
          </div>

          {/* Row 2: Left-to-Right Alternating Infinite Loop */}
          <div className="marquee-track-row overflow-hidden">
            <div className="marquee-track-right flex w-max items-center">
              <LogoTrackGroup logos={ROW_TWO_LOGOS} />
              <LogoTrackGroup logos={ROW_TWO_LOGOS} ariaHidden />
            </div>
          </div>

          {/* Reduced-Motion Accessible Static Grid */}
          <div className="marquee-reduced-grid hidden flex-wrap items-center justify-center gap-8 px-6">
            {UPLOADED_CLIENT_LOGOS.map((logo) => (
              <div
                key={`static-${logo.id}`}
                className="flex items-center justify-center w-[150px] h-[64px] p-2"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>
            ))}
          </div>
          </div>
        </EditorialReveal>
      </div>
    </section>
  );
}
