import type { ClientLogo } from '../types/casmura.ts';

interface BrandMarkProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export const CASMURA_LOGO_BLUE_PATH = '/assets/aistudio/Blue_4fcd6f0e.png';
export const CASMURA_LOGO_WHITE_PATH = '/assets/aistudio/White_f9ce6da0.png';

export function BrandMark({ variant = 'light', className = '' }: BrandMarkProps) {
  const src = variant === 'dark' ? CASMURA_LOGO_WHITE_PATH : CASMURA_LOGO_BLUE_PATH;

  return (
    <span className={`inline-flex items-center shrink-0 select-none ${className}`}>
      <img
        src={src}
        alt="Casmura Contract"
        width={708}
        height={142}
        decoding="async"
        draggable={false}
        className="h-8 sm:h-9 w-auto object-contain"
      />
    </span>
  );
}

export function ClientLogoCard({ client }: { client: ClientLogo }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-5 border border-[#00214A]/12 rounded-lg bg-white hover:border-[#C5A15B]/70 transition-colors min-h-[104px] text-center group">
      <span className="font-display text-base sm:text-lg font-semibold tracking-wide text-[#00214A] group-hover:text-[#8C6B2D] transition-colors">
        {client.name}
      </span>
      {client.subtitle && (
        <span className="text-[10px] font-medium tracking-[0.16em] text-slate-500 mt-1 uppercase">
          {client.subtitle}
        </span>
      )}
      <span className="text-[11px] text-slate-400 mt-1.5">{client.location}</span>
    </div>
  );
}

export function PartnerBadge({
  name,
  protocol,
}: {
  name: string;
  protocol?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-2.5 rounded-md border border-[#00214A]/12 bg-[#F3F1EC]/65 hover:bg-white hover:border-[#C5A15B]/60 transition-colors text-center">
      <span className="font-display text-sm font-bold tracking-tight text-[#00214A]">
        {name}
      </span>
      {protocol && (
        <span className="text-[10px] text-slate-500 mt-0.5">{protocol}</span>
      )}
    </div>
  );
}
