import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Award,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { usePortalAuth } from '@/src/context/PortalAuthContext';
import {
  ActivityCategory,
  ActivityLog,
  adminUpdateAudit,
  adminUpdateBooking,
  adminUpdateEnrollment,
  FreeAuditRequest,
  ServiceBooking,
  StudentEnrollment,
  subscribeAllActivityLogs,
  subscribeAllAudits,
  subscribeAllBookings,
  subscribeAllEnrollments,
  subscribeAllUsers,
  UserProfile,
} from '@/src/lib/pulzitiveDb';

type AdminTab = 'activity' | 'students' | 'bookings' | 'audits' | 'users';

function formatTimestamp(ts?: { toDate?: () => Date }): string {
  if (!ts || typeof ts.toDate !== 'function') return 'Just now';
  return ts.toDate().toLocaleString('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminDashboardPage() {
  const { authReady, user, isAdmin, openAuthModal, signOut, recordActivity } =
    usePortalAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('activity');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [audits, setAudits] = useState<FreeAuditRequest[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Filters
  const [activityFilter, setActivityFilter] = useState<
    'all' | ActivityCategory
  >('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Inline editable states per record ID
  const [enrollmentDrafts, setEnrollmentDrafts] = useState<
    Record<
      string,
      {
        status: StudentEnrollment['status'];
        mentorNotes: string;
        certificateIssued: boolean;
        certificateId: string;
      }
    >
  >({});
  const [bookingDrafts, setBookingDrafts] = useState<
    Record<
      string,
      {
        status: ServiceBooking['status'];
        agencyMilestone: string;
        agencyNotes: string;
      }
    >
  >({});
  const [auditDrafts, setAuditDrafts] = useState<
    Record<
      string,
      {
        status: FreeAuditRequest['status'];
        diagnosticScore: number;
        auditFindings: string;
        recommendedNextStep: string;
      }
    >
  >({});
  const [savingId, setSavingId] = useState<string>('');

  useEffect(() => {
    if (!authReady || !user || !isAdmin) return;

    const u1 = subscribeAllActivityLogs(setLogs, (e) => setError(e.message));
    const u2 = subscribeAllUsers(setUsers, (e) => setError(e.message));
    const u3 = subscribeAllEnrollments(
      (items) => {
        setEnrollments(items);
        setEnrollmentDrafts((prev) => {
          const next = { ...prev };
          items.forEach((item) => {
            if (!next[item.id]) {
              next[item.id] = {
                status: item.status,
                mentorNotes: item.mentorNotes || '',
                certificateIssued: item.certificateIssued,
                certificateId: item.certificateId || '',
              };
            }
          });
          return next;
        });
      },
      (e) => setError(e.message)
    );
    const u4 = subscribeAllBookings(
      (items) => {
        setBookings(items);
        setBookingDrafts((prev) => {
          const next = { ...prev };
          items.forEach((item) => {
            if (!next[item.id]) {
              next[item.id] = {
                status: item.status,
                agencyMilestone: item.agencyMilestone || '',
                agencyNotes: item.agencyNotes || '',
              };
            }
          });
          return next;
        });
      },
      (e) => setError(e.message)
    );
    const u5 = subscribeAllAudits(
      (items) => {
        setAudits(items);
        setAuditDrafts((prev) => {
          const next = { ...prev };
          items.forEach((item) => {
            if (!next[item.id]) {
              next[item.id] = {
                status: item.status,
                diagnosticScore: item.diagnosticScore || 65,
                auditFindings: item.auditFindings || '',
                recommendedNextStep: item.recommendedNextStep || '',
              };
            }
          });
          return next;
        });
      },
      (e) => setError(e.message)
    );

    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
    };
  }, [authReady, user, isAdmin]);

  if (!authReady) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
        <div className="rounded-2xl border border-[#E5E3DD] bg-white p-10 text-center text-sm text-[#52525B]">
          Verifying Admin credentials...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#27272A] bg-[#0B0B0D] p-8 text-[#F8F7F4] lg:p-12">
          <ShieldCheck className="h-8 w-8 text-[#E879F9]" aria-hidden="true" />
          <p className="mt-4 text-xs font-medium text-[#E879F9]">
            Pulzitive Agency · Operations &amp; Activity Monitor
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-white">
            Admin Console Sign In
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
            Sign in with the verified agency administrator account (
            <span className="font-mono text-white">salamabiodun01@gmail.com</span>
            ) to monitor live website activity, approve student certificates, and
            manage client bookings and free audits.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('client', 'admin')}
            className="mt-8 rounded-lg bg-[#C026D3] px-6 py-3 text-sm font-medium text-white hover:bg-[#A21CAF] cursor-pointer"
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 lg:p-10">
          <ShieldAlert className="h-8 w-8 text-red-600" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-[#111113]">
            Admin Access Restricted
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#52525B]">
            Signed in as{' '}
            <span className="font-mono text-xs text-[#111113]">{user.email}</span>
            . Only the verified Pulzitive Director account (
            <span className="font-mono text-xs text-[#111113]">
              salamabiodun01@gmail.com
            </span>
            ) is authorized to inspect platform-wide analytics and client records.
          </p>
          <button
            type="button"
            onClick={signOut}
            className="mt-6 rounded-lg border border-[#D4D2CA] px-5 py-2.5 text-xs font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
          >
            Switch Google Account
          </button>
        </div>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleSaveEnrollment = async (item: StudentEnrollment, issueCertNow = false) => {
    const draft = enrollmentDrafts[item.id];
    if (!draft) return;
    setSavingId(item.id);
    setError('');

    const nextCertIssued = issueCertNow ? true : draft.certificateIssued;
    const nextStatus = issueCertNow ? 'graduated' : draft.status;
    const nextCertId = nextCertIssued
      ? draft.certificateId || `PLZ-C06-${item.id.slice(0, 6).toUpperCase()}`
      : '';

    try {
      await adminUpdateEnrollment(item.id, {
        status: nextStatus,
        certificateIssued: nextCertIssued,
        certificateId: nextCertId,
        mentorNotes: draft.mentorNotes,
      });
      setEnrollmentDrafts((prev) => ({
        ...prev,
        [item.id]: {
          ...draft,
          status: nextStatus,
          certificateIssued: nextCertIssued,
          certificateId: nextCertId,
        },
      }));
      await recordActivity(
        issueCertNow ? 'certificate' : 'admin_action',
        issueCertNow
          ? `Issued Certificate ${nextCertId} to ${item.studentName}`
          : `Updated Enrollment for ${item.studentName}`,
        `${item.trackTitle} · Status: ${nextStatus}`
      );
      showToast(
        issueCertNow
          ? `Certificate ${nextCertId} issued to ${item.studentName}!`
          : `Saved updates for ${item.studentName}.`
      );
    } catch (err: any) {
      setError(err?.message || 'Unable to update student enrollment.');
    } finally {
      setSavingId('');
    }
  };

  const handleSaveBooking = async (item: ServiceBooking) => {
    const draft = bookingDrafts[item.id];
    if (!draft) return;
    setSavingId(item.id);
    setError('');
    try {
      await adminUpdateBooking(item.id, draft);
      await recordActivity(
        'admin_action',
        `Updated Booking Status (${draft.status}) for ${item.organization}`,
        `Milestone: ${draft.agencyMilestone}`
      );
      showToast(`Updated booking for ${item.organization}.`);
    } catch (err: any) {
      setError(err?.message || 'Unable to update service booking.');
    } finally {
      setSavingId('');
    }
  };

  const handleSaveAudit = async (item: FreeAuditRequest, markDelivered = false) => {
    const draft = auditDrafts[item.id];
    if (!draft) return;
    setSavingId(item.id);
    setError('');
    const nextStatus = markDelivered ? 'delivered' : draft.status;
    try {
      await adminUpdateAudit(item.id, {
        ...draft,
        status: nextStatus,
      });
      setAuditDrafts((prev) => ({
        ...prev,
        [item.id]: { ...draft, status: nextStatus },
      }));
      await recordActivity(
        'admin_action',
        `${markDelivered ? 'Delivered' : 'Updated'} Free Audit for ${item.brandName}`,
        `Diagnostic Score: ${draft.diagnosticScore}/100`
      );
      showToast(`Published Free Audit review for ${item.brandName}.`);
    } catch (err: any) {
      setError(err?.message || 'Unable to update free audit.');
    } finally {
      setSavingId('');
    }
  };

  const filteredLogs = logs.filter((log) => {
    const catOk = activityFilter === 'all' || log.category === activityFilter;
    const q = searchTerm.trim().toLowerCase();
    const searchOk =
      !q ||
      log.actorName.toLowerCase().includes(q) ||
      log.actorEmail.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
    return catOk && searchOk;
  });

  const certsIssuedCount = enrollments.filter((e) => e.certificateIssued).length;
  const studentUsersCount = users.filter((u) => u.role === 'student').length;
  const clientUsersCount = users.filter((u) => u.role === 'client').length;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 lg:px-10 lg:py-14">
      {/* Admin Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#E5E3DD] pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium text-[#A21CAF]">
            Pulzitive Agency · Executive Operations Monitor
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111113] lg:text-4xl">
            Admin Command Console
          </h1>
          <p className="mt-2 text-sm text-[#52525B]">
            Real-time oversight across student cohorts, certificate issuance,
            client service bookings, free brand audits, and platform activity.
          </p>
        </div>

        <div className="text-xs text-[#52525B]">
          <span>Authenticated Director: </span>
          <span className="font-mono font-semibold text-[#111113]">
            {user.email}
          </span>
        </div>
      </div>

      {/* 6-Card Telemetry KPI Strip */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-[#E5E3DD] bg-white p-4">
          <span className="text-xs text-[#71717A]">Users</span>
          <div className="mt-1 font-display text-2xl font-semibold text-[#111113] tabular-nums">
            {users.length}
          </div>
          <span className="text-[11px] text-[#52525B] tabular-nums">
            {studentUsersCount} Students · {clientUsersCount} Clients
          </span>
        </div>
        <div className="rounded-xl border border-[#E5E3DD] bg-white p-4">
          <span className="text-xs text-[#71717A]">Enrollments</span>
          <div className="mt-1 font-display text-2xl font-semibold text-[#111113] tabular-nums">
            {enrollments.length}
          </div>
          <span className="text-[11px] text-[#52525B]">Cohort 06</span>
        </div>
        <div className="rounded-xl border border-[#E5E3DD] bg-white p-4">
          <span className="text-xs text-[#71717A]">Certificates</span>
          <div className="mt-1 font-display text-2xl font-semibold text-[#A21CAF] tabular-nums">
            {certsIssuedCount}
          </div>
          <span className="text-[11px] text-[#52525B]">Sealed &amp; Issued</span>
        </div>
        <div className="rounded-xl border border-[#E5E3DD] bg-white p-4">
          <span className="text-xs text-[#71717A]">Bookings</span>
          <div className="mt-1 font-display text-2xl font-semibold text-[#111113] tabular-nums">
            {bookings.length}
          </div>
          <span className="text-[11px] text-[#52525B]">Client Projects</span>
        </div>
        <div className="rounded-xl border border-[#E5E3DD] bg-white p-4">
          <span className="text-xs text-[#71717A]">Free Audits</span>
          <div className="mt-1 font-display text-2xl font-semibold text-[#111113] tabular-nums">
            {audits.length}
          </div>
          <span className="text-[11px] text-[#52525B]">
            {audits.filter((a) => a.status !== 'delivered').length} Pending
          </span>
        </div>
        <div className="rounded-xl border border-[#E5E3DD] bg-white p-4">
          <span className="text-xs text-[#71717A]">Site Events</span>
          <div className="mt-1 font-display text-2xl font-semibold text-[#111113] tabular-nums">
            {logs.length}
          </div>
          <span className="text-[11px] text-[#52525B]">Logged Actions</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-[#E5E3DD] pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-[#C026D3] text-white'
              : 'border border-[#E5E3DD] bg-white text-[#52525B] hover:text-[#111113]'
          }`}
        >
          <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Website Activity Monitor ({logs.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium cursor-pointer ${
            activeTab === 'students'
              ? 'bg-[#C026D3] text-white'
              : 'border border-[#E5E3DD] bg-white text-[#52525B] hover:text-[#111113]'
          }`}
        >
          <Award className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Students &amp; Certificates ({enrollments.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-[#C026D3] text-white'
              : 'border border-[#E5E3DD] bg-white text-[#52525B] hover:text-[#111113]'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Client Bookings ({bookings.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audits')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium cursor-pointer ${
            activeTab === 'audits'
              ? 'bg-[#C026D3] text-white'
              : 'border border-[#E5E3DD] bg-white text-[#52525B] hover:text-[#111113]'
          }`}
        >
          <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Free Audits ({audits.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#C026D3] text-white'
              : 'border border-[#E5E3DD] bg-white text-[#52525B] hover:text-[#111113]'
          }`}
        >
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          <span>User Directory ({users.length})</span>
        </button>
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

      {notice && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}

      {/* TAB 1: WEBSITE ACTIVITY MONITOR */}
      {activeTab === 'activity' && (
        <div className="mt-8 space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['all', 'All Events'],
                  ['auth', 'Sign Ups'],
                  ['service_booking', 'Bookings'],
                  ['free_audit', 'Free Audits'],
                  ['cohort', 'Cohort Progress'],
                  ['certificate', 'Certificates'],
                  ['discovery_call', 'Google Meet Calls'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActivityFilter(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
                    activityFilter === key
                      ? 'bg-[#111113] text-white'
                      : 'border border-[#E5E3DD] bg-white text-[#52525B] hover:text-[#111113]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#71717A]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user or event..."
                className="w-full rounded-lg border border-[#D4D2CA] bg-white py-2 pr-3 pl-9 text-xs text-[#111113] focus:border-[#C026D3] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5E3DD] bg-white">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#52525B]">
                No logged website activities match this filter yet.
              </div>
            ) : (
              <div className="divide-y divide-[#F1EFEA]">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col justify-between gap-3 px-6 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-[#A21CAF] uppercase">
                          {log.category.replace('_', ' ')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-[#111113]">
                          {log.actorName}
                        </span>
                        <span className="font-mono text-[#71717A]">
                          ({log.actorEmail})
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-[#111113]">
                        {log.action}
                      </div>
                      {log.details && (
                        <p className="mt-0.5 text-xs text-[#52525B]">
                          {log.details}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right text-xs text-[#71717A] tabular-nums">
                      <div>{formatTimestamp(log.createdAt)}</div>
                      <div className="mt-0.5 uppercase font-mono text-[10px]">
                        {log.actorRole}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS & CERTIFICATES */}
      {activeTab === 'students' && (
        <div className="mt-8 space-y-5">
          {enrollments.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E3DD] bg-white p-8 text-sm text-[#52525B]">
              No Academy student enrollments recorded yet.
            </div>
          ) : (
            enrollments.map((item) => {
              const draft = enrollmentDrafts[item.id] || {
                status: item.status,
                mentorNotes: item.mentorNotes,
                certificateIssued: item.certificateIssued,
                certificateId: item.certificateId,
              };
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#E5E3DD] bg-white p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F1EFEA] pb-4">
                    <div>
                      <div className="text-xs font-medium text-[#A21CAF]">
                        {item.trackTitle} · {item.cohortLabel}
                      </div>
                      <h3 className="mt-1 font-display text-xl font-semibold text-[#111113]">
                        {item.studentName}{' '}
                        <span className="font-mono text-xs font-normal text-[#71717A]">
                          ({item.studentEmail})
                        </span>
                      </h3>
                    </div>

                    <div className="text-right text-xs">
                      <span className="block font-semibold text-[#111113] tabular-nums">
                        {item.completedModules.length} Modules Checked
                      </span>
                      <span className="mt-0.5 block font-mono text-[#A21CAF]">
                        {item.certificateIssued
                          ? `Cert: ${item.certificateId}`
                          : 'Certificate Not Issued'}
                      </span>
                    </div>
                  </div>

                  {item.capstoneUrl && (
                    <div className="mt-4 rounded-xl border border-[#E5E3DD] bg-[#F8F7F4] p-4 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#111113]">
                          Submitted Capstone Link
                        </span>
                        <a
                          href={item.capstoneUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-[#A21CAF] hover:underline"
                        >
                          <span>Inspect Deliverable</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </div>
                      {item.capstoneNotes && (
                        <p className="mt-1.5 text-[#52525B]">
                          {item.capstoneNotes}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-medium text-[#52525B]">
                        Cohort Status
                      </label>
                      <select
                        value={draft.status}
                        onChange={(e) =>
                          setEnrollmentDrafts((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...draft,
                              status: e.target
                                .value as StudentEnrollment['status'],
                            },
                          }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113]"
                      >
                        <option value="active">Active Fellow</option>
                        <option value="submitted_capstone">
                          Capstone In Review
                        </option>
                        <option value="graduated">Graduated</option>
                      </select>
                    </div>

                    <div className="sm:col-span-8">
                      <label className="block text-xs font-medium text-[#52525B]">
                        Mentor Feedback Notes
                      </label>
                      <input
                        type="text"
                        value={draft.mentorNotes}
                        onChange={(e) =>
                          setEnrollmentDrafts((prev) => ({
                            ...prev,
                            [item.id]: { ...draft, mentorNotes: e.target.value },
                          }))
                        }
                        placeholder="Add portfolio review critique or graduation remarks..."
                        className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113]"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={savingId === item.id}
                      onClick={() => handleSaveEnrollment(item, false)}
                      className="rounded-lg border border-[#D4D2CA] px-4 py-2 text-xs font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
                    >
                      Save Status &amp; Notes
                    </button>
                    {!item.certificateIssued && (
                      <button
                        type="button"
                        disabled={savingId === item.id}
                        onClick={() => handleSaveEnrollment(item, true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#C026D3] px-4 py-2 text-xs font-medium text-white hover:bg-[#A21CAF] cursor-pointer"
                      >
                        <Award className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Approve Graduation &amp; Issue Certificate</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: CLIENT SERVICE BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="mt-8 space-y-5">
          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E3DD] bg-white p-8 text-sm text-[#52525B]">
              No client service bookings yet.
            </div>
          ) : (
            bookings.map((item) => {
              const draft = bookingDrafts[item.id] || {
                status: item.status,
                agencyMilestone: item.agencyMilestone,
                agencyNotes: item.agencyNotes,
              };
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#E5E3DD] bg-white p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F1EFEA] pb-4">
                    <div>
                      <div className="text-xs font-medium text-[#A21CAF]">
                        {item.serviceType} · {item.budgetTier} ({item.timeline})
                      </div>
                      <h3 className="mt-1 font-display text-xl font-semibold text-[#111113]">
                        {item.organization}{' '}
                        <span className="font-mono text-xs font-normal text-[#71717A]">
                          — {item.clientName} ({item.clientEmail})
                        </span>
                      </h3>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-[#52525B]">
                    {item.projectBrief}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-[#52525B]">
                        Production Status
                      </label>
                      <select
                        value={draft.status}
                        onChange={(e) =>
                          setBookingDrafts((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...draft,
                              status: e.target.value as ServiceBooking['status'],
                            },
                          }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113]"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="in_review">In Review</option>
                        <option value="in_production">In Production</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-medium text-[#52525B]">
                        Current Milestone
                      </label>
                      <input
                        type="text"
                        value={draft.agencyMilestone}
                        onChange={(e) =>
                          setBookingDrafts((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...draft,
                              agencyMilestone: e.target.value,
                            },
                          }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113]"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-xs font-medium text-[#52525B]">
                        Agency Notes to Client
                      </label>
                      <input
                        type="text"
                        value={draft.agencyNotes}
                        onChange={(e) =>
                          setBookingDrafts((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...draft,
                              agencyNotes: e.target.value,
                            },
                          }))
                        }
                        placeholder="Next delivery date, creative deck link..."
                        className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113]"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={savingId === item.id}
                      onClick={() => handleSaveBooking(item)}
                      className="rounded-lg bg-[#C026D3] px-4 py-2 text-xs font-medium text-white hover:bg-[#A21CAF] cursor-pointer"
                    >
                      Update Client Booking
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* TAB 4: FREE AUDITS DESK */}
      {activeTab === 'audits' && (
        <div className="mt-8 space-y-5">
          {audits.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E3DD] bg-white p-8 text-sm text-[#52525B]">
              No free brand audit requests yet.
            </div>
          ) : (
            audits.map((item) => {
              const draft = auditDrafts[item.id] || {
                status: item.status,
                diagnosticScore: item.diagnosticScore,
                auditFindings: item.auditFindings,
                recommendedNextStep: item.recommendedNextStep,
              };
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#E5E3DD] bg-white p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F1EFEA] pb-4">
                    <div>
                      <div className="text-xs font-medium text-[#A21CAF]">
                        {item.focusArea}
                      </div>
                      <h3 className="mt-1 font-display text-xl font-semibold text-[#111113]">
                        {item.brandName}{' '}
                        <span className="font-mono text-xs font-normal text-[#71717A]">
                          — {item.clientName} ({item.clientEmail})
                        </span>
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-[#52525B]">
                        {item.websiteUrl && <span>Web: {item.websiteUrl}</span>}
                        {item.socialHandle && (
                          <span>Social: {item.socialHandle}</span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold uppercase text-[#111113]">
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-[#52525B]">
                    <span className="font-semibold text-[#111113]">
                      Client Challenge:
                    </span>{' '}
                    {item.primaryChallenge}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-[#52525B]">
                        Score (0–100)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={draft.diagnosticScore}
                        onChange={(e) =>
                          setAuditDrafts((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...draft,
                              diagnosticScore: Number(e.target.value),
                            },
                          }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113] tabular-nums"
                      />
                    </div>
                    <div className="sm:col-span-9">
                      <label className="block text-xs font-medium text-[#52525B]">
                        Recommended Next Step
                      </label>
                      <input
                        type="text"
                        value={draft.recommendedNextStep}
                        onChange={(e) =>
                          setAuditDrafts((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...draft,
                              recommendedNextStep: e.target.value,
                            },
                          }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113]"
                      />
                    </div>
                    <div className="sm:col-span-12">
                      <label className="block text-xs font-medium text-[#52525B]">
                        Executive Audit Findings
                      </label>
                      <textarea
                        rows={3}
                        value={draft.auditFindings}
                        onChange={(e) =>
                          setAuditDrafts((prev) => ({
                            ...prev,
                            [item.id]: { ...draft, auditFindings: e.target.value },
                          }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113]"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={savingId === item.id}
                      onClick={() => handleSaveAudit(item, false)}
                      className="rounded-lg border border-[#D4D2CA] px-4 py-2 text-xs font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      disabled={savingId === item.id}
                      onClick={() => handleSaveAudit(item, true)}
                      className="rounded-lg bg-[#C026D3] px-4 py-2 text-xs font-medium text-white hover:bg-[#A21CAF] cursor-pointer"
                    >
                      Publish Audit Report to Client
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* TAB 5: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#E5E3DD] bg-white">
          {users.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#52525B]">
              No registered users yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5E3DD] bg-[#F8F7F4] text-[#52525B]">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Member</th>
                    <th className="px-6 py-3.5 font-semibold">Role</th>
                    <th className="px-6 py-3.5 font-semibold">Organization</th>
                    <th className="px-6 py-3.5 font-semibold">Phone</th>
                    <th className="px-6 py-3.5 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EFEA]">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#111113]">
                          {u.displayName}
                        </div>
                        <div className="font-mono text-[11px] text-[#71717A]">
                          {u.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono uppercase text-[#A21CAF]">
                        {u.role}
                      </td>
                      <td className="px-6 py-4 text-[#52525B]">
                        {u.organization || '—'}
                      </td>
                      <td className="px-6 py-4 text-[#52525B] tabular-nums">
                        {u.phone || '—'}
                      </td>
                      <td className="px-6 py-4 text-[#71717A] tabular-nums">
                        {formatTimestamp(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
