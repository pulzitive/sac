/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { ActivePage, Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { ProjectLightbox } from '@/src/components/ProjectLightbox';
import { BriefModal } from '@/src/components/BriefModal';
import { WhatsAppBot } from '@/src/components/WhatsAppBot';
import { PortalAuthModal } from '@/src/components/PortalAuthModal';
import { PortalAuthProvider } from '@/src/context/PortalAuthContext';
import { HomePage } from '@/src/pages/HomePage';
import { PortfolioPage } from '@/src/pages/PortfolioPage';
import { AcademyPage } from '@/src/pages/AcademyPage';
import { StudentDashboardPage } from '@/src/pages/StudentDashboardPage';
import { ClientDashboardPage } from '@/src/pages/ClientDashboardPage';
import { AdminDashboardPage } from '@/src/pages/AdminDashboardPage';
import { PortfolioCategory, PortfolioProject } from '@/src/data/pulzitiveData';

function getPageFromHash(): ActivePage {
  const hash = window.location.hash.replace('#', '').replace('/', '');
  if (hash === 'portfolio') return 'portfolio';
  if (hash === 'academy') return 'academy';
  if (hash === 'student') return 'student';
  if (hash === 'client') return 'client';
  if (hash === 'admin') return 'admin';
  return 'home';
}

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>(() =>
    getPageFromHash()
  );
  const [portfolioCategory, setPortfolioCategory] =
    useState<PortfolioCategory>('all');
  const [selectedProject, setSelectedProject] =
    useState<PortfolioProject | null>(null);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [briefSubject, setBriefSubject] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      setActivePage(getPageFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = useCallback(
    (
      page: ActivePage,
      sectionId?: string,
      filterCategory?: PortfolioCategory
    ) => {
      setActivePage(page);
      if (filterCategory) {
        setPortfolioCategory(filterCategory);
      } else if (page === 'portfolio' && activePage !== 'portfolio') {
        setPortfolioCategory('all');
      }

      const nextHash = page === 'home' ? '#/' : `#/${page}`;
      if (window.location.hash !== nextHash) {
        window.history.pushState(null, '', nextHash);
      }

      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [activePage]
  );

  const handleOpenBriefModal = (subject = '') => {
    setBriefSubject(subject);
    setBriefModalOpen(true);
  };

  return (
    <PortalAuthProvider
      onNavigateDashboard={(dash) => handleNavigate(dash)}
    >
      <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#111113]">
        <Navbar
          activePage={activePage}
          onNavigate={(page, sectionId) => handleNavigate(page, sectionId)}
          onOpenBriefModal={() => handleOpenBriefModal()}
        />

        <main className="flex-1">
          {activePage === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              onSelectProject={setSelectedProject}
              onOpenBriefModal={() => handleOpenBriefModal()}
            />
          )}

          {activePage === 'portfolio' && (
            <PortfolioPage
              activeCategory={portfolioCategory}
              onCategoryChange={setPortfolioCategory}
              onSelectProject={setSelectedProject}
              onOpenBriefModal={handleOpenBriefModal}
            />
          )}

          {activePage === 'academy' && (
            <AcademyPage onNavigate={handleNavigate} />
          )}

          {activePage === 'student' && (
            <StudentDashboardPage onNavigate={handleNavigate} />
          )}

          {activePage === 'client' && <ClientDashboardPage />}

          {activePage === 'admin' && <AdminDashboardPage />}
        </main>

        <Footer
          onNavigate={(page, sectionId) => handleNavigate(page, sectionId)}
          onOpenBriefModal={() => handleOpenBriefModal()}
        />

        <ProjectLightbox
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onRequestSimilar={(title) => handleOpenBriefModal(title)}
        />

        <BriefModal
          isOpen={briefModalOpen}
          initialSubject={briefSubject}
          onClose={() => setBriefModalOpen(false)}
        />

        <PortalAuthModal
          onNavigateDashboard={(dash) => handleNavigate(dash)}
        />

        <WhatsAppBot
          onNavigate={(page, sectionId) => handleNavigate(page, sectionId)}
          onOpenBriefModal={() => handleOpenBriefModal()}
        />
      </div>
    </PortalAuthProvider>
  );
}
