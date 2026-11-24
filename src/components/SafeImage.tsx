import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function SafeImage({ src, alt, className = '' }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#00214A] text-white/85 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="w-8 h-8 text-[#C5A15B] mb-2" />
        <span className="text-xs font-medium tracking-wide max-w-[200px]">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
