import { useEffect } from 'react';
import { X } from 'lucide-react';
import { DiscoveryCallScheduler } from './DiscoveryCallScheduler';

interface BriefModalProps {
  isOpen: boolean;
  initialSubject?: string;
  onClose: () => void;
}

export function BriefModal({
  isOpen,
  initialSubject = '',
  onClose,
}: BriefModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="brief-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5E3DD] bg-[#F8F7F4] p-6 text-[#111113] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#E5E3DD] pb-5">
          <div>
            <p className="text-xs font-medium text-[#A21CAF]">
              Pulzitive Client Desk · Google Calendar &amp; Meet
            </p>
            <h2
              id="brief-modal-title"
              className="mt-1 font-display text-2xl font-semibold tracking-tight text-[#111113]"
            >
              Schedule a Discovery Call
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project brief modal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E3DD] text-[#52525B] hover:bg-[#111113] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <DiscoveryCallScheduler
          initialSubject={initialSubject}
          onSuccessClose={onClose}
        />
      </div>
    </div>
  );
}
