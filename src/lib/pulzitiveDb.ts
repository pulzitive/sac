import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export const ADMIN_EMAIL = 'salamabiodun01@gmail.com';

export type PortalRole = 'student' | 'client';

export type ServiceType =
  | 'Brand Identity & Systems'
  | 'Digital Marketing & Performance'
  | 'Media Production & 3D Motion'
  | 'Product UI/UX & Web Flagship'
  | 'Full-Stack Brand + Launch Retainer';

export type AuditFocusArea =
  | 'Brand Positioning & Identity'
  | 'Website & Conversion UI/UX'
  | 'Social Media & Performance Ads'
  | 'Media Production & Visual Quality';

export type ActivityCategory =
  | 'auth'
  | 'cohort'
  | 'certificate'
  | 'service_booking'
  | 'free_audit'
  | 'discovery_call'
  | 'admin_action';

export interface UserProfile {
  id: string;
  ownerUid: string;
  role: PortalRole;
  displayName: string;
  email: string;
  organization: string;
  phone: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface StudentEnrollment {
  id: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  trackId: string;
  trackTitle: string;
  cohortFormat: 'studio' | 'executive';
  cohortLabel: string;
  startDate: string;
  meetLink: string;
  completedModules: string[];
  capstoneUrl: string;
  capstoneNotes: string;
  status: 'active' | 'submitted_capstone' | 'graduated';
  certificateIssued: boolean;
  certificateId: string;
  mentorNotes: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ServiceBooking {
  id: string;
  clientUid: string;
  clientName: string;
  clientEmail: string;
  organization: string;
  serviceType: ServiceType;
  budgetTier: string;
  timeline: string;
  projectBrief: string;
  referenceUrl: string;
  status: 'submitted' | 'in_review' | 'in_production' | 'delivered';
  agencyMilestone: string;
  agencyNotes: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FreeAuditRequest {
  id: string;
  clientUid: string;
  clientName: string;
  clientEmail: string;
  brandName: string;
  websiteUrl: string;
  socialHandle: string;
  focusArea: AuditFocusArea;
  primaryChallenge: string;
  status: 'pending' | 'in_review' | 'delivered';
  diagnosticScore: number;
  auditFindings: string;
  recommendedNextStep: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ActivityLog {
  id: string;
  actorUid: string;
  actorName: string;
  actorEmail: string;
  actorRole: 'student' | 'client' | 'admin';
  category: ActivityCategory;
  action: string;
  details: string;
  createdAt?: Timestamp;
}

const portalGoogleProvider = new GoogleAuthProvider();
portalGoogleProvider.setCustomParameters({ prompt: 'select_account' });

function clampStr(value: string | undefined, max: number): string {
  return (value || '').trim().slice(0, max);
}

export function isUserBootstrappedAdmin(user: User | null): boolean {
  return Boolean(
    user &&
      user.emailVerified &&
      user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

export async function signInWithGooglePortal(): Promise<User> {
  const result = await signInWithPopup(auth, portalGoogleProvider);
  if (!result.user.emailVerified) {
    throw new Error('Please use a verified Google email address.');
  }
  if (isUserBootstrappedAdmin(result.user)) {
    await ensureAdminRecord(result.user);
  }
  return result.user;
}

export async function signOutPortal(): Promise<void> {
  await signOut(auth);
}

export async function ensureAdminRecord(user: User): Promise<void> {
  if (!isUserBootstrappedAdmin(user)) return;
  const ref = doc(db, 'admins', user.uid);
  try {
    await setDoc(
      ref,
      {
        uid: user.uid,
        email: clampStr(user.email || ADMIN_EMAIL, 160),
        role: 'admin',
        createdAt: serverTimestamp(),
      },
      { merge: false }
    );
  } catch (err) {
    // Ignore if admin doc already exists (update not allowed on admins collection)
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.toLowerCase().includes('already exists') && !msg.toLowerCase().includes('permission')) {
      handleFirestoreError(err, OperationType.CREATE, `admins/${user.uid}`);
    }
  }
}

export function subscribeIsAdminDoc(
  uid: string,
  onResult: (isAdmin: boolean) => void
): () => void {
  const path = `admins/${uid}`;
  return onSnapshot(
    doc(db, 'admins', uid),
    (snap) => {
      onResult(snap.exists());
    },
    (err) => {
      // Non-admin users will receive permission-denied on admins/{uid} if not listed; handle gracefully
      if (
        err.message?.includes('permission-denied') ||
        err.code === 'permission-denied'
      ) {
        onResult(false);
        return;
      }
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
      } else {
        onData({ id: snap.id, ...(snap.data() as Omit<UserProfile, 'id'>) });
      }
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export async function createUserProfile(
  uid: string,
  input: {
    role: PortalRole;
    displayName: string;
    email: string;
    organization: string;
    phone: string;
  }
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, 'users', uid), {
      ownerUid: uid,
      role: input.role,
      displayName: clampStr(input.displayName, 120) || 'Pulzitive Member',
      email: clampStr(input.email, 160),
      organization: clampStr(input.organization, 120),
      phone: clampStr(input.phone, 40),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateUserProfile(
  uid: string,
  updates: {
    displayName: string;
    organization: string;
    phone: string;
  }
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      displayName: clampStr(updates.displayName, 120) || 'Pulzitive Member',
      organization: clampStr(updates.organization, 120),
      phone: clampStr(updates.phone, 40),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// --- Student Enrollments ---

export async function createStudentEnrollment(input: {
  studentUid: string;
  studentName: string;
  studentEmail: string;
  trackId: string;
  trackTitle: string;
  cohortFormat: 'studio' | 'executive';
  cohortLabel: string;
  startDate: string;
  meetLink?: string;
}): Promise<string> {
  const path = 'studentEnrollments';
  try {
    const docRef = await addDoc(collection(db, path), {
      studentUid: input.studentUid,
      studentName: clampStr(input.studentName, 120) || 'Pulzitive Fellow',
      studentEmail: clampStr(input.studentEmail, 160),
      trackId: clampStr(input.trackId, 80).replace(/[^a-zA-Z0-9_-]/g, '-'),
      trackTitle: clampStr(input.trackTitle, 160),
      cohortFormat: input.cohortFormat,
      cohortLabel: clampStr(input.cohortLabel, 120),
      startDate: clampStr(input.startDate, 60),
      meetLink: clampStr(input.meetLink || '', 300),
      completedModules: [],
      capstoneUrl: '',
      capstoneNotes: '',
      status: 'active',
      certificateIssued: false,
      certificateId: '',
      mentorNotes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateStudentProgress(
  enrollmentId: string,
  updates: {
    completedModules: string[];
    capstoneUrl: string;
    capstoneNotes: string;
    status: 'active' | 'submitted_capstone';
  }
): Promise<void> {
  const path = `studentEnrollments/${enrollmentId}`;
  try {
    await updateDoc(doc(db, 'studentEnrollments', enrollmentId), {
      completedModules: updates.completedModules.slice(0, 16),
      capstoneUrl: clampStr(updates.capstoneUrl, 300),
      capstoneNotes: clampStr(updates.capstoneNotes, 1500),
      status: updates.status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export function subscribeMyEnrollments(
  studentUid: string,
  onData: (items: StudentEnrollment[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'studentEnrollments';
  const q = query(
    collection(db, path),
    where('studentUid', '==', studentUid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StudentEnrollment, 'id'>),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

// --- Client Service Bookings ---

export async function createServiceBooking(input: {
  clientUid: string;
  clientName: string;
  clientEmail: string;
  organization: string;
  serviceType: ServiceType;
  budgetTier: string;
  timeline: string;
  projectBrief: string;
  referenceUrl?: string;
}): Promise<string> {
  const path = 'serviceBookings';
  try {
    const docRef = await addDoc(collection(db, path), {
      clientUid: input.clientUid,
      clientName: clampStr(input.clientName, 120) || 'Pulzitive Client',
      clientEmail: clampStr(input.clientEmail, 160),
      organization: clampStr(input.organization, 120) || 'Independent Brand',
      serviceType: input.serviceType,
      budgetTier: clampStr(input.budgetTier, 80),
      timeline: clampStr(input.timeline, 80),
      projectBrief: clampStr(input.projectBrief, 2000),
      referenceUrl: clampStr(input.referenceUrl || '', 300),
      status: 'submitted',
      agencyMilestone: 'Brief Received — Studio Review',
      agencyNotes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateClientBookingBrief(
  bookingId: string,
  updates: {
    projectBrief: string;
    referenceUrl: string;
    timeline: string;
    budgetTier: string;
  }
): Promise<void> {
  const path = `serviceBookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'serviceBookings', bookingId), {
      projectBrief: clampStr(updates.projectBrief, 2000),
      referenceUrl: clampStr(updates.referenceUrl, 300),
      timeline: clampStr(updates.timeline, 80),
      budgetTier: clampStr(updates.budgetTier, 80),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export function subscribeMyBookings(
  clientUid: string,
  onData: (items: ServiceBooking[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'serviceBookings';
  const q = query(
    collection(db, path),
    where('clientUid', '==', clientUid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ServiceBooking, 'id'>),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

// --- Client Free Brand & Digital Audits ---

function computeBaselineAudit(input: {
  brandName: string;
  websiteUrl?: string;
  socialHandle?: string;
  focusArea: AuditFocusArea;
}): {
  score: number;
  findings: string;
  nextStep: string;
} {
  let score = 54;
  if (input.websiteUrl && input.websiteUrl.startsWith('https://')) score += 10;
  else if (input.websiteUrl) score += 5;
  if (input.socialHandle) score += 8;

  const focusInsights: Record<AuditFocusArea, { findings: string; nextStep: string }> = {
    'Brand Positioning & Identity': {
      findings: `Preliminary Assessment for ${input.brandName}:\n• Visual Identity Architecture: Evaluate typographic consistency across web, social carousels, and packaging touchpoints.\n• Category Differentiation: Strengthen unmistakable brand codes (custom wordmark geometry, color restraint, executive art direction) to command premium pricing.\n• Trust Signals: Surface verifiable client outcomes and case metrics above the fold.`,
      nextStep:
        'Pulzitive Creative Director Salami Abiodun will complete a manual visual & positioning review within 24 hours and unlock your bespoke roadmap.',
    },
    'Website & Conversion UI/UX': {
      findings: `Preliminary Assessment for ${input.brandName}:\n• Above-the-Fold Value Clarity: Compress headline-to-CTA friction so enterprise prospects understand your core offer within 4 seconds.\n• Mobile Conversion Path: Audit booking/checkout steps on mobile viewports for tap targets and trust proof.\n• Typography & Hierarchy: Replace dense blocks with scannable metric-led proof strips.`,
      nextStep:
        'Our Product UI/UX lead will inspect your live user journey and attach prioritized wireframe fixes here.',
    },
    'Social Media & Performance Ads': {
      findings: `Preliminary Assessment for ${input.brandName}:\n• Hook-to-Retention Ratio: Refresh opening 2-second visual hooks in paid reels and carousel creatives.\n• Funnel Alignment: Ensure Meta/LinkedIn ad visuals match landing page typography and value proposition.\n• Creative Testing Cadence: Establish 3 distinct hero angles per campaign sprint.`,
      nextStep:
        'Our Performance Growth Strategist will review your handles and publish a 30-day creative sprint recommendation.',
    },
    'Media Production & Visual Quality': {
      findings: `Preliminary Assessment for ${input.brandName}:\n• Commercial Lighting & Art Direction: Elevate product photography and 3D motion assets to match luxury/fintech category leaders.\n• Format Readiness: Export multi-aspect deliverables (16:9 flagship, 4:5 editorial feed, 9:16 vertical motion).\n• Brand Consistency: Standardize color grading and sonic intros across video spots.`,
      nextStep:
        'Our Media Production Desk will score your existing visual assets and provide a production moodboard checklist.',
    },
  };

  const selected = focusInsights[input.focusArea];
  return {
    score: Math.min(82, score),
    findings: clampStr(selected.findings, 3000),
    nextStep: clampStr(selected.nextStep, 600),
  };
}

export async function createFreeAudit(input: {
  clientUid: string;
  clientName: string;
  clientEmail: string;
  brandName: string;
  websiteUrl?: string;
  socialHandle?: string;
  focusArea: AuditFocusArea;
  primaryChallenge: string;
}): Promise<string> {
  const path = 'freeAudits';
  const baseline = computeBaselineAudit(input);
  try {
    const docRef = await addDoc(collection(db, path), {
      clientUid: input.clientUid,
      clientName: clampStr(input.clientName, 120) || 'Pulzitive Client',
      clientEmail: clampStr(input.clientEmail, 160),
      brandName: clampStr(input.brandName, 120),
      websiteUrl: clampStr(input.websiteUrl || '', 300),
      socialHandle: clampStr(input.socialHandle || '', 160),
      focusArea: input.focusArea,
      primaryChallenge: clampStr(input.primaryChallenge, 1500),
      status: 'pending',
      diagnosticScore: baseline.score,
      auditFindings: baseline.findings,
      recommendedNextStep: baseline.nextStep,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export function subscribeMyAudits(
  clientUid: string,
  onData: (items: FreeAuditRequest[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'freeAudits';
  const q = query(
    collection(db, path),
    where('clientUid', '==', clientUid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FreeAuditRequest, 'id'>),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

// --- Activity Monitor Logging ---

export async function logActivity(input: {
  actorUid: string;
  actorName: string;
  actorEmail: string;
  actorRole: 'student' | 'client' | 'admin';
  category: ActivityCategory;
  action: string;
  details: string;
}): Promise<void> {
  const path = 'activityLogs';
  try {
    await addDoc(collection(db, path), {
      actorUid: input.actorUid,
      actorName: clampStr(input.actorName, 120) || 'Member',
      actorEmail: clampStr(input.actorEmail, 160),
      actorRole: input.actorRole,
      category: input.category,
      action: clampStr(input.action, 200),
      details: clampStr(input.details, 600),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Log silently without breaking UX if user is unverified or logged out mid-action
    console.warn('Activity logging skipped:', err);
  }
}

// --- Admin Subscriptions & Mutations ---

export function subscribeAllUsers(
  onData: (items: UserProfile[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'users';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<UserProfile, 'id'>),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export function subscribeAllEnrollments(
  onData: (items: StudentEnrollment[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'studentEnrollments';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StudentEnrollment, 'id'>),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export function subscribeAllBookings(
  onData: (items: ServiceBooking[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'serviceBookings';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ServiceBooking, 'id'>),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export function subscribeAllAudits(
  onData: (items: FreeAuditRequest[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'freeAudits';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FreeAuditRequest, 'id'>),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export function subscribeAllActivityLogs(
  onData: (items: ActivityLog[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'activityLogs';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ActivityLog, 'id'>),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export async function adminUpdateEnrollment(
  enrollmentId: string,
  updates: {
    status: 'active' | 'submitted_capstone' | 'graduated';
    certificateIssued: boolean;
    certificateId: string;
    mentorNotes: string;
  }
): Promise<void> {
  const path = `studentEnrollments/${enrollmentId}`;
  try {
    await updateDoc(doc(db, 'studentEnrollments', enrollmentId), {
      status: updates.status,
      certificateIssued: updates.certificateIssued,
      certificateId: clampStr(updates.certificateId, 80),
      mentorNotes: clampStr(updates.mentorNotes, 1500),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function adminUpdateBooking(
  bookingId: string,
  updates: {
    status: 'submitted' | 'in_review' | 'in_production' | 'delivered';
    agencyMilestone: string;
    agencyNotes: string;
  }
): Promise<void> {
  const path = `serviceBookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'serviceBookings', bookingId), {
      status: updates.status,
      agencyMilestone: clampStr(updates.agencyMilestone, 300),
      agencyNotes: clampStr(updates.agencyNotes, 1500),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function adminUpdateAudit(
  auditId: string,
  updates: {
    status: 'pending' | 'in_review' | 'delivered';
    diagnosticScore: number;
    auditFindings: string;
    recommendedNextStep: string;
  }
): Promise<void> {
  const path = `freeAudits/${auditId}`;
  try {
    await updateDoc(doc(db, 'freeAudits', auditId), {
      status: updates.status,
      diagnosticScore: Math.max(0, Math.min(100, Math.round(updates.diagnosticScore))),
      auditFindings: clampStr(updates.auditFindings, 3000),
      recommendedNextStep: clampStr(updates.recommendedNextStep, 600),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}
