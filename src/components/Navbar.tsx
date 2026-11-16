import { useState } from 'react';
import { LogOut, Menu, ShieldCheck, UserCircle2, X } from 'lucide-react';
import { usePortalAuth } from '@/src/context/PortalAuthContext';

export type ActivePage =
  | 'home'
  | 'portfolio'
  | 'academy'
  | 'student'
  | 'client'
  | 'admin';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage, sectionId?: string) => void;
  onOpenBriefModal: () => void;
}

export function Navbar({
  activePage,
  onNavigate,
  onOpenBriefModal,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, isAdmin, openAuthModal, signOut } = usePortalAuth();

  const handleLinkClick = (page: ActivePage, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(page, sectionId);
  };

  const primaryPortalRoute: ActivePage = isAdmin
    ? 'admin'
    : profile?.role === 'student'
    ? 'student'
    : 'client';

  const primaryPortalLabel = isAdmin
    ? 'Admin Console'
    : profile?.role === 'student'
    ? 'Student Portal'
    : 'Client Portal';

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E3DD] bg-[#F8F7F4]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 py-4 lg:px-10">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick('home')}
          className="font-display text-xl font-bold tracking-tight text-[#111113] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C026D3] cursor-pointer"
        >
          Pulzitive
        </button>

        {/* Zone 2: Primary navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#52525B]"
        >
          <button
            type="button"
            onClick={() => handleLinkClick('home')}
            className={`relative py-1 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C026D3] ${
              activePage === 'home'
                ? 'text-[#111113] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-[#C026D3]'
                : 'hover:text-[#111113]'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('home', 'capabilities')}
            className="py-1 transition-colors duration-150 hover:text-[#111113] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C026D3]"
          >
            Capabilities
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('portfolio')}
            className={`relative py-1 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C026D3] ${
              activePage === 'portfolio'
                ? 'text-[#111113] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-[#C026D3]'
                : 'hover:text-[#111113]'
            }`}
          >
            Portfolio
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('academy')}
            className={`relative py-1 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C026D3] ${
              activePage === 'academy'
                ? 'text-[#111113] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-[#C026D3]'
                : 'hover:text-[#111113]'
            }`}
          >
            Academy
          </button>
        </nav>

        {/* Zone 3: Portal Auth / Dashboard + Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleLinkClick('admin')}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium whitespace-nowrap cursor-pointer ${
                    activePage === 'admin'
                      ? 'border-[#C026D3] bg-[#C026D3] text-white'
                      : 'border-[#D4D2CA] bg-white text-[#111113] hover:border-[#C026D3]'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Admin</span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  profile
                    ? handleLinkClick(
                        profile.role === 'student' ? 'student' : 'client'
                      )
                    : isAdmin
                    ? handleLinkClick('admin')
                    : openAuthModal('client')
                }
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium whitespace-nowrap cursor-pointer ${
                  activePage === 'student' || activePage === 'client'
                    ? 'border-[#111113] bg-[#111113] text-white'
                    : 'border-[#D4D2CA] bg-white text-[#111113] hover:border-[#111113]'
                }`}
              >
                <UserCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {profile
                    ? profile.role === 'student'
                      ? 'Student Portal'
                      : 'Client Portal'
                    : primaryPortalLabel}
                </span>
              </button>

              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                aria-label="Sign out of Pulzitive portal"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E3DD] bg-white text-[#52525B] hover:border-[#111113] hover:text-[#111113] cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('client')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#D4D2CA] bg-white px-4 py-2.5 text-xs font-medium text-[#111113] transition-colors hover:border-[#C026D3] hover:text-[#A21CAF] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign In / Up</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenBriefModal}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#C026D3] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#A21CAF] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C026D3]"
          >
            Start a Project
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E3DD] text-[#111113] md:hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-[#C026D3]"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E5E3DD] bg-[#F8F7F4] px-6 py-5 md:hidden">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className={`min-h-[44px] text-left text-base font-medium ${
                activePage === 'home' ? 'text-[#A21CAF]' : 'text-[#111113]'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('home', 'capabilities')}
              className="min-h-[44px] text-left text-base font-medium text-[#111113]"
            >
              Capabilities
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('portfolio')}
              className={`min-h-[44px] text-left text-base font-medium ${
                activePage === 'portfolio' ? 'text-[#A21CAF]' : 'text-[#111113]'
              }`}
            >
              Portfolio
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('academy')}
              className={`min-h-[44px] text-left text-base font-medium ${
                activePage === 'academy' ? 'text-[#A21CAF]' : 'text-[#111113]'
              }`}
            >
              Academy
            </button>

            <div className="mt-2 border-t border-[#E5E3DD] pt-3 space-y-2.5">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleLinkClick(
                        profile?.role === 'student'
                          ? 'student'
                          : isAdmin
                          ? 'admin'
                          : 'client'
                      )
                    }
                    className="min-h-[44px] w-full rounded-lg border border-[#D4D2CA] bg-white px-4 py-2.5 text-left text-sm font-medium text-[#111113]"
                  >
                    Open {primaryPortalLabel}
                  </button>
                  {isAdmin && primaryPortalRoute !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleLinkClick('admin')}
                      className="min-h-[44px] w-full rounded-lg border border-[#D4D2CA] bg-white px-4 py-2.5 text-left text-sm font-medium text-[#111113]"
                    >
                      Admin Console
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      void signOut();
                    }}
                    className="min-h-[44px] w-full rounded-lg border border-[#E5E3DD] px-4 py-2.5 text-left text-sm text-[#52525B]"
                  >
                    Sign Out ({user.email})
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('client');
                  }}
                  className="min-h-[44px] w-full rounded-lg border border-[#D4D2CA] bg-white px-5 py-2.5 text-center text-sm font-medium text-[#111113]"
                >
                  Sign In / Sign Up (Student &amp; Client)
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBriefModal();
                }}
                className="min-h-[44px] w-full rounded-lg bg-[#C026D3] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#A21CAF]"
              >
                Start a Project
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
