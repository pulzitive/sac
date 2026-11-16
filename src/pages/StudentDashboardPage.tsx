import { FormEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  GraduationCap,
  Lock,
  Plus,
  Send,
  Video,
} from 'lucide-react';
import { usePortalAuth } from '@/src/context/PortalAuthContext';
import { ACADEMY_TRACKS } from '@/src/data/pulzitiveData';
import {
  createStudentEnrollment,
  StudentEnrollment,
  subscribeMyEnrollments,
  updateStudentProgress,
} from '@/src/lib/pulzitiveDb';
import { downloadCohortCertificatePng } from '@/src/lib/certificateGenerator';
import { ActivePage } from '@/src/components/Navbar';

interface StudentDashboardPageProps {
  onNavigate: (page: ActivePage) => void;
}

export function StudentDashboardPage({ onNavigate }: StudentDashboardPageProps) {
  const {
    authReady,
    user,
    profile,
    profileLoaded,
    isAdmin,
    openAuthModal,
    recordActivity,
  } = usePortalAuth();

  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveFeedback, setSaveFeedback] = useState('');

  // New cohort enrollment state
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [newTrackId, setNewTrackId] = useState(ACADEMY_TRACKS[0].id);
  const [newFormat, setNewFormat] = useState<'studio' | 'executive'>('studio');
  const [enrolling, setEnrolling] = useState(false);

  // Capstone editing state synced with active enrollment
  const [capstoneUrl, setCapstoneUrl] = useState('');
  const [capstoneNotes, setCapstoneNotes] = useState('');
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    if (!authReady || !user) {
      setEnrollments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeMyEnrollments(
      user.uid,
      (items) => {
        setEnrollments(items);
        setLoading(false);
        if (items.length > 0 && !items.some((i) => i.id === selectedId)) {
          setSelectedId(items[0].id);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [authReady, user, selectedId]);

  const activeEnrollment =
    enrollments.find((e) => e.id === selectedId) || enrollments[0] || null;

  useEffect(() => {
    if (activeEnrollment) {
      setCapstoneUrl(activeEnrollment.capstoneUrl || '');
      setCapstoneNotes(activeEnrollment.capstoneNotes || '');
    }
  }, [activeEnrollment]);

  if (!authReady || (user && !profileLoaded)) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
        <div className="rounded-2xl border border-[#E5E3DD] bg-white p-10 text-center text-sm text-[#52525B]">
          Connecting to Pulzitive Student Portal...
        </div>
      </div>
    );
  }

  if (!user || (!profile && !isAdmin)) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#E5E3DD] bg-white p-8 lg:p-12">
          <GraduationCap className="h-8 w-8 text-[#A21CAF]" aria-hidden="true" />
          <p className="mt-4 text-xs font-medium text-[#A21CAF]">
            Pulzitive Academy · Student Fellowship Portal
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111113]">
            Sign in or Sign up to access your Student Dashboard.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#52525B]">
            Track weekly syllabus modules, submit live agency capstones, join
            Google Meet classroom sessions, and download your verified Cohort
            Completion Certificate upon graduation.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => openAuthModal('student', 'student')}
              className="rounded-lg bg-[#C026D3] px-6 py-3 text-sm font-medium text-white hover:bg-[#A21CAF] cursor-pointer"
            >
              Sign In / Sign Up as Student
            </button>
            <button
              type="button"
              onClick={() => onNavigate('academy')}
              className="rounded-lg border border-[#D4D2CA] px-5 py-3 text-sm font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
            >
              View Academy Curriculum
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeTrack = activeEnrollment
    ? ACADEMY_TRACKS.find((t) => t.id === activeEnrollment.trackId) ||
      ACADEMY_TRACKS[0]
    : ACADEMY_TRACKS[0];

  const totalModules = activeTrack.modules.length;
  const completedModules = activeEnrollment?.completedModules || [];
  const progressPercent =
    totalModules > 0
      ? Math.round((completedModules.length / totalModules) * 100)
      : 0;

  const handleEnrollSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setEnrolling(true);
    try {
      const track =
        ACADEMY_TRACKS.find((t) => t.id === newTrackId) || ACADEMY_TRACKS[0];
      const cohortLabel =
        newFormat === 'studio'
          ? 'Full-Time Studio Immersion (₦95,000)'
          : 'Executive Weekend Cohort (₦65,000)';
      const startDate =
        newFormat === 'studio' ? 'January 19, 2027' : 'February 6, 2027';

      const newId = await createStudentEnrollment({
        studentUid: user.uid,
        studentName: profile?.displayName || user.displayName || 'Pulzitive Fellow',
        studentEmail: user.email || '',
        trackId: track.id,
        trackTitle: track.title,
        cohortFormat: newFormat,
        cohortLabel,
        startDate,
      });

      await recordActivity(
        'cohort',
        `Enrolled in ${track.title}`,
        `${cohortLabel} · Starts ${startDate}`
      );
      setSelectedId(newId);
      setShowEnrollForm(false);
      setSaveFeedback('Enrolled in Cohort 06 track successfully.');
      setTimeout(() => setSaveFeedback(''), 3500);
    } catch (err: any) {
      setError(err?.message || 'Unable to create enrollment.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleModule = async (weekKey: string) => {
    if (!activeEnrollment || activeEnrollment.status === 'graduated') return;
    setError('');
    const nextModules = completedModules.includes(weekKey)
      ? completedModules.filter((m) => m !== weekKey)
      : [...completedModules, weekKey];

    setSavingProgress(true);
    try {
      await updateStudentProgress(activeEnrollment.id, {
        completedModules: nextModules,
        capstoneUrl: activeEnrollment.capstoneUrl || '',
        capstoneNotes: activeEnrollment.capstoneNotes || '',
        status: activeEnrollment.status === 'submitted_capstone' ? 'submitted_capstone' : 'active',
      });
      await recordActivity(
        'cohort',
        `Updated Syllabus Progress (${nextModules.length}/${totalModules})`,
        `${activeEnrollment.trackTitle} · ${weekKey}`
      );
    } catch (err: any) {
      setError(err?.message || 'Could not update module progress.');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSaveCapstone = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeEnrollment || activeEnrollment.status === 'graduated') return;
    if (!capstoneUrl.trim()) {
      setError('Please provide your Capstone Figma, Behance, or Drive URL.');
      return;
    }
    setError('');
    setSavingProgress(true);
    try {
      await updateStudentProgress(activeEnrollment.id, {
        completedModules,
        capstoneUrl: capstoneUrl.trim(),
        capstoneNotes: capstoneNotes.trim(),
        status: 'submitted_capstone',
      });
      await recordActivity(
        'cohort',
        'Submitted Cohort Capstone Project',
        `${activeEnrollment.trackTitle} · ${capstoneUrl.trim()}`
      );
      setSaveFeedback(
        'Capstone submitted for Creative Director review. Certificate seal unlocks after approval.'
      );
      setTimeout(() => setSaveFeedback(''), 4000);
    } catch (err: any) {
      setError(err?.message || 'Could not submit capstone.');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleDownloadCertificate = async (provisional: boolean) => {
    if (!activeEnrollment) return;
    const certId =
      activeEnrollment.certificateId ||
      `PLZ-C06-${activeEnrollment.id.slice(0, 6).toUpperCase()}`;

    downloadCohortCertificatePng({
      studentName:
        profile?.displayName ||
        activeEnrollment.studentName ||
        user.displayName ||
        'Pulzitive Fellow',
      trackTitle: activeEnrollment.trackTitle,
      cohortLabel: activeEnrollment.cohortLabel,
      certificateId: certId,
      provisional,
    });

    await recordActivity(
      'certificate',
      provisional
        ? 'Downloaded Provisional Progress Record'
        : 'Downloaded Official Cohort Certificate',
      `${activeEnrollment.trackTitle} (${certId})`
    );
  };

  const canDownloadProvisional =
    progressPercent === 100 && Boolean(activeEnrollment?.capstoneUrl);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 lg:px-10 lg:py-14">
      {/* Top Fellow Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#E5E3DD] pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium text-[#A21CAF]">
            Pulzitive Academy · Student Fellowship Dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111113] lg:text-4xl">
            Welcome back, {profile?.displayName || user.displayName || 'Fellow'}
          </h1>
          <p className="mt-2 text-sm text-[#52525B]">
            <span className="font-mono text-xs text-[#111113]">
              {user.email}
            </span>
            {profile?.organization && (
              <>
                <span className="mx-2 text-[#A1A1AA]">·</span>
                <span>{profile.organization}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowEnrollForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C026D3] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#A21CAF] cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>
              {showEnrollForm ? 'Close Track Selector' : 'Enroll in Cohort Track'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('academy')}
            className="rounded-lg border border-[#D4D2CA] bg-white px-4 py-2.5 text-xs font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
          >
            Academy Syllabus &amp; Meet
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {saveFeedback && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* New Track Enrollment Drawer */}
      {showEnrollForm && (
        <form
          onSubmit={handleEnrollSubmit}
          className="mt-8 rounded-2xl border border-[#C026D3]/40 bg-white p-6 lg:p-8"
        >
          <h2 className="font-display text-xl font-semibold text-[#111113]">
            Enroll in Cohort 06 Track
          </h2>
          <p className="mt-1 text-xs text-[#52525B]">
            Your enrollment syncs immediately to Firestore and unlocks syllabus
            tracking and certificate eligibility.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="enroll-track-select"
                className="block text-xs font-medium text-[#52525B]"
              >
                Fellowship Track
              </label>
              <select
                id="enroll-track-select"
                value={newTrackId}
                onChange={(e) => setNewTrackId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:outline-none"
              >
                {ACADEMY_TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.duration})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="enroll-format-select"
                className="block text-xs font-medium text-[#52525B]"
              >
                Learning Format &amp; Tuition
              </label>
              <select
                id="enroll-format-select"
                value={newFormat}
                onChange={(e) =>
                  setNewFormat(e.target.value as 'studio' | 'executive')
                }
                className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] tabular-nums focus:border-[#C026D3] focus:outline-none"
              >
                <option value="studio">
                  Full-Time Studio Immersion — ₦95,000 (Starts Jan 19, 2027)
                </option>
                <option value="executive">
                  Executive Weekend Cohort — ₦65,000 (Starts Feb 6, 2027)
                </option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={enrolling}
              className="rounded-lg bg-[#C026D3] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#A21CAF] disabled:opacity-60 cursor-pointer"
            >
              {enrolling ? 'Enrolling...' : 'Confirm Track Enrollment'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-10 rounded-2xl border border-[#E5E3DD] bg-white p-10 text-center text-sm text-[#52525B]">
          Loading your Academy enrollments...
        </div>
      ) : !activeEnrollment ? (
        <div className="mt-10 rounded-2xl border border-[#E5E3DD] bg-white p-8 lg:p-12">
          <BookOpen className="h-7 w-7 text-[#A21CAF]" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-[#111113]">
            No active Cohort 06 enrollment yet
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#52525B]">
            Select one of our four specialized Pulzitive Academy tracks to start
            tracking weekly modules, submitting your capstone project, and
            earning your graduate certificate.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowEnrollForm(true)}
              className="rounded-lg bg-[#C026D3] px-5 py-3 text-sm font-medium text-white hover:bg-[#A21CAF] cursor-pointer"
            >
              Enroll in Cohort 06 Now
            </button>
            <button
              type="button"
              onClick={() => onNavigate('academy')}
              className="rounded-lg border border-[#D4D2CA] px-5 py-3 text-sm font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
            >
              Schedule Cohort Orientation on Meet
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Enrolled Track Switcher (if multiple) */}
          {enrollments.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {enrollments.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`rounded-lg border px-4 py-2 text-xs font-medium cursor-pointer ${
                    item.id === activeEnrollment.id
                      ? 'border-[#C026D3] bg-[#C026D3] text-white'
                      : 'border-[#E5E3DD] bg-white text-[#111113]'
                  }`}
                >
                  {item.trackTitle}
                </button>
              ))}
            </div>
          )}

          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-[#E5E3DD] bg-white p-5">
              <span className="text-xs text-[#71717A]">Module Progress</span>
              <div className="mt-1.5 font-display text-3xl font-semibold text-[#111113] tabular-nums">
                {progressPercent}%
              </div>
              <span className="mt-1 block text-xs text-[#52525B] tabular-nums">
                {completedModules.length} of {totalModules} modules checked
              </span>
            </div>

            <div className="rounded-xl border border-[#E5E3DD] bg-white p-5">
              <span className="text-xs text-[#71717A]">Cohort Status</span>
              <div className="mt-1.5 font-display text-2xl font-semibold text-[#111113]">
                {activeEnrollment.status === 'graduated'
                  ? 'Graduated'
                  : activeEnrollment.status === 'submitted_capstone'
                  ? 'In Review'
                  : 'Active Fellow'}
              </div>
              <span className="mt-1 block text-xs text-[#52525B]">
                Starts {activeEnrollment.startDate}
              </span>
            </div>

            <div className="rounded-xl border border-[#E5E3DD] bg-white p-5">
              <span className="text-xs text-[#71717A]">Format &amp; Rate</span>
              <div className="mt-1.5 font-display text-lg font-semibold text-[#111113]">
                {activeEnrollment.cohortFormat === 'studio'
                  ? 'Full-Time Studio'
                  : 'Executive Weekend'}
              </div>
              <span className="mt-1 block text-xs text-[#A21CAF] tabular-nums">
                {activeEnrollment.cohortFormat === 'studio' ? '₦95,000' : '₦65,000'}
              </span>
            </div>

            <div className="rounded-xl border border-[#E5E3DD] bg-white p-5">
              <span className="text-xs text-[#71717A]">Certificate</span>
              <div className="mt-1.5 font-display text-2xl font-semibold text-[#111113]">
                {activeEnrollment.certificateIssued ? 'Issued' : 'Pending'}
              </div>
              <span className="mt-1 block font-mono text-xs text-[#52525B]">
                {activeEnrollment.certificateId || 'Awaiting approval'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left 7 Cols: Syllabus Checklist & Capstone Submission */}
            <div className="space-y-8 lg:col-span-7">
              <div className="rounded-2xl border border-[#E5E3DD] bg-white p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E3DD] pb-5">
                  <div>
                    <p className="text-xs font-medium text-[#A21CAF]">
                      Interactive Curriculum Tracker
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-[#111113]">
                      {activeEnrollment.trackTitle}
                    </h2>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#111113] tabular-nums">
                    {progressPercent}% Complete
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#F1EFEA]">
                  <div
                    className="h-full bg-[#C026D3] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-6 space-y-3">
                  {activeTrack.modules.map((mod) => {
                    const checked = completedModules.includes(mod.week);
                    const locked = activeEnrollment.status === 'graduated';
                    return (
                      <button
                        key={mod.week}
                        type="button"
                        disabled={savingProgress || locked}
                        onClick={() => handleToggleModule(mod.week)}
                        className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors ${
                          checked
                            ? 'border-[#C026D3]/40 bg-[#F8F7F4]'
                            : 'border-[#E5E3DD] bg-white hover:border-[#111113]/40'
                        } ${locked ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            checked
                              ? 'border-[#C026D3] bg-[#C026D3] text-white'
                              : 'border-[#D4D2CA] bg-white'
                          }`}
                        >
                          {checked && (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-[#A21CAF] tabular-nums">
                              {mod.week}
                            </span>
                            <span className="text-[11px] text-[#71717A]">
                              {checked ? 'Completed' : 'Mark Complete'}
                            </span>
                          </div>
                          <div className="mt-0.5 font-display text-base font-semibold text-[#111113]">
                            {mod.title}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[#52525B]">
                            {mod.topics}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capstone Submission */}
              <form
                onSubmit={handleSaveCapstone}
                className="rounded-2xl border border-[#E5E3DD] bg-white p-6 lg:p-8"
              >
                <p className="text-xs font-medium text-[#A21CAF]">
                  Graduation Requirement
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-[#111113]">
                  Submit Capstone Deliverable
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#52525B]">
                  Share your final Figma prototype, Behance case study, or
                  Google Drive production folder for executive review by Salami
                  Abiodun.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="capstone-url"
                      className="block text-xs font-medium text-[#52525B]"
                    >
                      Capstone Deliverable URL (Figma, Behance, or Drive)
                    </label>
                    <input
                      id="capstone-url"
                      type="url"
                      disabled={activeEnrollment.status === 'graduated'}
                      value={capstoneUrl}
                      onChange={(e) => setCapstoneUrl(e.target.value)}
                      placeholder="https://figma.com/file/..."
                      className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="capstone-notes"
                      className="block text-xs font-medium text-[#52525B]"
                    >
                      Design Decisions &amp; Case Context
                    </label>
                    <textarea
                      id="capstone-notes"
                      rows={3}
                      disabled={activeEnrollment.status === 'graduated'}
                      value={capstoneNotes}
                      onChange={(e) => setCapstoneNotes(e.target.value)}
                      placeholder="Summarize your creative brief, typography choices, and commercial impact..."
                      className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none disabled:opacity-60"
                    />
                  </div>

                  {activeEnrollment.status !== 'graduated' && (
                    <button
                      type="submit"
                      disabled={savingProgress}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#C026D3] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#A21CAF] disabled:opacity-60 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {activeEnrollment.status === 'submitted_capstone'
                          ? 'Update Capstone Submission'
                          : 'Submit Capstone for Certificate Review'}
                      </span>
                    </button>
                  )}
                </div>

                {activeEnrollment.mentorNotes && (
                  <div className="mt-6 rounded-xl border border-[#E5E3DD] bg-[#F8F7F4] p-4">
                    <div className="text-xs font-semibold text-[#111113]">
                      Creative Director Feedback (Salami Abiodun)
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-[#52525B]">
                      {activeEnrollment.mentorNotes}
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Right 5 Cols: Certificate Center & Classroom Links */}
            <div className="space-y-6 lg:col-span-5">
              {/* Cohort Certificate Download Card */}
              <div className="rounded-2xl border border-[#27272A] bg-[#0B0B0D] p-6 text-[#F8F7F4] lg:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#E879F9]">
                    Cohort Graduation Credential
                  </span>
                  <Award className="h-5 w-5 text-[#E879F9]" aria-hidden="true" />
                </div>

                <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                  {activeEnrollment.certificateIssued
                    ? 'Verified Certificate Ready'
                    : 'Cohort Completion Certificate'}
                </h2>

                <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                  {activeEnrollment.certificateIssued
                    ? 'Your cohort graduation has been approved by Pulzitive Academy. Download your high-resolution credential signed by Creative Director Salami Abiodun.'
                    : 'Complete all weekly modules and submit your capstone project. Once verified by Admin, your sealed Cohort Certificate becomes downloadable here.'}
                </p>

                {/* Certificate Mini Visual Preview */}
                <div className="mt-6 rounded-xl border border-[#27272A] bg-[#F8F7F4] p-5 text-[#111113]">
                  <div className="flex items-center justify-between border-b border-[#E5E3DD] pb-3 text-[10px] font-semibold tracking-wider text-[#A21CAF] uppercase">
                    <span>Pulzitive Academy</span>
                    <span className="font-mono text-[#52525B]">
                      {activeEnrollment.certificateId || 'PLZ-C06-PENDING'}
                    </span>
                  </div>
                  <div className="mt-4 font-display text-lg font-bold text-[#111113]">
                    {profile?.displayName ||
                      activeEnrollment.studentName ||
                      'Fellow Name'}
                  </div>
                  <div className="mt-1 text-xs font-medium text-[#A21CAF]">
                    {activeEnrollment.trackTitle}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#E5E3DD] pt-3 text-[11px] text-[#52525B]">
                    <span>Salami Abiodun · Director</span>
                    <span>
                      {activeEnrollment.certificateIssued
                        ? 'Sealed'
                        : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* Eligibility Checklist */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#D4D4D8]">
                    <span>1. Syllabus Modules ({completedModules.length}/{totalModules})</span>
                    <span
                      className={
                        progressPercent === 100
                          ? 'text-emerald-400'
                          : 'text-[#A1A1AA]'
                      }
                    >
                      {progressPercent === 100 ? 'Done' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#D4D4D8]">
                    <span>2. Capstone Submitted</span>
                    <span
                      className={
                        activeEnrollment.capstoneUrl
                          ? 'text-emerald-400'
                          : 'text-[#A1A1AA]'
                      }
                    >
                      {activeEnrollment.capstoneUrl ? 'Done' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#D4D4D8]">
                    <span>3. Director Seal &amp; Graduation</span>
                    <span
                      className={
                        activeEnrollment.certificateIssued
                          ? 'text-emerald-400'
                          : 'text-[#A1A1AA]'
                      }
                    >
                      {activeEnrollment.certificateIssued ? 'Approved' : 'Awaiting'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {activeEnrollment.certificateIssued ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadCertificate(false)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#C026D3] px-5 py-3 text-sm font-medium text-white hover:bg-[#A21CAF] cursor-pointer"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span>Download Official Certificate (.PNG)</span>
                    </button>
                  ) : canDownloadProvisional ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadCertificate(true)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E879F9] bg-[#16161A] px-5 py-3 text-xs font-medium text-[#E879F9] hover:bg-[#C026D3] hover:text-white transition-colors cursor-pointer"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span>Download Provisional Progress Record (.PNG)</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 rounded-lg border border-[#27272A] bg-[#141417] px-4 py-3 text-xs text-[#A1A1AA]">
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Complete all modules &amp; capstone to unlock</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Google Meet Classroom & Case Archive */}
              <div className="rounded-2xl border border-[#E5E3DD] bg-white p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-[#A21CAF]">
                  <Video className="h-4 w-4" aria-hidden="true" />
                  <span>Live Classroom &amp; Case Study Reference</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-[#111113]">
                  {activeEnrollment.cohortLabel}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#52525B]">
                  Reference Brief: {activeTrack.caseReference}
                </p>

                <div className="mt-5 space-y-2.5">
                  {activeEnrollment.meetLink ? (
                    <a
                      href={activeEnrollment.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#111113] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#A21CAF] transition-colors"
                    >
                      <span>Open Cohort Google Meet Room</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigate('academy')}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#D4D2CA] px-4 py-2.5 text-xs font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
                    >
                      <span>Join Cohort 06 via Google Calendar &amp; Meet</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
