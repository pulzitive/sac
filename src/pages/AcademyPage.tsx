import { FormEvent, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  GraduationCap,
  Loader2,
  Video,
} from 'lucide-react';
import {
  ACADEMY_TRACKS,
  STUDIO_MEDIA,
  TESTIMONIALS,
} from '@/src/data/pulzitiveData';
import { MediaFrame } from '@/src/components/MediaFrame';
import { GoogleSignInButton } from '@/src/components/GoogleSignInButton';
import { ActivePage } from '@/src/components/Navbar';
import { usePortalAuth } from '@/src/context/PortalAuthContext';
import { createStudentEnrollment } from '@/src/lib/pulzitiveDb';
import {
  CohortEnrollmentResult,
  getAccessToken,
  getCurrentUser,
  googleSignIn,
  initAuth,
  joinCohortWithCalendarAndMeet,
  logoutGoogle,
} from '@/src/lib/googleWorkspace';

type CohortFormat = 'studio' | 'executive';

const COHORT_SCHEDULES: Record<
  CohortFormat,
  {
    label: string;
    cadence: string;
    nextStart: string;
    startDateIso: string;
    startTimeWat: string;
    kickoffLabel: string;
    tuition: string;
    seatsRemaining: string;
    notes: string;
  }
> = {
  studio: {
    label: 'Full-Time Studio Immersion',
    cadence: 'Mon – Thu · 10:00 AM – 3:00 PM WAT',
    nextStart: 'January 19, 2027',
    startDateIso: '2027-01-19',
    startTimeWat: '10:00',
    kickoffLabel: 'Jan 19, 2027 · 10:00 AM – 11:30 AM WAT',
    tuition: '₦95,000',
    seatsRemaining: '6 of 15 Seats Open',
    notes:
      'Subsidized Cohort 06 rate (previously ₦180,000). Flexible 2-part installment available (₦47,500 deposit). Includes in-studio Lagos atelier access & live production sessions.',
  },
  executive: {
    label: 'Executive Weekend Cohort',
    cadence: 'Fri Eve & Saturdays · Live Remote + Critique Labs',
    nextStart: 'February 6, 2027',
    startDateIso: '2027-02-06',
    startTimeWat: '17:00',
    kickoffLabel: 'Feb 6, 2027 · 5:00 PM – 6:30 PM WAT',
    tuition: '₦65,000',
    seatsRemaining: '9 of 15 Seats Open',
    notes:
      'Subsidized Cohort 06 rate (previously ₦120,000). Flexible 2-part installment available (₦32,500 deposit). Built for working designers, marketers & founders.',
  },
};

interface AcademyPageProps {
  onNavigate?: (page: ActivePage) => void;
}

export function AcademyPage({ onNavigate }: AcademyPageProps) {
  const { user: portalUser, profile: portalProfile, openAuthModal, recordActivity } =
    usePortalAuth();
  const [selectedTrackId, setSelectedTrackId] = useState(ACADEMY_TRACKS[0].id);
  const [openModuleIdx, setOpenModuleIdx] = useState<number | null>(0);
  const [cohortFormat, setCohortFormat] = useState<CohortFormat>('studio');

  // Google Workspace Auth state
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Cohort enrollment & Calendar/Meet state
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantTrack, setApplicantTrack] = useState(ACADEMY_TRACKS[0].title);
  const [applicantPortfolio, setApplicantPortfolio] = useState('');
  const [applicantGoal, setApplicantGoal] = useState('');
  const [formError, setFormError] = useState('');
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentResult, setEnrollmentResult] =
    useState<CohortEnrollmentResult | null>(null);
  const [copiedMeet, setCopiedMeet] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, accessToken) => {
        setUser(authUser);
        setToken(accessToken);
        setApplicantName((prev) => prev || authUser.displayName || '');
        setApplicantEmail((prev) => prev || authUser.email || '');
      },
      () => {
        setToken(getAccessToken());
        setUser(getCurrentUser());
      }
    );
    return () => unsubscribe();
  }, []);

  const activeTrack =
    ACADEMY_TRACKS.find((t) => t.id === selectedTrackId) || ACADEMY_TRACKS[0];
  const activeSchedule = COHORT_SCHEDULES[cohortFormat];

  const handleTrackSwitch = (trackId: string) => {
    setSelectedTrackId(trackId);
    setOpenModuleIdx(0);
    const matched = ACADEMY_TRACKS.find((t) => t.id === trackId);
    if (matched) setApplicantTrack(matched.title);
  };

  const handleGoogleConnect = async () => {
    setFormError('');
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      setUser(res.user);
      setToken(res.accessToken);
      setApplicantName((prev) => prev || res.user.displayName || '');
      setApplicantEmail((prev) => prev || res.user.email || '');
    } catch (err: any) {
      setFormError(
        err?.message ||
          'Google sign-in was cancelled or blocked. Please allow the popup and try again.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setAwaitingConfirmation(false);
  };

  const handleApplySubmit = (e: FormEvent) => {
    e.preventDefault();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!token) {
      setFormError(
        'Please sign in with Google first so we can add Cohort 06 kickoff to your Google Calendar and generate your Google Meet room.'
      );
      return;
    }
    if (!applicantName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!emailPattern.test(applicantEmail.trim())) {
      setFormError('Please enter a valid email address for the calendar invite.');
      return;
    }
    if (!applicantGoal.trim()) {
      setFormError('Please share your current role and creative goals.');
      return;
    }
    setFormError('');
    setAwaitingConfirmation(true);
  };

  const handleConfirmEnrollment = async () => {
    if (!token) {
      setAwaitingConfirmation(false);
      setFormError('Google session expired. Please sign in with Google again.');
      return;
    }

    setIsEnrolling(true);
    setFormError('');
    try {
      const result = await joinCohortWithCalendarAndMeet(token, {
        name: applicantName.trim(),
        email: applicantEmail.trim(),
        trackTitle: applicantTrack,
        cohortFormat,
        formatLabel: activeSchedule.label,
        cadence: activeSchedule.cadence,
        tuition: activeSchedule.tuition,
        startDateIso: activeSchedule.startDateIso,
        startTimeWat: activeSchedule.startTimeWat,
        portfolioUrl: applicantPortfolio.trim() || undefined,
        goals: applicantGoal.trim(),
      });
      setEnrollmentResult(result);
      setAwaitingConfirmation(false);
      if (portalUser) {
        if (portalProfile) {
          const matchedTrack =
            ACADEMY_TRACKS.find((t) => t.title === applicantTrack) ||
            ACADEMY_TRACKS[0];
          void createStudentEnrollment({
            studentUid: portalUser.uid,
            studentName: applicantName.trim(),
            studentEmail: applicantEmail.trim(),
            trackId: matchedTrack.id,
            trackTitle: applicantTrack,
            cohortFormat,
            cohortLabel: `${activeSchedule.label} (${activeSchedule.tuition})`,
            startDate: activeSchedule.nextStart,
            meetLink: result.meetLink || '',
          }).catch(() => {});
        }
        void recordActivity(
          'cohort',
          `Joined Cohort 06 via Google Meet (${applicantTrack})`,
          `${activeSchedule.label} · ${activeSchedule.nextStart}`
        );
      }
    } catch (err: any) {
      setFormError(
        err?.message ||
          'Unable to schedule the Cohort 06 Google Calendar & Meet session. Please verify permissions and retry.'
      );
      setAwaitingConfirmation(false);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCopyMeet = () => {
    if (!enrollmentResult?.meetLink) return;
    navigator.clipboard?.writeText(enrollmentResult.meetLink);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  };

  const scrollToApply = () => {
    const el = document.getElementById('academy-apply');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* 1. Academy Editorial Split Hero */}
      <section className="mx-auto max-w-[1280px] px-6 pt-10 pb-12 lg:px-10 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between py-2 lg:col-span-6">
            <div>
              <p className="text-xs font-medium text-[#A21CAF]">
                Pulzitive Academy · Cohort 06 Admissions Open
              </p>
              <h1
                className="mt-4 font-display font-semibold tracking-tight text-[#111113] [text-wrap:balance]"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                  lineHeight: 1.07,
                }}
              >
                Executive creative education built on live agency briefs.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#52525B]">
                Pulzitive Academy trains mid-to-senior brand designers, growth
                marketers, motion directors, and product architects using real
                commercial deliverables from our agency archive—never textbook
                theory.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToApply}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#C026D3] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#A21CAF] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Join Next Cohort on Meet</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    portalUser
                      ? onNavigate?.('student')
                      : openAuthModal('student', 'student')
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D4D2CA] bg-white px-5 py-3.5 text-sm font-medium text-[#111113] transition-colors hover:border-[#C026D3] hover:text-[#A21CAF] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <GraduationCap className="h-4 w-4 text-[#A21CAF]" aria-hidden="true" />
                  <span>Student Dashboard &amp; Certificate</span>
                </button>
                <a
                  href="#tracks"
                  className="px-3 py-3 text-sm font-medium text-[#111113] underline decoration-[#D4D2CA] underline-offset-4 hover:decoration-[#C026D3] whitespace-nowrap shrink-0"
                >
                  Review 4 Curriculum Tracks
                </a>
              </div>
            </div>

            <div className="mt-10 border-t border-[#E5E3DD] pt-5 text-xs text-[#52525B]">
              <span>Lead Director: Salami Abiodun</span>
              <span className="mx-2 text-[#A1A1AA]" aria-hidden="true">
                ·
              </span>
              <span>Capped at 15 Fellows per Track</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full overflow-hidden rounded-2xl border border-[#E5E3DD]">
              <img
                src={STUDIO_MEDIA.academyAtelier}
                alt="Pulzitive Academy small-cohort studio critique session"
                referrerPolicy="no-referrer"
                className="h-full min-h-[320px] w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 4-Column Outcome Strip */}
        <div className="mt-12 grid grid-cols-2 gap-6 border-y border-[#E5E3DD] py-8 lg:grid-cols-4 lg:gap-8">
          <div className="space-y-1.5">
            <div className="font-display text-3xl font-semibold tracking-tight text-[#111113] tabular-nums lg:text-4xl">
              12 Weeks
            </div>
            <p className="text-xs text-[#52525B]">
              Intensive Studio &amp; Critique Cadence
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="font-display text-3xl font-semibold tracking-tight text-[#111113] tabular-nums lg:text-4xl">
              15 Seats
            </div>
            <p className="text-xs text-[#52525B]">
              Strict Cohort Cap for Direct Mentorship
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="font-display text-3xl font-semibold tracking-tight text-[#111113] tabular-nums lg:text-4xl">
              4 Briefs
            </div>
            <p className="text-xs text-[#52525B]">
              Live Agency Case Deconstructions &amp; Capstones
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="font-display text-3xl font-semibold tracking-tight text-[#111113] tabular-nums lg:text-4xl">
              94%
            </div>
            <p className="text-xs text-[#52525B]">
              Alumni Senior Role or Retainer Placement in 90 Days
            </p>
          </div>
        </div>
      </section>

      {/* 2. Interactive Four-Track Curriculum Explorer */}
      <section id="tracks" className="bg-[#0B0B0D] py-16 text-[#F8F7F4] lg:py-24">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <div className="border-b border-[#27272A] pb-8">
            <p className="text-xs font-medium text-[#E879F9]">
              Curriculum Architecture
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight text-white [text-wrap:balance] lg:text-4xl">
              Four specialized fellowships mirroring our studio practices.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Track Selector Sidebar */}
            <div className="space-y-3 lg:col-span-5">
              {ACADEMY_TRACKS.map((track) => {
                const isSelected = track.id === activeTrack.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleTrackSwitch(track.id)}
                    className={`w-full rounded-xl border p-5 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#E879F9] bg-[#16161A]'
                        : 'border-[#27272A] bg-[#111114] hover:border-[#3F3F46]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#E879F9] tabular-nums">
                        {track.number}
                      </span>
                      <span className="text-[#A1A1AA] tabular-nums">
                        {track.duration}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold text-white">
                      {track.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#A1A1AA]">{track.format}</p>
                  </button>
                );
              })}
            </div>

            {/* Active Track Syllabus Detail */}
            <div className="rounded-2xl border border-[#27272A] bg-[#141417] p-6 lg:col-span-7 lg:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA]">
                <span className="font-mono text-[#E879F9] tabular-nums">
                  {activeTrack.duration}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeTrack.format}</span>
                <span aria-hidden="true">·</span>
                <span>{activeTrack.mentor}</span>
              </div>

              <h3 className="mt-3 font-display text-2xl font-semibold text-white lg:text-3xl">
                {activeTrack.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-[#D4D4D8]">
                {activeTrack.summary}
              </p>

              <div className="mt-5 rounded-xl border border-[#27272A] bg-[#0B0B0D] p-4 text-xs text-[#A1A1AA]">
                <span className="font-semibold text-white">
                  Studio Case Reference:
                </span>{' '}
                {activeTrack.caseReference}
              </div>

              {/* Outcomes */}
              <div className="mt-6">
                <h4 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase">
                  Graduate Deliverables
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-[#E4E4E7]">
                  {activeTrack.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-2">
                      <span className="text-[#E879F9]" aria-hidden="true">
                        —
                      </span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expandable Weekly Modules */}
              <div className="mt-8 border-t border-[#27272A] pt-6">
                <h4 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase">
                  Syllabus Breakdown
                </h4>
                <div className="mt-4 divide-y divide-[#27272A] border-y border-[#27272A]">
                  {activeTrack.modules.map((mod, idx) => {
                    const isOpen = openModuleIdx === idx;
                    return (
                      <div key={mod.week}>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenModuleIdx(isOpen ? null : idx)
                          }
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between gap-4 py-4 text-left cursor-pointer"
                        >
                          <div>
                            <span className="font-mono text-xs text-[#E879F9] tabular-nums">
                              {mod.week}
                            </span>
                            <div className="mt-0.5 font-display text-base font-medium text-white">
                              {mod.title}
                            </div>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-[#A1A1AA] transition-transform duration-150 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                        {isOpen && (
                          <p className="pb-4 text-sm leading-relaxed text-[#A1A1AA]">
                            {mod.topics}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={scrollToApply}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#C026D3] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A21CAF] cursor-pointer"
                >
                  <span>Reserve Seat in {activeTrack.title.split('&')[0].trim()}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cohort Format & Tuition Matrix + Alumni Outcome */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-medium text-[#A21CAF]">
              Upcoming Cohort Logistics
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111113] [text-wrap:balance]">
              Choose your learning cadence.
            </h2>

            {/* Segmented Format Switcher */}
            <div className="mt-6 inline-flex rounded-xl border border-[#E5E3DD] bg-[#F1EFEA] p-1">
              <button
                type="button"
                onClick={() => setCohortFormat('studio')}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  cohortFormat === 'studio'
                    ? 'bg-white text-[#111113] shadow-sm'
                    : 'text-[#52525B] hover:text-[#111113]'
                }`}
              >
                Full-Time Studio
              </button>
              <button
                type="button"
                onClick={() => setCohortFormat('executive')}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  cohortFormat === 'executive'
                    ? 'bg-white text-[#111113] shadow-sm'
                    : 'text-[#52525B] hover:text-[#111113]'
                }`}
              >
                Executive Weekend
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-[#E5E3DD] bg-white p-6 lg:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#E5E3DD] pb-5">
                <div>
                  <h3 className="font-display text-xl font-semibold text-[#111113]">
                    {activeSchedule.label}
                  </h3>
                  <p className="mt-1 text-xs text-[#52525B]">
                    {activeSchedule.cadence}
                  </p>
                </div>
                <div className="font-display text-3xl font-semibold text-[#111113] tabular-nums">
                  {activeSchedule.tuition}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-[#71717A]">
                    Cohort Start Date
                  </span>
                  <span className="mt-1 block font-medium text-[#111113] tabular-nums">
                    {activeSchedule.nextStart}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-[#71717A]">
                    Availability
                  </span>
                  <span className="mt-1 block font-medium text-[#A21CAF] tabular-nums">
                    {activeSchedule.seatsRemaining}
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-[#F1EFEA] pt-4 text-sm text-[#52525B]">
                <p>{activeSchedule.notes}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E3DD] bg-[#F8F7F4] p-4">
                  <div className="text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-[#111113]">
                      <Video className="h-3.5 w-3.5 text-[#A21CAF]" aria-hidden="true" />
                      <span>Cohort 06 Kickoff Orientation</span>
                    </span>
                    <span className="mt-1 block text-[#52525B] tabular-nums">
                      {activeSchedule.kickoffLabel} · Google Meet &amp; Calendar
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToApply}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#C026D3] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#A21CAF] cursor-pointer"
                  >
                    <span>Join via Calendar &amp; Meet</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Alumni Proof Adjacent to Tuition */}
            <blockquote className="mt-6 rounded-2xl border border-[#E5E3DD] bg-[#F1EFEA] p-6">
              <p className="text-sm leading-relaxed text-[#27272A]">
                “{TESTIMONIALS[2].quote}”
              </p>
              <footer className="mt-4 text-xs">
                <span className="font-semibold text-[#111113]">
                  {TESTIMONIALS[2].name}
                </span>
                <span className="mx-2 text-[#71717A]" aria-hidden="true">
                  ·
                </span>
                <span className="text-[#52525B]">
                  {TESTIMONIALS[2].role}, {TESTIMONIALS[2].organization}
                </span>
              </footer>
            </blockquote>
          </div>

          {/* 4. Cohort 06 Join via Google Calendar & Google Meet */}
          <div
            id="academy-apply"
            className="rounded-2xl border border-[#E5E3DD] bg-white p-6 lg:col-span-6 lg:p-8"
          >
            <div className="flex items-center gap-4 border-b border-[#E5E3DD] pb-5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#E5E3DD]">
                <MediaFrame
                  src={STUDIO_MEDIA.founderPortrait}
                  alt="Salami Abiodun — Academy Lead"
                  aspectClass="aspect-square"
                  objectPosition="top"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-[#A21CAF]">
                  Cohort 06 · Google Calendar &amp; Meet Enrollment
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#111113]">
                  Join Next Cohort
                </h3>
              </div>
            </div>

            {enrollmentResult ? (
              <div className="py-8">
                <div className="flex items-center gap-3 text-[#15803D]">
                  <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <h4 className="font-display text-xl font-semibold text-[#111113]">
                    Cohort 06 Kickoff Scheduled on Calendar &amp; Meet
                  </h4>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#52525B]">
                  Welcome to Cohort 06,{' '}
                  <span className="font-semibold text-[#111113]">
                    {applicantName}
                  </span>
                  . Your orientation &amp; onboarding session for{' '}
                  <span className="font-medium text-[#111113]">
                    {applicantTrack}
                  </span>{' '}
                  ({activeSchedule.label} ·{' '}
                  <span className="tabular-nums">{activeSchedule.tuition}</span>)
                  has been added to Google Calendar for{' '}
                  <span className="font-semibold text-[#111113] tabular-nums">
                    {activeSchedule.kickoffLabel}
                  </span>{' '}
                  with invites sent to{' '}
                  <span className="font-mono text-xs text-[#111113]">
                    {applicantEmail}
                  </span>
                  .
                </p>

                <div className="mt-5 space-y-3 rounded-xl border border-[#E5E3DD] bg-[#F8F7F4] p-4">
                  {enrollmentResult.meetLink && (
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#A21CAF]">
                          <Video className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>Cohort 06 Google Meet Room</span>
                        </div>
                        <p className="mt-0.5 truncate font-mono text-xs text-[#111113]">
                          {enrollmentResult.meetLink}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleCopyMeet}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4D2CA] bg-white px-3 py-1.5 text-xs font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
                        >
                          {copiedMeet ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#15803D]" aria-hidden="true" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <a
                          href={enrollmentResult.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#C026D3] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#A21CAF]"
                        >
                          <span>Join Cohort Meet</span>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  )}

                  {enrollmentResult.calendarLink && (
                    <div className="flex items-center justify-between border-t border-[#E5E3DD] pt-3 text-xs">
                      <span className="text-[#52525B]">Google Calendar Event</span>
                      <a
                        href={enrollmentResult.calendarLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-[#A21CAF] hover:underline"
                      >
                        <span>Open Cohort Event in Calendar</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEnrollmentResult(null);
                    setApplicantPortfolio('');
                    setApplicantGoal('');
                  }}
                  className="mt-6 rounded-lg border border-[#D4D2CA] px-4 py-2 text-xs font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
                >
                  Enroll Another Fellow
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {/* Google Calendar & Meet Connection Bar */}
                <div className="rounded-xl border border-[#E5E3DD] bg-[#F8F7F4] p-4">
                  {token && user ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D]">
                          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>Google Calendar &amp; Meet Connected</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-[#52525B]">
                          Joining as{' '}
                          <span className="font-medium text-[#111113]">
                            {user.email}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="rounded-lg border border-[#D4D2CA] bg-white px-3 py-1.5 text-xs font-medium text-[#52525B] hover:border-[#111113] hover:text-[#111113] cursor-pointer"
                      >
                        Switch Account
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <div className="text-xs font-semibold text-[#111113]">
                          Connect Google Calendar &amp; Meet
                        </div>
                        <p className="mt-0.5 text-xs text-[#52525B]">
                          Sign in to reserve your Cohort 06 seat on Calendar and
                          create your Google Meet link.
                        </p>
                      </div>
                      <div className="shrink-0">
                        <GoogleSignInButton
                          onClick={handleGoogleConnect}
                          disabled={isSigningIn}
                          label={isSigningIn ? 'Connecting...' : 'Sign in with Google'}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {awaitingConfirmation ? (
                  <div
                    role="alertdialog"
                    aria-labelledby="confirm-cohort-heading"
                    className="space-y-4 rounded-xl border border-[#C026D3]/40 bg-[#F8F7F4] p-6"
                  >
                    <div className="flex items-center gap-2 text-[#A21CAF]">
                      <Calendar className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <h4
                        id="confirm-cohort-heading"
                        className="font-display text-lg font-semibold text-[#111113]"
                      >
                        Confirm Cohort 06 Google Calendar &amp; Meet Enrollment
                      </h4>
                    </div>

                    <p className="text-sm leading-relaxed text-[#52525B]">
                      Please confirm you want Pulzitive Academy to schedule the
                      Cohort 06 kickoff event on your Google Calendar and generate
                      a Google Meet classroom link:
                    </p>

                    <div className="space-y-1.5 rounded-lg border border-[#E5E3DD] bg-white p-4 text-xs text-[#52525B]">
                      <div>
                        <span className="font-semibold text-[#111113]">Track:</span>{' '}
                        {applicantTrack}
                      </div>
                      <div>
                        <span className="font-semibold text-[#111113]">Format:</span>{' '}
                        {activeSchedule.label} ({activeSchedule.tuition})
                      </div>
                      <div>
                        <span className="font-semibold text-[#111113]">
                          Kickoff Session:
                        </span>{' '}
                        <span className="tabular-nums">
                          {activeSchedule.kickoffLabel}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#111113]">
                          Invitees:
                        </span>{' '}
                        {applicantEmail}, salamabiodun01@gmail.com
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        disabled={isEnrolling}
                        onClick={handleConfirmEnrollment}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#C026D3] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#A21CAF] disabled:opacity-60 cursor-pointer"
                      >
                        {isEnrolling && (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        )}
                        <span>
                          {isEnrolling
                            ? 'Scheduling Cohort 06 on Calendar & Meet...'
                            : 'Confirm & Join Cohort on Meet'}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={isEnrolling}
                        onClick={() => setAwaitingConfirmation(false)}
                        className="rounded-lg border border-[#D4D2CA] bg-white px-4 py-2.5 text-sm font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleApplySubmit}
                    noValidate
                    className="space-y-4"
                  >
                    {formError && (
                      <div
                        role="alert"
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="academy-name"
                          className="block text-xs font-medium text-[#52525B]"
                        >
                          Full Name
                        </label>
                        <input
                          id="academy-name"
                          type="text"
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          placeholder="Damilola Martins"
                          className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="academy-email"
                          className="block text-xs font-medium text-[#52525B]"
                        >
                          Google Email (For Calendar Invite)
                        </label>
                        <input
                          id="academy-email"
                          type="email"
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          placeholder="damilola@studio.com"
                          className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="academy-track"
                          className="block text-xs font-medium text-[#52525B]"
                        >
                          Fellowship Track
                        </label>
                        <select
                          id="academy-track"
                          value={applicantTrack}
                          onChange={(e) => setApplicantTrack(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                        >
                          {ACADEMY_TRACKS.map((t) => (
                            <option key={t.id} value={t.title}>
                              {t.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="academy-format"
                          className="block text-xs font-medium text-[#52525B]"
                        >
                          Cohort Format &amp; Tuition
                        </label>
                        <select
                          id="academy-format"
                          value={cohortFormat}
                          onChange={(e) =>
                            setCohortFormat(e.target.value as CohortFormat)
                          }
                          className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] tabular-nums focus:border-[#C026D3] focus:bg-white focus:outline-none"
                        >
                          <option value="studio">
                            Full-Time Studio (₦95,000 · Jan 19)
                          </option>
                          <option value="executive">
                            Executive Weekend (₦65,000 · Feb 6)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="academy-portfolio"
                        className="block text-xs font-medium text-[#52525B]"
                      >
                        Portfolio, Behance, or Drive Link (Optional)
                      </label>
                      <input
                        id="academy-portfolio"
                        type="url"
                        value={applicantPortfolio}
                        onChange={(e) => setApplicantPortfolio(e.target.value)}
                        placeholder="https://behance.net/your-work"
                        className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="academy-goal"
                        className="block text-xs font-medium text-[#52525B]"
                      >
                        Current Experience &amp; Creative Goals
                      </label>
                      <textarea
                        id="academy-goal"
                        rows={3}
                        value={applicantGoal}
                        onChange={(e) => setApplicantGoal(e.target.value)}
                        placeholder="Tell us what you currently design or produce, and what you aim to achieve over the next 12 weeks..."
                        className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#C026D3] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#A21CAF] cursor-pointer"
                    >
                      <Video className="h-4 w-4" aria-hidden="true" />
                      <span>Join Cohort 06 on Google Calendar &amp; Meet</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
