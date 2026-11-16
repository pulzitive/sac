import { ArrowRight, ArrowUpRight, Briefcase, GraduationCap } from 'lucide-react';
import {
  CAPABILITIES,
  CLIENT_ROSTER,
  HERO_METRICS,
  PORTFOLIO_PROJECTS,
  PortfolioCategory,
  PortfolioProject,
  STUDIO_MEDIA,
  TESTIMONIALS,
} from '@/src/data/pulzitiveData';
import { MediaFrame } from '@/src/components/MediaFrame';
import { ActivePage } from '@/src/components/Navbar';
import { DiscoveryCallScheduler } from '@/src/components/DiscoveryCallScheduler';
import { usePortalAuth } from '@/src/context/PortalAuthContext';

interface HomePageProps {
  onNavigate: (
    page: ActivePage,
    sectionId?: string,
    portfolioFilter?: PortfolioCategory
  ) => void;
  onSelectProject: (project: PortfolioProject) => void;
  onOpenBriefModal: () => void;
}

export function HomePage({
  onNavigate,
  onSelectProject,
  onOpenBriefModal,
}: HomePageProps) {
  const flagshipProjects = PORTFOLIO_PROJECTS.slice(0, 3);
  const { user, openAuthModal } = usePortalAuth();

  return (
    <div>
      {/* 1. Hero Split Section */}
      <section className="mx-auto max-w-[1280px] px-6 pt-10 pb-12 lg:px-10 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between py-2 lg:col-span-6">
            <div>
              <p className="text-xs font-medium tracking-wide text-[#52525B]">
                Digital Branding · Performance Marketing · Creative Production
              </p>

              <h1
                className="mt-5 font-display font-semibold tracking-tight text-[#111113] [text-wrap:balance]"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.75rem)',
                  lineHeight: 1.06,
                }}
              >
                We architect iconic brand identities and commercial media.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#52525B]">
                Pulzitive is a senior creative branding, digital marketing, and
                media production agency partnering with ambitious financial,
                luxury, and consumer leaders across Lagos, London, and global
                markets.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('portfolio')}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#C026D3] px-6 py-3.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#A21CAF] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C026D3]"
                >
                  <span>Explore Selected Work</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    user ? onNavigate('client') : openAuthModal('client', 'client')
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D4D2CA] bg-white px-5 py-3.5 text-sm font-medium text-[#111113] transition-colors hover:border-[#C026D3] hover:text-[#A21CAF] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Briefcase className="h-4 w-4 text-[#A21CAF]" aria-hidden="true" />
                  <span>Client Portal · Free Audit</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenBriefModal}
                  className="inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium text-[#111113] underline decoration-[#D4D2CA] underline-offset-4 transition-colors hover:decoration-[#C026D3] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Schedule Discovery Call</span>
                </button>
              </div>
            </div>

            <div className="mt-10 border-t border-[#E5E3DD] pt-5 text-xs text-[#52525B]">
              <span>Featured in Archive</span>
              <span className="mx-2 text-[#A1A1AA]" aria-hidden="true">
                ·
              </span>
              <span>VAVADI® Watches, Access Bank, Sofri &amp; OMAGBADA</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="flex h-full min-h-[300px] items-end justify-center overflow-hidden rounded-2xl border border-[#E5E3DD] bg-white px-4 pt-6 sm:px-6">
              <img
                src={STUDIO_MEDIA.heroStudio}
                alt="Pulzitive creative branding, photography, and digital strategy team collaborating"
                className="h-auto max-h-[460px] w-full object-contain object-bottom"
              />
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column KPI Strip Below Hero Split */}
        <div className="mt-12 grid grid-cols-2 gap-6 border-y border-[#E5E3DD] py-8 lg:grid-cols-4 lg:gap-8">
          {HERO_METRICS.map((metric) => (
            <div key={metric.label} className="space-y-1.5">
              <div className="font-display text-3xl font-semibold tracking-tight text-[#111113] tabular-nums lg:text-4xl">
                {metric.value}
              </div>
              <p className="text-xs leading-relaxed text-[#52525B]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Subtle Editorial Marquee Divider */}
      <div className="overflow-hidden border-b border-[#E5E3DD] bg-[#F1EFEA] py-3.5">
        <div className="animate-marquee flex w-max items-center gap-8 text-xs font-medium tracking-wide text-[#52525B] whitespace-nowrap">
          <span>brand architecture</span>
          <span aria-hidden="true">·</span>
          <span>digital marketing campaigns</span>
          <span aria-hidden="true">·</span>
          <span>media production &amp; 3d motion</span>
          <span aria-hidden="true">·</span>
          <span>fintech ui/ux flagships</span>
          <span aria-hidden="true">·</span>
          <span>pulzitive academy cohorts</span>
          <span aria-hidden="true">·</span>
          <span>brand architecture</span>
          <span aria-hidden="true">·</span>
          <span>digital marketing campaigns</span>
          <span aria-hidden="true">·</span>
          <span>media production &amp; 3d motion</span>
          <span aria-hidden="true">·</span>
          <span>fintech ui/ux flagships</span>
          <span aria-hidden="true">·</span>
          <span>pulzitive academy cohorts</span>
        </div>
      </div>

      {/* 2. Core Capabilities Bento Grid */}
      <section
        id="capabilities"
        className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24"
      >
        <div className="flex flex-col justify-between gap-6 border-b border-[#E5E3DD] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium text-[#A21CAF]">
              Agency Capabilities
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight text-[#111113] [text-wrap:balance] lg:text-4xl">
              Four integrated practices built for high-growth and luxury brands.
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('portfolio')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#111113] hover:text-[#A21CAF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Browse Full Portfolio Archive</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {CAPABILITIES.map((cap) => (
            <article
              key={cap.number}
              className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E3DD] bg-white p-6 transition-colors duration-200 hover:border-[#111113]/40 lg:p-8 ${
                cap.span === 'wide' ? 'lg:col-span-2' : 'lg:col-span-1'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs font-medium text-[#71717A] tabular-nums">
                    {cap.number}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate('portfolio', undefined, cap.portfolioCategory)
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#111113] hover:text-[#A21CAF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>View Work</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-[#111113] lg:text-2xl">
                  {cap.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#52525B]">
                  {cap.summary}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#71717A]">
                  {cap.deliverables.map((del, idx) => (
                    <span key={del} className="inline-flex items-center gap-3">
                      <span>{del}</span>
                      {idx < cap.deliverables.length - 1 && (
                        <span aria-hidden="true">·</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl border border-[#E5E3DD]">
                <MediaFrame
                  src={cap.imageSrc}
                  alt={cap.imageAlt}
                  objectPosition={
                    cap.portfolioCategory === 'uiux' ? 'top' : 'center'
                  }
                  aspectClass={
                    cap.span === 'wide' ? 'aspect-[16/9]' : 'aspect-[4/3]'
                  }
                  imgClassName="transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Selected Flagship Case Studies (Dark Editorial Band) */}
      <section className="bg-[#0B0B0D] py-16 text-[#F8F7F4] lg:py-24">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <div className="flex flex-col justify-between gap-6 border-b border-[#27272A] pb-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium text-[#E879F9]">
                Selected Case Studies
              </p>
              <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight text-white [text-wrap:balance] lg:text-4xl">
                Verified client transformations from our studio archive.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('portfolio')}
              className="inline-flex items-center gap-2 rounded-lg border border-[#27272A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#E879F9] hover:text-[#E879F9] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>View All 11 Projects</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {flagshipProjects.map((project) => (
              <article
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#27272A] bg-[#141417] transition-colors duration-200 hover:border-[#E879F9]/60 cursor-pointer"
              >
                <div>
                  <MediaFrame
                    src={project.coverSrc}
                    alt={project.title}
                    objectPosition={project.coverPosition || 'center'}
                    aspectClass="aspect-[4/3]"
                    imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA]">
                      <span>{project.client}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.disciplineLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {project.year}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-white group-hover:text-[#E879F9] transition-colors">
                      {project.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
                      {project.summary}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#27272A] px-6 py-4">
                  <p className="text-xs font-medium text-[#E4E4E7]">
                    {project.outcomeMetric}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Client Roster Strip */}
          <div className="mt-16 border-t border-[#27272A] pt-10">
            <p className="text-xs font-medium text-[#71717A]">
              Selected Organizations &amp; Brands Served
            </p>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
              {CLIENT_ROSTER.map((brand) => (
                <div
                  key={brand}
                  className="font-display text-sm font-medium tracking-tight text-[#D4D4D8]"
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Founder Leadership & Attributable Testimonials */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="overflow-hidden rounded-2xl border border-[#E5E3DD] bg-[#ECEAE4]">
              <MediaFrame
                src={STUDIO_MEDIA.founderPortrait}
                alt="Salami Abiodun — Founder and Creative Director of Pulzitive Agency"
                aspectClass="aspect-[4/5]"
                objectPosition="top"
              />
            </div>
          </div>

          <div className="lg:col-span-8">
            <p className="text-xs font-medium text-[#A21CAF]">
              Studio Direction
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111113] [text-wrap:balance] lg:text-4xl">
              Led by Salami Abiodun — bridging agency precision with commercial
              scale.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#52525B]">
              With career leadership across Traction Apps and DisruptDNA—delivering
              high-visibility campaigns for Access Bank, Custodian Investment,
              Sparkle MFB, CardinalStone, and Lily Hospitals—alongside bespoke
              identities for VAVADI®, OMAGBADA, and Sofri, Pulzitive operates as a
              focused senior atelier without traditional agency bloat.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 border-t border-[#E5E3DD] pt-8 md:grid-cols-2">
              {TESTIMONIALS.slice(0, 2).map((item) => (
                <blockquote
                  key={item.name}
                  className="flex flex-col justify-between rounded-xl border border-[#E5E3DD] bg-white p-6"
                >
                  <p className="text-sm leading-relaxed text-[#27272A]">
                    “{item.quote}”
                  </p>
                  <footer className="mt-5 border-t border-[#F1EFEA] pt-4">
                    <div className="text-sm font-semibold text-[#111113]">
                      {item.name}
                    </div>
                    <div className="mt-0.5 text-xs text-[#52525B]">
                      {item.role} · {item.organization}
                    </div>
                    <div className="mt-2 text-xs font-medium text-[#A21CAF]">
                      {item.outcome}
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pulzitive Academy Feature Band */}
      <section className="border-y border-[#E5E3DD] bg-[#F1EFEA] py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="h-full overflow-hidden rounded-2xl border border-[#E5E3DD]">
                <img
                  src={STUDIO_MEDIA.academyAtelier}
                  alt="Pulzitive Academy masterclass workshop session"
                  referrerPolicy="no-referrer"
                  className="h-full min-h-[280px] w-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center lg:col-span-6 lg:pl-4">
              <p className="text-xs font-medium text-[#A21CAF]">
                Pulzitive Academy
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111113] [text-wrap:balance] lg:text-4xl">
                Training the next cohort of senior brand, motion &amp; product
                directors.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#52525B]">
                Our 10-to-12 week studio cohorts reverse-engineer real Pulzitive
                client deliverables—from VAVADI® horology packaging to Sofri
                fintech architecture—with weekly executive critiques capped at
                15 seats per track.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-6 text-xs font-medium text-[#52525B] tabular-nums">
                <span>15 Seats / Cohort</span>
                <span aria-hidden="true">·</span>
                <span>4 Live Client Briefs</span>
                <span aria-hidden="true">·</span>
                <span>94% 90-Day Placement</span>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('academy')}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#C026D3] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#A21CAF] cursor-pointer"
                >
                  <span>Explore Academy Curriculum</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    user ? onNavigate('student') : openAuthModal('student', 'student')
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D4D2CA] bg-white px-5 py-3.5 text-sm font-medium text-[#111113] transition-colors hover:border-[#C026D3] hover:text-[#A21CAF] cursor-pointer"
                >
                  <GraduationCap className="h-4 w-4 text-[#A21CAF]" aria-hidden="true" />
                  <span>Student Dashboard &amp; Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Inline Google Calendar + Google Meet Discovery Call Booking */}
      <section
        id="contact"
        className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24"
      >
        <div className="grid grid-cols-1 gap-12 rounded-2xl border border-[#E5E3DD] bg-white p-8 lg:grid-cols-12 lg:p-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium text-[#A21CAF]">
              Google Calendar &amp; Google Meet Booking
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111113] [text-wrap:balance]">
              Book a 30-minute discovery call directly on Google Meet.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#52525B]">
              Connect your Google account to check live slot availability on
              your calendar, select a 30-minute window, and receive an instant
              Google Calendar invitation with a dedicated Google Meet video
              link.
            </p>
            <div className="mt-8 space-y-3 border-t border-[#E5E3DD] pt-6 text-sm text-[#52525B]">
              <div>
                <span className="font-medium text-[#111113]">Direct Desk:</span>{' '}
                hello@pulzitive.agency
              </div>
              <div>
                <span className="font-medium text-[#111113]">
                  Studio Archive:
                </span>{' '}
                <a
                  href={STUDIO_MEDIA.driveRootUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[#D4D2CA] underline-offset-4 hover:text-[#111113]"
                >
                  Inspect Full Google Drive Portfolio
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <DiscoveryCallScheduler compact />
          </div>
        </div>
      </section>
    </div>
  );
}
