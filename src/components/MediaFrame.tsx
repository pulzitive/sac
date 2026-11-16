import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface MediaFrameProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  objectPosition?: 'center' | 'top';
  fallbackLabel?: string;
  aspectClass?: string;
}

export function MediaFrame({
  src,
  alt,
  className = '',
  imgClassName = '',
  objectPosition = 'center',
  fallbackLabel,
  aspectClass = 'aspect-[4/3]',
}: MediaFrameProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[#ECEAE4] ${aspectClass} ${className}`}
    >
      {!hasError && src ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover ${
            objectPosition === 'top' ? 'object-top' : 'object-center'
          } ${imgClassName}`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1C1C20] via-[#141417] to-[#0B0B0D] p-6 text-center text-[#F8F7F4]">
          <ImageIcon className="h-6 w-6 text-[#E879F9]" aria-hidden="true" />
          <span className="font-display text-sm font-medium tracking-tight text-white/90">
            {fallbackLabel || alt}
          </span>
        </div>
      )}
    </div>
  );
}
