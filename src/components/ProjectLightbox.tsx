import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PortfolioProject } from '@/src/data/pulzitiveData';
import { MediaFrame } from './MediaFrame';

interface ProjectLightboxProps {
  project: PortfolioProject | null;
  onClose: () => void;
  onRequestSimilar: (projectTitle: string) => void;
}

export function ProjectLightbox({
  project,
  onClose,
  onRequestSimilar,
}: ProjectLightboxProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && project.gallery.length > 1) {
        setFrameIndex((prev) => (prev + 1) % project.gallery.length);
      } else if (e.key === 'ArrowLeft' && project.gallery.length > 1) {
        setFrameIndex(
          (prev) => (prev - 1 + project.gallery.length) % project.gallery.length
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const activeFrame = project.gallery[frameIndex] || {
    src: project.coverSrc,
    caption: project.title,
    objectPosition: project.coverPosition,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#27272A] bg-[#0B0B0D] text-[#F8F7F4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 border-b border-[#27272A] px-6 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA]">
              <span>{project.client}</span>
              <span aria-hidden="true">·</span>
              <span>{project.disciplineLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{project.year}</span>
            </div>
            <h2
              id="lightbox-title"
              className="mt-1 truncate font-display text-lg font-semibold text-white sm:text-xl"
            >
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close case study viewer"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#27272A] text-[#D4D4D8] transition-colors hover:bg-white hover:text-[#111113] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E879F9]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Visual Viewer */}
            <div className="relative bg-[#141417] lg:col-span-7">
              <MediaFrame
                src={activeFrame.src}
                alt={activeFrame.caption}
                objectPosition={activeFrame.objectPosition || 'center'}
                aspectClass="aspect-[4/3] lg:aspect-[16/12]"
                className="w-full"
                fallbackLabel={project.title}
              />

              {project.gallery.length > 1 && (
                <div className="flex items-center justify-between border-t border-[#27272A] bg-[#111114] px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFrameIndex(
                        (prev) =>
                          (prev - 1 + project.gallery.length) %
                          project.gallery.length
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#27272A] px-3 py-1.5 text-xs font-medium text-[#D4D4D8] hover:border-white/40 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Previous</span>
                  </button>

                  <span className="font-mono text-xs text-[#A1A1AA] tabular-nums">
                    {frameIndex + 1} / {project.gallery.length}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setFrameIndex((prev) => (prev + 1) % project.gallery.length)
                    }
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#27272A] px-3 py-1.5 text-xs font-medium text-[#D4D4D8] hover:border-white/40 hover:text-white cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              <div className="border-t border-[#27272A] bg-[#0F0F12] px-5 py-3 text-xs text-[#A1A1AA]">
                {activeFrame.caption}
              </div>
            </div>

            {/* Project Details */}
            <div className="flex flex-col justify-between p-6 lg:col-span-5 lg:border-l lg:border-[#27272A] lg:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold tracking-wider text-[#E879F9] uppercase">
                    Project Overview
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#E4E4E7]">
                    {project.summary}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase">
                    Strategic Mandate
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
                    {project.challenge}
                  </p>
                </div>

                <div className="border-y border-[#27272A] py-4">
                  <span className="text-xs font-semibold tracking-wider text-[#71717A] uppercase">
                    Verified Impact
                  </span>
                  <p className="mt-1.5 font-display text-base font-medium text-white">
                    {project.outcomeMetric}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase">
                    Deliverables Shipped
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-[#D4D4D8]">
                    {project.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-[#E879F9]" aria-hidden="true">
                          —
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {project.gallery.length > 1 && (
                  <div>
                    <h3 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase">
                      Gallery Frames
                    </h3>
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {project.gallery.map((frame, idx) => (
                        <button
                          key={frame.src + idx}
                          type="button"
                          onClick={() => setFrameIndex(idx)}
                          className={`overflow-hidden rounded-md border transition-all cursor-pointer ${
                            idx === frameIndex
                              ? 'border-[#E879F9] ring-1 ring-[#E879F9]'
                              : 'border-[#27272A] opacity-60 hover:opacity-100'
                          }`}
                          aria-label={`View frame ${idx + 1}: ${frame.caption}`}
                        >
                          <MediaFrame
                            src={frame.src}
                            alt={frame.caption}
                            aspectClass="aspect-square"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestSimilar(project.title);
                  }}
                  className="w-full rounded-lg bg-[#C026D3] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A21CAF] cursor-pointer"
                >
                  Commission a Similar Project
                </button>
                <a
                  href={project.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#27272A] px-5 py-2.5 text-sm font-medium text-[#D4D4D8] transition-colors hover:border-white/40 hover:text-white"
                >
                  <span>Open Full Drive Asset Folder</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
