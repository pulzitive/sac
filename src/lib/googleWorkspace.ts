import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/meetings.space.created',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({ prompt: 'consent' });

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user && cachedAccessToken) {
      onAuthSuccess?.(user, cachedAccessToken);
    } else if (!isSigningIn) {
      if (!user) cachedAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error(
        'Google Calendar and Meet permission token was not returned. Please try signing in again.'
      );
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => cachedAccessToken;

export const getCurrentUser = (): User | null => auth.currentUser;

export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface CalendarBusySlot {
  start: string;
  end: string;
  summary?: string;
}

export async function fetchBusySlotsForDate(
  accessToken: string,
  dateIso: string
): Promise<CalendarBusySlot[]> {
  const dayStart = new Date(`${dateIso}T00:00:00+01:00`).toISOString();
  const dayEnd = new Date(`${dateIso}T23:59:59+01:00`).toISOString();

  const url = new URL(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events'
  );
  url.searchParams.set('timeMin', dayStart);
  url.searchParams.set('timeMax', dayEnd);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Calendar availability check failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];
  return items
    .filter((ev: any) => ev.start?.dateTime && ev.end?.dateTime)
    .map((ev: any) => ({
      start: ev.start.dateTime,
      end: ev.end.dateTime,
      summary: ev.summary || 'Busy',
    }));
}

export interface DiscoveryBookingPayload {
  name: string;
  email: string;
  organization: string;
  discipline: string;
  budget: string;
  notes: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm in WAT (+01:00)
}

export interface DiscoveryBookingResult {
  eventId: string;
  calendarLink: string;
  meetLink: string;
  meetCode?: string;
  startIso: string;
  endIso: string;
}

export async function createDiscoveryCallWithMeet(
  accessToken: string,
  payload: DiscoveryBookingPayload
): Promise<DiscoveryBookingResult> {
  // 1. Create a Google Meet space via Meet v2 API
  let meetUri = '';
  let meetCode = '';
  try {
    const meetRes = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (meetRes.ok) {
      const meetData = await meetRes.json();
      meetUri = meetData.meetingUri || '';
      meetCode = meetData.meetingCode || '';
    }
  } catch {
    // Fallback to Calendar conferenceData hangoutsMeet creation below
  }

  // 2. Build 30-minute discovery call start/end in WAT (+01:00)
  const startDate = new Date(`${payload.date}T${payload.timeSlot}:00+01:00`);
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  const summary = `Pulzitive Discovery Call — ${payload.organization || payload.name}`;
  const descriptionLines = [
    `Client: ${payload.name} (${payload.email})`,
    payload.organization ? `Organization: ${payload.organization}` : '',
    `Scope: ${payload.discipline}`,
    payload.budget ? `Target Investment: ${payload.budget}` : '',
    '',
    `Brief Notes:`,
    payload.notes,
    meetUri ? `\nGoogle Meet Room: ${meetUri}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const requestId = `pulzitive-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const eventBody: Record<string, unknown> = {
    summary,
    description: descriptionLines,
    location: meetUri || 'Google Meet',
    start: {
      dateTime: startIso,
      timeZone: 'Africa/Lagos',
    },
    end: {
      dateTime: endIso,
      timeZone: 'Africa/Lagos',
    },
    attendees: [
      { email: payload.email, displayName: payload.name },
      { email: 'salamabiodun01@gmail.com', displayName: 'Salami Abiodun (Pulzitive)' },
    ],
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: true,
    },
  };

  const calRes = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    }
  );

  if (!calRes.ok) {
    const errText = await calRes.text();
    throw new Error(`Failed to schedule Google Calendar event (${calRes.status}): ${errText}`);
  }

  const createdEvent = await calRes.json();
  const finalMeetLink =
    meetUri ||
    createdEvent.hangoutLink ||
    createdEvent.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === 'video'
    )?.uri ||
    '';

  return {
    eventId: createdEvent.id,
    calendarLink: createdEvent.htmlLink,
    meetLink: finalMeetLink,
    meetCode: meetCode || createdEvent.conferenceData?.conferenceId,
    startIso,
    endIso,
  };
}

export interface CohortEnrollmentPayload {
  name: string;
  email: string;
  trackTitle: string;
  cohortFormat: 'studio' | 'executive';
  formatLabel: string;
  cadence: string;
  tuition: string;
  startDateIso: string; // YYYY-MM-DD
  startTimeWat: string; // HH:mm
  portfolioUrl?: string;
  goals: string;
}

export interface CohortEnrollmentResult {
  eventId: string;
  calendarLink: string;
  meetLink: string;
  meetCode?: string;
  startIso: string;
  endIso: string;
}

export async function joinCohortWithCalendarAndMeet(
  accessToken: string,
  payload: CohortEnrollmentPayload
): Promise<CohortEnrollmentResult> {
  // 1. Create a Google Meet space via Meet v2 API
  let meetUri = '';
  let meetCode = '';
  try {
    const meetRes = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (meetRes.ok) {
      const meetData = await meetRes.json();
      meetUri = meetData.meetingUri || '';
      meetCode = meetData.meetingCode || '';
    }
  } catch {
    // Fallback to Calendar conferenceData hangoutsMeet creation below
  }

  // 2. Build 90-minute Cohort 06 Kickoff & Orientation session in WAT (+01:00)
  const startDate = new Date(
    `${payload.startDateIso}T${payload.startTimeWat}:00+01:00`
  );
  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);
  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  const summary = `Pulzitive Academy Cohort 06 Kickoff — ${payload.trackTitle}`;
  const descriptionLines = [
    `Fellow: ${payload.name} (${payload.email})`,
    `Track: ${payload.trackTitle}`,
    `Format: ${payload.formatLabel} (${payload.cadence})`,
    `Cohort Tuition: ${payload.tuition}`,
    payload.portfolioUrl ? `Portfolio / Work Sample: ${payload.portfolioUrl}` : '',
    '',
    `Creative Goals:`,
    payload.goals,
    meetUri ? `\nCohort Google Meet Room: ${meetUri}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const requestId = `pulzitive-cohort-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const eventBody: Record<string, unknown> = {
    summary,
    description: descriptionLines,
    location: meetUri || 'Google Meet',
    start: {
      dateTime: startIso,
      timeZone: 'Africa/Lagos',
    },
    end: {
      dateTime: endIso,
      timeZone: 'Africa/Lagos',
    },
    attendees: [
      { email: payload.email, displayName: payload.name },
      { email: 'salamabiodun01@gmail.com', displayName: 'Salami Abiodun (Pulzitive Academy)' },
    ],
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: true,
    },
  };

  const calRes = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    }
  );

  if (!calRes.ok) {
    const errText = await calRes.text();
    throw new Error(
      `Failed to schedule Cohort 06 Google Calendar event (${calRes.status}): ${errText}`
    );
  }

  const createdEvent = await calRes.json();
  const finalMeetLink =
    meetUri ||
    createdEvent.hangoutLink ||
    createdEvent.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === 'video'
    )?.uri ||
    '';

  return {
    eventId: createdEvent.id,
    calendarLink: createdEvent.htmlLink,
    meetLink: finalMeetLink,
    meetCode: meetCode || createdEvent.conferenceData?.conferenceId,
    startIso,
    endIso,
  };
}

