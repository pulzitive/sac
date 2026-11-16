import { useState } from 'react';
import { ArrowUpRight, Briefcase, Download, Play, X } from 'lucide-react';
import {
  LOGOFOLIO_MARKS,
  LogofolioMark,
  MOTION_REELS,
  PORTFOLIO_PROJECTS,
  PortfolioCategory,
  PortfolioProject,
  STUDIO_MEDIA,
} from '@/src/data/pulzitiveData';
import { MediaFrame } from '@/src/components/MediaFrame';
import { usePortalAuth } from '@/src/context/PortalAuthContext';

interface PortfolioPageProps {
  activeCategory: PortfolioCategory;
  onCategoryChange: (category: PortfolioCategory) => void;
  onSelectProject: (project: PortfolioProject) => void;
  onOpenBriefModal: (subject?: string) => void;
}

const FILTER_TABS: { id: PortfolioCategory; label: string }[] = [
  { id: 'all', label: 'All Work' },
  { id: 'branding', label: 'Brand Identity' },
  { id: 'campaigns', label: 'Campaigns & Print' },
  { id: 'uiux', label: 'UI/UX & Product' },
  { id: 'motion', label: 'Media & Motion' },
  { id: 'logofolio', label: 'Logofolio' },
];

export function PortfolioPage({
  activeCategory,
  onCategoryChange,
  onSelectProject,
  onOpenBriefModal,
}: PortfolioPageProps) {
  const { user, openAuthModal } = usePortalAuth();
  const [activeReel, setActiveReel] = useState<(typeof MOTION_REELS)[0] | null>(
    null
  );
  const [selectedLogo, setSelectedLogo] = useState<LogofolioMark | null>(null);

  const filteredProjects =
    activeCategory === 'all'
      ? PORTFOLIO_PROJECTS
      : activeCategory === 'logofolio'
      ? []
      : PORTFOLIO_PROJECTS.filter((p) => p.category === activeCategory);

  const showMotionSection =
    activeCategory === 'all' || activeCategory === 'motion';
  const showLogofolioSection =
    activeCategory === 'all' || activeCategory === 'logofolio';

  return (
    <div>
      {/* Portfolio Header */}
      <section className="border-b border-[#E5E3DD] bg-[#F8F7F4]">
        <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-10 lg:py-20">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-medium text-[#A21CAF]">
                Pulzitive Archive · Curated Works
              </p>
              <h1
                className="mt-3 max-w-3xl font-display font-semibold tracking-tight text-[#111113] [text-wrap:balance]"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                  lineHeight: 1.08,
                }}
              >
                Selected brand systems, fintech products, and commercial reels.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#52525B]">
                Every project below is sourced directly from Salami Abiodun and
                Pulzitive Agency’s live production archive—spanning luxury
                horology, banking campaigns, editorial print, 3D motion, and
                digital product design.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start lg:self-end shrink-0">
              <a
                href={STUDIO_MEDIA.resumePdfUrl}
                download="Salami-Abiodun-Resume.pdf"
                className="inline-flex items-center gap-2 rounded-lg bg-[#C026D3] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A21CAF] whitespace-nowrap shrink-0"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download Resume (PDF)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (user) {
                    window.location.hash = '#/client';
                  } else {
                    openAuthModal('client', 'client');
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-[#D4D2CA] bg-white px-5 py-3 text-sm font-medium text-[#111113] transition-colors hover:border-[#C026D3] hover:text-[#A21CAF] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Briefcase className="h-4 w-4 text-[#A21CAF]" aria-hidden="true" />
                <span>Client Portal · Free Audit</span>
              </button>

              <a
                href={STUDIO_MEDIA.driveRootUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#D4D2CA] bg-white px-5 py-3 text-sm font-medium text-[#111113] transition-colors hover:border-[#111113] whitespace-nowrap shrink-0"
              >
                <span>Open Source Google Drive</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Interactive Discipline Filter Controls */}
          <div
            role="tablist"
            aria-label="Portfolio discipline filters"
            className="mt-10 flex flex-wrap items-center gap-1.5 rounded-xl border border-[#E5E3DD] bg-[#F1EFEA] p-1.5 w-fit"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onCategoryChange(tab.id)}
                  className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A21CAF] ${
                    isActive
                      ? 'bg-white text-[#111113] shadow-sm'
                      : 'text-[#52525B] hover:text-[#111113]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Bento Showcase Grid */}
      {filteredProjects.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-6 py-14 lg:px-10 lg:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E3DD] bg-white transition-all duration-200 hover:border-[#111113]/50 cursor-pointer ${
                  project.featuredSpan === 'wide' && activeCategory === 'all'
                    ? 'lg:col-span-2'
                    : 'lg:col-span-1'
                }`}
              >
                <div>
                  <MediaFrame
                    src={project.coverSrc}
                    alt={project.title}
                    objectPosition={project.coverPosition || 'center'}
                    aspectClass={
                      project.featuredSpan === 'wide' && activeCategory === 'all'
                        ? 'aspect-[16/10]'
                        : 'aspect-[4/3]'
                    }
                    imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                  />

                  <div className="p-6 lg:p-7">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#71717A]">
                      <span>{project.client}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.disciplineLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {project.year}
                      </span>
                    </div>

                    <h2 className="mt-2.5 font-display text-xl font-semibold tracking-tight text-[#111113] group-hover:text-[#A21CAF] transition-colors lg:text-2xl">
                      {project.title}
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-[#52525B]">
                      {project.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-[#F1EFEA] px-6 py-4 lg:px-7">
                  <span className="text-xs font-medium text-[#27272A]">
                    {project.gallery.length} Case Study{' '}
                    {project.gallery.length === 1 ? 'Frame' : 'Frames'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#111113] group-hover:text-[#A21CAF] transition-colors whitespace-nowrap shrink-0">
                    <span>Inspect Case Study</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Commercial Media & Motion Reels Section */}
      {showMotionSection && (
        <section className="bg-[#0B0B0D] py-16 text-[#F8F7F4] lg:py-24">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="flex flex-col justify-between gap-6 border-b border-[#27272A] pb-8 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-medium text-[#E879F9]">
                  05. Video &amp; Animation Archive
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white [text-wrap:balance] lg:text-4xl">
                  Commercial reels, 3D stack sequences &amp; launch teasers.
                </h2>
              </div>
              <a
                href="https://drive.google.com/drive/folders/11idhf6TEs-Nszg8V6vhfAMioYjkw0YvN"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#D4D4D8] hover:text-[#E879F9] transition-colors whitespace-nowrap shrink-0"
              >
                <span>View All 18 Reels in Drive</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {MOTION_REELS.map((reel, index) => (
                <div
                  key={reel.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#141417] p-6 transition-colors hover:border-[#E879F9]/60"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                      <span className="font-mono tabular-nums">
                        {String(index + 1).padStart(2, '0')}.
                      </span>
                      <span>{reel.format}</span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-white">
                      {reel.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#A1A1AA]">{reel.client}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#27272A] pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveReel(reel)}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#C026D3] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#A21CAF] cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Preview Reel</span>
                    </button>
                    <a
                      href={`https://drive.google.com/file/d/${reel.id}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      <span>Drive File</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Logofolio Monograph Section */}
      {showLogofolioSection && (
        <section className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
          <div className="flex flex-col justify-between gap-6 border-b border-[#E5E3DD] pb-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium text-[#A21CAF]">
                02. Logofolio Monograph
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111113] [text-wrap:balance] lg:text-4xl">
                Distinctive brand marks &amp; monograms engineered to endure.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOpenBriefModal('Custom Brand Mark & Logofolio')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C026D3] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#A21CAF] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Commission a Brand Mark</span>
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {LOGOFOLIO_MARKS.map((mark) => (
              <button
                key={mark.id}
                type="button"
                onClick={() => setSelectedLogo(mark)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E3DD] bg-white text-left transition-colors hover:border-[#111113] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A21CAF]"
              >
                <MediaFrame
                  src={mark.src}
                  alt={`${mark.name} logo mark`}
                  aspectClass="aspect-square"
                  imgClassName="transition-transform duration-300 group-hover:scale-[1.04]"
                />
                <div className="p-4">
                  <div className="font-display text-sm font-semibold text-[#111113]">
                    {mark.name}
                  </div>
                  <div className="mt-1 text-xs text-[#71717A]">
                    {mark.sector} · <span className="tabular-nums">{mark.year}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Embedded Reel Preview Modal */}
      {activeReel && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reel-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setActiveReel(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-[#27272A] bg-[#0B0B0D] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#27272A] px-6 py-4">
              <div>
                <div className="text-xs text-[#A1A1AA]">
                  {activeReel.client} · {activeReel.format}
                </div>
                <h3
                  id="reel-modal-title"
                  className="mt-0.5 font-display text-lg font-semibold"
                >
                  {activeReel.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReel(null)}
                aria-label="Close video preview"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#27272A] text-[#D4D4D8] hover:bg-white hover:text-[#111113] cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                title={activeReel.title}
                src={`https://drive.google.com/file/d/${activeReel.id}/preview`}
                className="h-full w-full border-0"
                allow="autoplay; fullscreen"
              />
            </div>
          </div>
        </div>
      )}

      {/* Logo Mark Detail Modal */}
      {selectedLogo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logo-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setSelectedLogo(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E5E3DD] bg-white text-[#111113]"
            onClick={(e) => e.stopPropagation()}
          >
            <MediaFrame
              src={selectedLogo.src}
              alt={selectedLogo.name}
              aspectClass="aspect-square"
            />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-[#71717A]">
                    {selectedLogo.sector} ·{' '}
                    <span className="tabular-nums">{selectedLogo.year}</span>
                  </div>
                  <h3
                    id="logo-modal-title"
                    className="mt-1 font-display text-2xl font-semibold"
                  >
                    {selectedLogo.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLogo(null)}
                  aria-label="Close mark detail"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E3DD] text-[#52525B] hover:bg-[#111113] hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#52525B]">
                {selectedLogo.notes}
              </p>
              <button
                type="button"
                onClick={() => {
                  const name = selectedLogo.name;
                  setSelectedLogo(null);
                  onOpenBriefModal(`Brand Identity & Logofolio (${name})`);
                }}
                className="mt-6 w-full rounded-lg bg-[#C026D3] px-5 py-3 text-sm font-medium text-white hover:bg-[#A21CAF] transition-colors cursor-pointer"
              >
                Inquire About Brand Identity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
