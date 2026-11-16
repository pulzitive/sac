import { FormEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Plus,
  Sparkles,
  Video,
} from 'lucide-react';
import { usePortalAuth } from '@/src/context/PortalAuthContext';
import {
  AuditFocusArea,
  createFreeAudit,
  createServiceBooking,
  FreeAuditRequest,
  ServiceBooking,
  ServiceType,
  subscribeMyAudits,
  subscribeMyBookings,
} from '@/src/lib/pulzitiveDb';
import { DiscoveryCallScheduler } from '@/src/components/DiscoveryCallScheduler';

type ClientTab = 'services' | 'audit' | 'calls';

const SERVICE_OPTIONS: ServiceType[] = [
  'Brand Identity & Systems',
  'Digital Marketing & Performance',
  'Media Production & 3D Motion',
  'Product UI/UX & Web Flagship',
  'Full-Stack Brand + Launch Retainer',
];

const AUDIT_FOCUS_OPTIONS: AuditFocusArea[] = [
  'Brand Positioning & Identity',
  'Website & Conversion UI/UX',
  'Social Media & Performance Ads',
  'Media Production & Visual Quality',
];

export function ClientDashboardPage() {
  const {
    authReady,
    user,
    profile,
    profileLoaded,
    isAdmin,
    openAuthModal,
    recordActivity,
  } = usePortalAuth();

  const [activeTab, setActiveTab] = useState<ClientTab>('services');
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [audits, setAudits] = useState<FreeAuditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Service Booking Form state
  const [organization, setOrganization] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>(SERVICE_OPTIONS[0]);
  const [budgetTier, setBudgetTier] = useState('₦750,000 – ₦1,750,000');
  const [timeline, setTimeline] = useState('4 – 6 Weeks');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [projectBrief, setProjectBrief] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Free Audit Form state
  const [auditBrand, setAuditBrand] = useState('');
  const [auditWebsite, setAuditWebsite] = useState('');
  const [auditSocial, setAuditSocial] = useState('');
  const [auditFocus, setAuditFocus] = useState<AuditFocusArea>(
    AUDIT_FOCUS_OPTIONS[0]
  );
  const [auditChallenge, setAuditChallenge] = useState('');
  const [submittingAudit, setSubmittingAudit] = useState(false);

  useEffect(() => {
    if (profile?.organization) {
      setOrganization((prev) => prev || profile.organization);
      setAuditBrand((prev) => prev || profile.organization);
    }
  }, [profile]);

  useEffect(() => {
    if (!authReady || !user) {
      setBookings([]);
      setAudits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubBookings = subscribeMyBookings(
      user.uid,
      (items) => {
        setBookings(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    const unsubAudits = subscribeMyAudits(
      user.uid,
      (items) => {
        setAudits(items);
      },
      (err) => {
        setError(err.message);
      }
    );
    return () => {
      unsubBookings();
      unsubAudits();
    };
  }, [authReady, user]);

  if (!authReady || (user && !profileLoaded)) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
        <div className="rounded-2xl border border-[#E5E3DD] bg-white p-10 text-center text-sm text-[#52525B]">
          Connecting to Pulzitive Client Portal...
        </div>
      </div>
    );
  }

  if (!user || (!profile && !isAdmin)) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#E5E3DD] bg-white p-8 lg:p-12">
          <Briefcase className="h-8 w-8 text-[#A21CAF]" aria-hidden="true" />
          <p className="mt-4 text-xs font-medium text-[#A21CAF]">
            Pulzitive Agency · Client Workspace
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111113]">
            Sign in or Sign up for your Client Dashboard &amp; Free Brand Audit.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#52525B]">
            Commission digital branding, performance marketing, media
            production, or UI/UX deliverables, track live studio milestones, and
            request a complimentary Brand &amp; Digital Audit reviewed by Salami
            Abiodun.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => openAuthModal('client', 'client')}
              className="rounded-lg bg-[#C026D3] px-6 py-3 text-sm font-medium text-white hover:bg-[#A21CAF] cursor-pointer"
            >
              Sign In / Sign Up as Client
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleBookService = async (e: FormEvent) => {
    e.preventDefault();
    if (!organization.trim()) {
      setError('Please enter your company or brand name.');
      return;
    }
    if (!projectBrief.trim()) {
      setError('Please describe your deliverables and campaign objectives.');
      return;
    }
    setError('');
    setSubmittingBooking(true);
    try {
      await createServiceBooking({
        clientUid: user.uid,
        clientName: profile?.displayName || user.displayName || 'Client',
        clientEmail: user.email || '',
        organization: organization.trim(),
        serviceType,
        budgetTier,
        timeline,
        projectBrief: projectBrief.trim(),
        referenceUrl: referenceUrl.trim(),
      });
      await recordActivity(
        'service_booking',
        `Booked ${serviceType}`,
        `${organization.trim()} · ${budgetTier} (${timeline})`
      );
      setProjectBrief('');
      setReferenceUrl('');
      setSuccessMsg(
        'Service booking recorded in Firestore! Our studio team will update your production milestone shortly.'
      );
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err: any) {
      setError(err?.message || 'Unable to submit service booking.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleRequestAudit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auditBrand.trim()) {
      setError('Please enter the brand name to audit.');
      return;
    }
    if (!auditChallenge.trim()) {
      setError('Please describe your current positioning or conversion challenge.');
      return;
    }
    setError('');
    setSubmittingAudit(true);
    try {
      await createFreeAudit({
        clientUid: user.uid,
        clientName: profile?.displayName || user.displayName || 'Client',
        clientEmail: user.email || '',
        brandName: auditBrand.trim(),
        websiteUrl: auditWebsite.trim(),
        socialHandle: auditSocial.trim(),
        focusArea: auditFocus,
        primaryChallenge: auditChallenge.trim(),
      });
      await recordActivity(
        'free_audit',
        `Requested Free Audit for ${auditBrand.trim()}`,
        `Focus: ${auditFocus}`
      );
      setAuditChallenge('');
      setSuccessMsg(
        'Free Brand Audit generated! View your preliminary diagnostic scorecard below while our Creative Director finalizes executive recommendations.'
      );
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setError(err?.message || 'Unable to create free audit request.');
    } finally {
      setSubmittingAudit(false);
    }
  };

  const handleDownloadAuditReport = (audit: FreeAuditRequest) => {
    const content = [
      'PULZITIVE AGENCY — BRAND & DIGITAL AUDIT REPORT',
      '=================================================',
      `Brand: ${audit.brandName}`,
      `Client: ${audit.clientName} (${audit.clientEmail})`,
      `Focus Area: ${audit.focusArea}`,
      `Website: ${audit.websiteUrl || 'Not provided'}`,
      `Social Handle: ${audit.socialHandle || 'Not provided'}`,
      `Status: ${audit.status.toUpperCase()}`,
      `Diagnostic Score: ${audit.diagnosticScore} / 100`,
      '',
      'FINDINGS & OPPORTUNITIES:',
      audit.auditFindings,
      '',
      'RECOMMENDED NEXT STEP:',
      audit.recommendedNextStep,
      '',
      'Reviewed by Pulzitive Agency · Lagos & London',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pulzitive-Audit-${audit.brandName.replace(/[^a-zA-Z0-9_-]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deliveredAudits = audits.filter((a) => a.status === 'delivered').length;
  const avgAuditScore =
    audits.length > 0
      ? Math.round(
          audits.reduce((sum, a) => sum + (a.diagnosticScore || 0), 0) /
            audits.length
        )
      : 0;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 lg:px-10 lg:py-14">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#E5E3DD] pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium text-[#A21CAF]">
            Pulzitive Agency · Client Services &amp; Free Brand Audit Portal
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111113] lg:text-4xl">
            {profile?.organization || profile?.displayName || user.displayName}
          </h1>
          <p className="mt-2 text-sm text-[#52525B]">
            <span className="font-mono text-xs text-[#111113]">
              {user.email}
            </span>
            <span className="mx-2 text-[#A1A1AA]">·</span>
            <span>Client Workspace</span>
          </p>
        </div>

        {/* Workspace Tab Switcher */}
        <div className="inline-flex flex-wrap rounded-xl border border-[#E5E3DD] bg-[#F1EFEA] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium cursor-pointer ${
              activeTab === 'services'
                ? 'bg-white text-[#111113] shadow-xs'
                : 'text-[#52525B] hover:text-[#111113]'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Book Services ({bookings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-[#111113] shadow-xs'
                : 'text-[#52525B] hover:text-[#111113]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#A21CAF]" aria-hidden="true" />
            <span>Free Brand Audit ({audits.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calls')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium cursor-pointer ${
              activeTab === 'calls'
                ? 'bg-white text-[#111113] shadow-xs'
                : 'text-[#52525B] hover:text-[#111113]'
            }`}
          >
            <Video className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Google Meet Calls</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E3DD] bg-white p-5">
          <span className="text-xs text-[#71717A]">Active Service Bookings</span>
          <div className="mt-1.5 font-display text-3xl font-semibold text-[#111113] tabular-nums">
            {bookings.length}
          </div>
          <span className="mt-1 block text-xs text-[#52525B]">
            Saved in Cloud Firestore
          </span>
        </div>
        <div className="rounded-xl border border-[#E5E3DD] bg-white p-5">
          <span className="text-xs text-[#71717A]">Free Audits Claimed</span>
          <div className="mt-1.5 font-display text-3xl font-semibold text-[#A21CAF] tabular-nums">
            {audits.length}
          </div>
          <span className="mt-1 block text-xs text-[#52525B]">
            ₦0 Complimentary Diagnostic
          </span>
        </div>
        <div className="rounded-xl border border-[#E5E3DD] bg-white p-5">
          <span className="text-xs text-[#71717A]">Director Reviews Ready</span>
          <div className="mt-1.5 font-display text-3xl font-semibold text-[#111113] tabular-nums">
            {deliveredAudits}
          </div>
          <span className="mt-1 block text-xs text-[#52525B]">
            Executive brand reports
          </span>
        </div>
        <div className="rounded-xl border border-[#E5E3DD] bg-white p-5">
          <span className="text-xs text-[#71717A]">Avg. Diagnostic Score</span>
          <div className="mt-1.5 font-display text-3xl font-semibold text-[#111113] tabular-nums">
            {audits.length > 0 ? `${avgAuditScore}/100` : '—'}
          </div>
          <span className="mt-1 block text-xs text-[#52525B]">
            Brand &amp; conversion readiness
          </span>
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

      {successMsg && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: BOOK SERVICES & PIPELINE */}
      {activeTab === 'services' && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <form
            onSubmit={handleBookService}
            className="rounded-2xl border border-[#E5E3DD] bg-white p-6 lg:col-span-5 lg:p-8"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-[#A21CAF]">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Commission Studio Work</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#111113]">
              Book Pulzitive Services
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="booking-org"
                  className="block text-xs font-medium text-[#52525B]"
                >
                  Brand / Organization Name
                </label>
                <input
                  id="booking-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Vavadi Horology"
                  className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="booking-service"
                  className="block text-xs font-medium text-[#52525B]"
                >
                  Service Discipline
                </label>
                <select
                  id="booking-service"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as ServiceType)}
                  className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="booking-budget"
                    className="block text-xs font-medium text-[#52525B]"
                  >
                    Budget Tier (NGN)
                  </label>
                  <select
                    id="booking-budget"
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] tabular-nums focus:border-[#C026D3] focus:bg-white focus:outline-none"
                  >
                    <option>₦250,000 – ₦750,000</option>
                    <option>₦750,000 – ₦1,750,000</option>
                    <option>₦1,750,000 – ₦4,000,000</option>
                    <option>₦4,000,000+ Retainer</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="booking-timeline"
                    className="block text-xs font-medium text-[#52525B]"
                  >
                    Target Timeline
                  </label>
                  <select
                    id="booking-timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                  >
                    <option>2 – 3 Weeks Sprint</option>
                    <option>4 – 6 Weeks</option>
                    <option>8 – 12 Weeks Flagship</option>
                    <option>Ongoing Monthly Retainer</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-ref"
                  className="block text-xs font-medium text-[#52525B]"
                >
                  Brief, Deck, or Moodboard Link (Optional)
                </label>
                <input
                  id="booking-ref"
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="booking-brief"
                  className="block text-xs font-medium text-[#52525B]"
                >
                  Project Scope &amp; Deliverables
                </label>
                <textarea
                  id="booking-brief"
                  rows={4}
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  placeholder="Outline your brand launch, campaign deliverables, media shoot requirements, or product redesign goals..."
                  className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingBooking}
                className="w-full rounded-lg bg-[#C026D3] px-5 py-3 text-sm font-medium text-white hover:bg-[#A21CAF] disabled:opacity-60 cursor-pointer"
              >
                {submittingBooking
                  ? 'Saving Service Booking...'
                  : 'Submit Service Booking'}
              </button>
            </div>
          </form>

          <div className="space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-[#111113]">
                Your Service Bookings &amp; Production Status
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className="text-xs font-medium text-[#A21CAF] hover:underline cursor-pointer"
              >
                Need an audit first? Claim Free Brand Audit →
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-[#E5E3DD] bg-white p-8 text-sm text-[#52525B]">
                Loading bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E3DD] bg-white p-8 text-sm text-[#52525B]">
                No service bookings submitted yet. Complete the booking form to
                kick off a brand, marketing, media production, or UI/UX project.
              </div>
            ) : (
              bookings.map((b) => (
                <article
                  key={b.id}
                  className="rounded-2xl border border-[#E5E3DD] bg-white p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F1EFEA] pb-4">
                    <div>
                      <div className="text-xs font-medium text-[#A21CAF]">
                        {b.serviceType}
                      </div>
                      <h3 className="mt-1 font-display text-lg font-semibold text-[#111113]">
                        {b.organization}
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-semibold uppercase tracking-wide text-[#111113]">
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-[#52525B]">
                    <div>
                      <span className="block text-[#71717A]">Investment</span>
                      <span className="font-medium text-[#111113] tabular-nums">
                        {b.budgetTier}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#71717A]">Timeline</span>
                      <span className="font-medium text-[#111113]">
                        {b.timeline}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#52525B]">
                    {b.projectBrief}
                  </p>

                  <div className="mt-4 rounded-xl border border-[#E5E3DD] bg-[#F8F7F4] p-4 text-xs">
                    <div className="font-semibold text-[#111113]">
                      Current Studio Milestone: {b.agencyMilestone}
                    </div>
                    {b.agencyNotes && (
                      <p className="mt-1.5 text-[#52525B]">{b.agencyNotes}</p>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FREE BRAND & DIGITAL AUDIT */}
      {activeTab === 'audit' && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <form
            onSubmit={handleRequestAudit}
            className="rounded-2xl border border-[#27272A] bg-[#0B0B0D] p-6 text-[#F8F7F4] lg:col-span-5 lg:p-8"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-[#E879F9]">
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              <span>₦0 Complimentary Diagnostic</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold text-white">
              Claim Your Free Brand &amp; Digital Audit
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
              Receive an immediate baseline scorecard plus a bespoke manual
              review from Pulzitive Creative Director Salami Abiodun.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="audit-brand"
                  className="block text-xs font-medium text-[#D4D4D8]"
                >
                  Brand / Company Name
                </label>
                <input
                  id="audit-brand"
                  type="text"
                  value={auditBrand}
                  onChange={(e) => setAuditBrand(e.target.value)}
                  placeholder="Sofri Digital Bank"
                  className="mt-1.5 w-full rounded-lg border border-[#27272A] bg-[#141417] px-3.5 py-2.5 text-sm text-white focus:border-[#E879F9] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="audit-website"
                    className="block text-xs font-medium text-[#D4D4D8]"
                  >
                    Website URL
                  </label>
                  <input
                    id="audit-website"
                    type="url"
                    value={auditWebsite}
                    onChange={(e) => setAuditWebsite(e.target.value)}
                    placeholder="https://yourbrand.com"
                    className="mt-1.5 w-full rounded-lg border border-[#27272A] bg-[#141417] px-3.5 py-2.5 text-sm text-white focus:border-[#E879F9] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="audit-social"
                    className="block text-xs font-medium text-[#D4D4D8]"
                  >
                    Instagram / LinkedIn
                  </label>
                  <input
                    id="audit-social"
                    type="text"
                    value={auditSocial}
                    onChange={(e) => setAuditSocial(e.target.value)}
                    placeholder="@yourbrandng"
                    className="mt-1.5 w-full rounded-lg border border-[#27272A] bg-[#141417] px-3.5 py-2.5 text-sm text-white focus:border-[#E879F9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="audit-focus"
                  className="block text-xs font-medium text-[#D4D4D8]"
                >
                  Primary Audit Focus
                </label>
                <select
                  id="audit-focus"
                  value={auditFocus}
                  onChange={(e) =>
                    setAuditFocus(e.target.value as AuditFocusArea)
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#27272A] bg-[#141417] px-3.5 py-2.5 text-sm text-white focus:border-[#E879F9] focus:outline-none"
                >
                  {AUDIT_FOCUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="audit-challenge"
                  className="block text-xs font-medium text-[#D4D4D8]"
                >
                  Key Bottleneck or Growth Goal
                </label>
                <textarea
                  id="audit-challenge"
                  rows={3}
                  value={auditChallenge}
                  onChange={(e) => setAuditChallenge(e.target.value)}
                  placeholder="Where are prospects dropping off? Low ad ROAS, outdated visual identity, or weak landing conversion?"
                  className="mt-1.5 w-full rounded-lg border border-[#27272A] bg-[#141417] px-3.5 py-2.5 text-sm text-white focus:border-[#E879F9] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAudit}
                className="w-full rounded-lg bg-[#C026D3] px-5 py-3 text-sm font-medium text-white hover:bg-[#A21CAF] disabled:opacity-60 cursor-pointer"
              >
                {submittingAudit
                  ? 'Running Diagnostic...'
                  : 'Generate Free Audit Report'}
              </button>
            </div>
          </form>

          <div className="space-y-4 lg:col-span-7">
            <h2 className="font-display text-xl font-semibold text-[#111113]">
              Your Brand Audit Diagnostics ({audits.length})
            </h2>

            {audits.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E3DD] bg-white p-8 text-sm text-[#52525B]">
                You have not requested a Free Brand &amp; Digital Audit yet. Submit
                your brand details on the left to unlock an instant readiness
                scorecard and senior creative director critique.
              </div>
            ) : (
              audits.map((audit) => (
                <article
                  key={audit.id}
                  className="rounded-2xl border border-[#E5E3DD] bg-white p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F1EFEA] pb-4">
                    <div>
                      <span className="text-xs font-medium text-[#A21CAF]">
                        {audit.focusArea}
                      </span>
                      <h3 className="mt-1 font-display text-xl font-semibold text-[#111113]">
                        {audit.brandName}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl font-semibold text-[#111113] tabular-nums">
                        {audit.diagnosticScore}/100
                      </div>
                      <span className="font-mono text-[11px] uppercase text-[#52525B]">
                        {audit.status === 'delivered'
                          ? 'Director Review Delivered'
                          : audit.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#27272A]">
                    {audit.auditFindings}
                  </div>

                  <div className="mt-4 rounded-xl border border-[#E5E3DD] bg-[#F8F7F4] p-4 text-xs text-[#52525B]">
                    <span className="font-semibold text-[#111113]">
                      Recommended Action:
                    </span>{' '}
                    {audit.recommendedNextStep}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadAuditReport(audit)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4D2CA] px-3.5 py-2 text-xs font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Download Audit Summary</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('calls')}
                      className="text-xs font-medium text-[#A21CAF] hover:underline cursor-pointer"
                    >
                      Review findings on Google Meet →
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE MEET DISCOVERY CALLS */}
      {activeTab === 'calls' && (
        <div className="mt-8 rounded-2xl border border-[#E5E3DD] bg-white p-6 lg:p-10">
          <div className="mb-6 border-b border-[#E5E3DD] pb-5">
            <p className="text-xs font-medium text-[#A21CAF]">
              Direct Studio Strategy Session
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#111113]">
              Book a Google Meet Discovery or Audit Review Call
            </h2>
          </div>
          <DiscoveryCallScheduler />
        </div>
      )}
    </div>
  );
}
