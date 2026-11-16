import { FormEvent, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  Video,
} from 'lucide-react';
import {
  CalendarBusySlot,
  createDiscoveryCallWithMeet,
  DiscoveryBookingResult,
  fetchBusySlotsForDate,
  getAccessToken,
  getCurrentUser,
  googleSignIn,
  initAuth,
  logoutGoogle,
} from '@/src/lib/googleWorkspace';
import { GoogleSignInButton } from './GoogleSignInButton';
import { usePortalAuth } from '@/src/context/PortalAuthContext';

interface DiscoveryCallSchedulerProps {
  initialSubject?: string;
  compact?: boolean;
  onSuccessClose?: () => void;
}

const TIME_SLOTS = ['09:30', '10:30', '12:00', '14:00', '15:30', '16:30'];

function getDefaultBookingDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

export function DiscoveryCallScheduler({
  initialSubject = '',
  compact = false,
  onSuccessClose,
}: DiscoveryCallSchedulerProps) {
  const { recordActivity } = usePortalAuth();
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getDefaultBookingDate()
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('10:30');
  const [busySlots, setBusySlots] = useState<CalendarBusySlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [discipline, setDiscipline] = useState('Brand Identity & Systems');
  const [budget, setBudget] = useState('₦750,000 – ₦1,750,000');
  const [notes, setNotes] = useState('');

  const [formError, setFormError] = useState('');
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResult, setBookingResult] =
    useState<DiscoveryBookingResult | null>(null);
  const [copiedMeet, setCopiedMeet] = useState(false);

  useEffect(() => {
    if (initialSubject) {
      setNotes(`Inspired by: ${initialSubject}\n`);
    }
  }, [initialSubject]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, accessToken) => {
        setUser(authUser);
        setToken(accessToken);
        setName((prev) => prev || authUser.displayName || '');
        setEmail((prev) => prev || authUser.email || '');
      },
      () => {
        setToken(getAccessToken());
        setUser(getCurrentUser());
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!token || !selectedDate) return;
    let cancelled = false;
    setLoadingAvailability(true);
    setAvailabilityError('');

    fetchBusySlotsForDate(token, selectedDate)
      .then((slots) => {
        if (!cancelled) {
          setBusySlots(slots);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAvailabilityError(
            err instanceof Error
              ? err.message
              : 'Could not read calendar availability.'
          );
          setBusySlots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAvailability(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, selectedDate]);

  const isSlotBusy = (slot: string): boolean => {
    if (busySlots.length === 0) return false;
    const slotStart = new Date(`${selectedDate}T${slot}:00+01:00`).getTime();
    const slotEnd = slotStart + 30 * 60 * 1000;
    return busySlots.some((b) => {
      const bStart = new Date(b.start).getTime();
      const bEnd = new Date(b.end).getTime();
      return slotStart < bEnd && slotEnd > bStart;
    });
  };

  const handleGoogleConnect = async () => {
    setFormError('');
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      setUser(res.user);
      setToken(res.accessToken);
      setName((prev) => prev || res.user.displayName || '');
      setEmail((prev) => prev || res.user.email || '');
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
    setBusySlots([]);
    setAwaitingConfirmation(false);
  };

  const handlePreValidate = (e: FormEvent) => {
    e.preventDefault();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!token) {
      setFormError(
        'Please connect your Google account first to book on Google Calendar and generate a Google Meet link.'
      );
      return;
    }
    if (!name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!emailPattern.test(email.trim())) {
      setFormError('Please provide a valid email address for the calendar invite.');
      return;
    }
    if (!selectedDate || !selectedSlot) {
      setFormError('Please select a date and 30-minute discovery slot.');
      return;
    }
    if (isSlotBusy(selectedSlot)) {
      setFormError(
        'That time slot conflicts with an existing calendar event. Please select an open slot.'
      );
      return;
    }
    if (!notes.trim()) {
      setFormError('Please include a brief summary of your project goals.');
      return;
    }

    setFormError('');
    setAwaitingConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    if (!token) {
      setAwaitingConfirmation(false);
      setFormError('Google session expired. Please sign in with Google again.');
      return;
    }

    setIsBooking(true);
    setFormError('');
    try {
      const result = await createDiscoveryCallWithMeet(token, {
        name: name.trim(),
        email: email.trim(),
        organization: organization.trim(),
        discipline,
        budget,
        notes: notes.trim(),
        date: selectedDate,
        timeSlot: selectedSlot,
      });
      setBookingResult(result);
      setAwaitingConfirmation(false);
      void recordActivity(
        'discovery_call',
        `Scheduled Google Meet Discovery Call (${discipline})`,
        `${organization.trim() || name.trim()} · ${selectedDate} at ${selectedSlot} WAT`
      );
    } catch (err: any) {
      setFormError(
        err?.message ||
          'Unable to schedule the Google Calendar event. Please verify permissions and retry.'
      );
      setAwaitingConfirmation(false);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCopyMeet = () => {
    if (!bookingResult?.meetLink) return;
    navigator.clipboard?.writeText(bookingResult.meetLink);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  };

  if (bookingResult) {
    return (
      <div className="rounded-xl border border-[#E5E3DD] bg-[#F8F7F4] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-[#15803D]">
          <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden="true" />
          <h3 className="font-display text-xl font-semibold text-[#111113]">
            Google Meet Discovery Call Scheduled
          </h3>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#52525B]">
          Your 30-minute discovery session has been added to Google Calendar for{' '}
          <span className="font-semibold text-[#111113] tabular-nums">
            {selectedDate} at {selectedSlot} WAT
          </span>{' '}
          with calendar invitations sent to{' '}
          <span className="font-mono text-xs text-[#111113]">{email}</span> and
          Pulzitive Studio.
        </p>

        <div className="mt-5 space-y-3 rounded-xl border border-[#E5E3DD] bg-white p-4">
          {bookingResult.meetLink && (
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#A21CAF]">
                  <Video className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Google Meet Video Room</span>
                </div>
                <p className="mt-0.5 truncate font-mono text-xs text-[#111113]">
                  {bookingResult.meetLink}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyMeet}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4D2CA] px-3 py-1.5 text-xs font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
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
                  href={bookingResult.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#C026D3] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#A21CAF]"
                >
                  <span>Join Meet</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          )}

          {bookingResult.calendarLink && (
            <div className="flex items-center justify-between border-t border-[#F1EFEA] pt-3 text-xs">
              <span className="text-[#52525B]">Google Calendar Event</span>
              <a
                href={bookingResult.calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#A21CAF] hover:underline"
              >
                <span>Open Event in Calendar</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setBookingResult(null);
              setNotes('');
              onSuccessClose?.();
            }}
            className="rounded-lg bg-[#111113] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#A21CAF] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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
                Booking as <span className="font-medium text-[#111113]">{user.email}</span>
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
                Sign in to check live slot availability and generate your Google
                Meet room.
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

      {/* Explicit Confirmation Panel (Required before Calendar/Meet mutation) */}
      {awaitingConfirmation ? (
        <div
          role="alertdialog"
          aria-labelledby="confirm-booking-heading"
          className="rounded-xl border border-[#C026D3]/40 bg-white p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-[#A21CAF]">
            <Calendar className="h-5 w-5 shrink-0" aria-hidden="true" />
            <h3
              id="confirm-booking-heading"
              className="font-display text-lg font-semibold text-[#111113]"
            >
              Confirm Google Calendar &amp; Meet Booking
            </h3>
          </div>

          <p className="text-sm leading-relaxed text-[#52525B]">
            Please confirm you want Pulzitive to create the following event on
            your primary Google Calendar and generate a Google Meet conference
            link:
          </p>

          <div className="rounded-lg border border-[#E5E3DD] bg-[#F8F7F4] p-4 text-xs space-y-1.5 text-[#52525B]">
            <div>
              <span className="font-semibold text-[#111113]">Event:</span>{' '}
              Pulzitive Discovery Call — {organization || name}
            </div>
            <div>
              <span className="font-semibold text-[#111113]">Date &amp; Time:</span>{' '}
              <span className="tabular-nums">
                {selectedDate} · {selectedSlot} WAT (30 mins)
              </span>
            </div>
            <div>
              <span className="font-semibold text-[#111113]">Attendees:</span>{' '}
              {email}, salamabiodun01@gmail.com
            </div>
            <div>
              <span className="font-semibold text-[#111113]">Scope:</span>{' '}
              {discipline} ({budget})
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              disabled={isBooking}
              onClick={handleConfirmBooking}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C026D3] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#A21CAF] disabled:opacity-60 cursor-pointer"
            >
              {isBooking && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              <span>
                {isBooking
                  ? 'Scheduling on Calendar & Meet...'
                  : 'Confirm & Create Event'}
              </span>
            </button>
            <button
              type="button"
              disabled={isBooking}
              onClick={() => setAwaitingConfirmation(false)}
              className="rounded-lg border border-[#D4D2CA] bg-white px-4 py-2.5 text-sm font-medium text-[#111113] hover:border-[#111113] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePreValidate} noValidate className="space-y-4">
          {formError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          {/* Date & Time Slot Selector */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <label
                htmlFor={compact ? 'inline-booking-date' : 'modal-booking-date'}
                className="flex items-center gap-1.5 text-xs font-medium text-[#52525B]"
              >
                <Calendar className="h-3.5 w-3.5 text-[#A21CAF]" aria-hidden="true" />
                <span>Preferred Date</span>
              </label>
              <input
                id={compact ? 'inline-booking-date' : 'modal-booking-date'}
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-white px-3.5 py-2.5 text-sm text-[#111113] tabular-nums focus:border-[#C026D3] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-7">
              <div className="flex items-center justify-between text-xs font-medium text-[#52525B]">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#A21CAF]" aria-hidden="true" />
                  <span>Select 30-Min Slot (WAT)</span>
                </span>
                {loadingAvailability && (
                  <span className="text-[11px] text-[#71717A]">
                    Checking calendar...
                  </span>
                )}
              </div>

              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const busy = isSlotBusy(slot);
                  const active = selectedSlot === slot && !busy;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={busy}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border px-2.5 py-2 text-xs font-medium tabular-nums transition-colors ${
                        busy
                          ? 'border-[#E5E3DD] bg-[#F1EFEA] text-[#A1A1AA] line-through cursor-not-allowed'
                          : active
                          ? 'border-[#C026D3] bg-[#C026D3] text-white cursor-pointer'
                          : 'border-[#D4D2CA] bg-white text-[#111113] hover:border-[#C026D3] cursor-pointer'
                      }`}
                    >
                      {slot} {busy ? '(Busy)' : ''}
                    </button>
                  );
                })}
              </div>
              {availabilityError && (
                <p className="mt-1.5 text-[11px] text-amber-700">
                  {availabilityError}
                </p>
              )}
            </div>
          </div>

          {/* Client Contact Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={compact ? 'inline-name' : 'modal-name'}
                className="block text-xs font-medium text-[#52525B]"
              >
                Full Name
              </label>
              <input
                id={compact ? 'inline-name' : 'modal-name'}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seyi Adeosun"
                className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-white px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor={compact ? 'inline-email' : 'modal-email'}
                className="block text-xs font-medium text-[#52525B]"
              >
                Work Email (For Calendar Invite)
              </label>
              <input
                id={compact ? 'inline-email' : 'modal-email'}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seyi@brand.com"
                className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-white px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:outline-none"
              />
            </div>
          </div>

          {!compact && (
            <div>
              <label
                htmlFor="modal-org"
                className="block text-xs font-medium text-[#52525B]"
              >
                Company / Brand Name
              </label>
              <input
                id="modal-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Vavadi Horology Ltd."
                className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-white px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={compact ? 'inline-discipline' : 'modal-discipline'}
                className="block text-xs font-medium text-[#52525B]"
              >
                Primary Scope
              </label>
              <select
                id={compact ? 'inline-discipline' : 'modal-discipline'}
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-white px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:outline-none"
              >
                <option>Brand Identity &amp; Systems</option>
                <option>Digital Marketing &amp; Campaign Creative</option>
                <option>Media Production &amp; 3D Motion</option>
                <option>Product UI/UX &amp; Web Flagship</option>
                <option>Full-Stack Brand + Launch Retainer</option>
              </select>
            </div>

            <div>
              <label
                htmlFor={compact ? 'inline-budget' : 'modal-budget'}
                className="block text-xs font-medium text-[#52525B]"
              >
                Target Investment
              </label>
              <select
                id={compact ? 'inline-budget' : 'modal-budget'}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-white px-3.5 py-2.5 text-sm text-[#111113] tabular-nums focus:border-[#C026D3] focus:outline-none"
              >
                <option>₦250,000 – ₦750,000</option>
                <option>₦750,000 – ₦1,750,000</option>
                <option>₦1,750,000 – ₦4,000,000</option>
                <option>₦4,000,000+ Enterprise Retainer</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor={compact ? 'inline-notes' : 'modal-notes'}
              className="block text-xs font-medium text-[#52525B]"
            >
              Project Brief &amp; Meeting Agenda
            </label>
            <textarea
              id={compact ? 'inline-notes' : 'modal-notes'}
              rows={compact ? 3 : 3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share deliverables, target launch window, and goals for our Google Meet call..."
              className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-white px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#C026D3] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A21CAF] cursor-pointer"
          >
            <Video className="h-4 w-4" aria-hidden="true" />
            <span>Book Discovery Call with Google Meet</span>
          </button>
        </form>
      )}
    </div>
  );
}
