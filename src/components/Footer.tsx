import { ArrowUpRight } from 'lucide-react';
import { ActivePage } from './Navbar';
import { STUDIO_MEDIA } from '@/src/data/pulzitiveData';
import { usePortalAuth } from '@/src/context/PortalAuthContext';

interface FooterProps {
  onNavigate: (page: ActivePage, sectionId?: string) => void;
  onOpenBriefModal: () => void;
}

export function Footer({ onNavigate, onOpenBriefModal }: FooterProps) {
  const { user, openAuthModal } = usePortalAuth();

  const handlePortalJump = (role: 'student' | 'client', target: 'student' | 'client' | 'admin') => {
    if (user) {
      onNavigate(target);
    } else {
      openAuthModal(role, target);
    }
  };

  return (
    <footer className="border-t border-[#27272A] bg-[#0B0B0D] text-[#F8F7F4]">
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="font-display text-2xl font-bold tracking-tight text-white cursor-pointer"
            >
              Pulzitive
            </button>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#A1A1AA]">
              Digital branding media, performance marketing, creative media
              production, and executive creative education led by Salami Abiodun.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <button
                type="button"
                onClick={onOpenBriefModal}
                className="font-medium text-[#E879F9] hover:text-white transition-colors cursor-pointer"
              >
                Schedule Discovery Call
              </button>
              <span className="text-[#3F3F46]" aria-hidden="true">
                ·
              </span>
              <a
                href={STUDIO_MEDIA.driveRootUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#D4D4D8] hover:text-white transition-colors"
              >
                <span>Source Drive Archive</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase">
              Agency
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#D4D4D8]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home', 'capabilities')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Capabilities
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('portfolio')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Portfolio Archive
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('academy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pulzitive Academy
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase">
              Portals &amp; Dashboards
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#D4D4D8]">
              <li>
                <button
                  type="button"
                  onClick={() => handlePortalJump('client', 'client')}
                  className="hover:text-[#E879F9] transition-colors cursor-pointer"
                >
                  Client Portal &amp; Free Audit
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handlePortalJump('student', 'student')}
                  className="hover:text-[#E879F9] transition-colors cursor-pointer"
                >
                  Student Portal &amp; Certificates
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handlePortalJump('client', 'admin')}
                  className="hover:text-[#E879F9] transition-colors cursor-pointer"
                >
                  Admin Operations Console
                </button>
              </li>
              <li className="text-[#A1A1AA]">Brand · Media · Digital Marketing</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase">
              Direct Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#D4D4D8]">
              <li>
                <a
                  href="mailto:hello@pulzitive.agency"
                  className="hover:text-white transition-colors"
                >
                  hello@pulzitive.agency
                </a>
              </li>
              <li className="text-[#A1A1AA]">Lagos · London · Remote</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[#27272A] pt-8 text-xs text-[#71717A] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Pulzitive Agency. All rights reserved.</p>
          <p>Portfolio archive curated from verified studio &amp; client productions.</p>
        </div>
      </div>
    </footer>
  );
}
