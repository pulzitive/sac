import { FormEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  X,
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { DashboardRoute, usePortalAuth } from '@/src/context/PortalAuthContext';
import { PortalRole } from '@/src/lib/pulzitiveDb';

interface PortalAuthModalProps {
  onNavigateDashboard: (page: DashboardRoute) => void;
}

export function PortalAuthModal({
  onNavigateDashboard,
}: PortalAuthModalProps) {
  const {
    user,
    profile,
    profileLoaded,
    isAdmin,
    authModalOpen,
    authIntentRole,
    pendingTargetPage,
    closeAuthModal,
    signInWithGoogle,
    completeSignUpProfile,
    signOut,
  } = usePortalAuth();

  const [selectedRole, setSelectedRole] = useState<PortalRole>(authIntentRole);
  const [displayName, setDisplayName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedRole(authIntentRole);
  }, [authIntentRole]);

  useEffect(() => {
    if (user) {
      setDisplayName((prev) => prev || user.displayName || '');
    }
  }, [user]);

  useEffect(() => {
    if (!authModalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [authModalOpen, closeAuthModal]);

  // Auto-route once user signs in and already has an existing profile (or is Admin heading to Admin)
  useEffect(() => {
    if (!authModalOpen || !user || !profileLoaded) return;
    if (profile) {
      closeAuthModal();
      const target =
        pendingTargetPage ||
        (isAdmin
          ? 'admin'
          : profile.role === 'student'
          ? 'student'
          : 'client');
      onNavigateDashboard(target);
    } else if (isAdmin && pendingTargetPage === 'admin') {
      closeAuthModal();
      onNavigateDashboard('admin');
    }
  }, [
    authModalOpen,
    user,
    profile,
    profileLoaded,
    isAdmin,
    pendingTargetPage,
    closeAuthModal,
    onNavigateDashboard,
  ]);

  if (!authModalOpen) return null;

  const handleGoogleAuth = async () => {
    setError('');
    setIsBusy(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(
        err?.message ||
          'Google sign-in popup was cancelled or blocked. Please allow popups and try again.'
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleCompleteSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    setError('');
    setIsBusy(true);
    try {
      await completeSignUpProfile({
        role: selectedRole,
        displayName: displayName.trim(),
        organization: organization.trim(),
        phone: phone.trim(),
      });
    } catch (err: any) {
      setError(err?.message || 'Unable to complete sign up. Please retry.');
    } finally {
      setIsBusy(false);
    }
  };

  const needsProfileCompletion = Boolean(user && profileLoaded && !profile);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-auth-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={closeAuthModal}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E5E3DD] bg-[#F8F7F4] p-6 text-[#111113] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E3DD] pb-5">
          <div>
            <p className="text-xs font-medium text-[#A21CAF]">
              Pulzitive Agency Portals · Firebase Cloud Sync
            </p>
            <h2
              id="portal-auth-title"
              className="mt-1 font-display text-2xl font-semibold tracking-tight text-[#111113]"
            >
              {needsProfileCompletion
                ? 'Complete Portal Sign Up'
                : 'Sign In or Sign Up'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close portal authentication modal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E3DD] text-[#52525B] hover:bg-[#111113] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {!user ? (
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-xs font-medium text-[#52525B]">
                Choose your Pulzitive Workspace
              </p>
              <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('client')}
                  className={`rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                    selectedRole === 'client'
                      ? 'border-[#C026D3] bg-white'
                      : 'border-[#E5E3DD] bg-[#F1EFEA] hover:border-[#A1A1AA]'
                  }`}
                >
                  <Briefcase
                    className={`h-5 w-5 ${
                      selectedRole === 'client'
                        ? 'text-[#A21CAF]'
                        : 'text-[#52525B]'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="mt-2 font-display text-base font-semibold text-[#111113]">
                    Client Dashboard
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#52525B]">
                    Book branding &amp; media services and claim your Free Brand
                    Audit.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                    selectedRole === 'student'
                      ? 'border-[#C026D3] bg-white'
                      : 'border-[#E5E3DD] bg-[#F1EFEA] hover:border-[#A1A1AA]'
                  }`}
                >
                  <GraduationCap
                    className={`h-5 w-5 ${
                      selectedRole === 'student'
                        ? 'text-[#A21CAF]'
                        : 'text-[#52525B]'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="mt-2 font-display text-base font-semibold text-[#111113]">
                    Student Dashboard
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#52525B]">
                    Track Academy cohorts, submit capstones &amp; download
                    certificates.
                  </p>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E3DD] bg-white p-5">
              <p className="text-sm font-medium text-[#111113]">
                Continue with verified Google Account
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#52525B]">
                New members complete a 1-step registration right after signing
                in. Returning students, clients, and Admin open their saved
                dashboard automatically.
              </p>
              <div className="mt-4">
                <GoogleSignInButton
                  onClick={handleGoogleAuth}
                  disabled={isBusy}
                  label={
                    isBusy ? 'Authenticating...' : 'Continue with Google'
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#71717A]">
              <ShieldCheck className="h-4 w-4 text-[#A21CAF]" aria-hidden="true" />
              <span>
                Studio Admin access unlocks automatically when signed in as{' '}
                <span className="font-mono text-[#111113]">
                  salamabiodun01@gmail.com
                </span>
                .
              </span>
            </div>
          </div>
        ) : needsProfileCompletion ? (
          <form onSubmit={handleCompleteSignUp} className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-[#E5E3DD] bg-white px-4 py-3 text-xs">
              <div>
                <span className="text-[#52525B]">Signed in as </span>
                <span className="font-mono font-medium text-[#111113]">
                  {user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="font-medium text-[#A21CAF] hover:underline cursor-pointer"
              >
                Switch
              </button>
            </div>

            <div>
              <span className="block text-xs font-medium text-[#52525B]">
                Select Account Type
              </span>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('client')}
                  className={`rounded-lg border px-4 py-2.5 text-xs font-medium cursor-pointer ${
                    selectedRole === 'client'
                      ? 'border-[#C026D3] bg-[#C026D3] text-white'
                      : 'border-[#D4D2CA] bg-white text-[#111113]'
                  }`}
                >
                  Client Account
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`rounded-lg border px-4 py-2.5 text-xs font-medium cursor-pointer ${
                    selectedRole === 'student'
                      ? 'border-[#C026D3] bg-[#C026D3] text-white'
                      : 'border-[#D4D2CA] bg-white text-[#111113]'
                  }`}
                >
                  Student Fellow
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-medium text-[#52525B]"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tunde Bakare"
                className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-white px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="signup-org"
                  className="block text-xs font-medium text-[#52525B]"
                >
                  {selectedRole === 'client'
                    ? 'Brand / Company Name'
                    : 'Studio / Discipline'}
                </label>
                <input
                  id="signup-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder={
                    selectedRole === 'client'
                      ? 'Vavadi Horology'
                      : 'Brand Design'
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-white px-3.5 py-2.5 text-sm text-[#111113] focus:border-[#C026D3] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-phone"
                  className="block text-xs font-medium text-[#52525B]"
                >
                  WhatsApp / Phone
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="mt-1.5 w-full rounded-lg border border-[#D4D2CA] bg-white px-3.5 py-2.5 text-sm text-[#111113] tabular-nums focus:border-[#C026D3] focus:outline-none"
                />
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center justify-between rounded-lg border border-[#C026D3]/30 bg-white p-3 text-xs">
                <span className="text-[#111113]">
                  Admin privileges detected for {user.email}.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    onNavigateDashboard('admin');
                  }}
                  className="font-semibold text-[#A21CAF] hover:underline cursor-pointer"
                >
                  Open Admin Console
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="w-full rounded-lg bg-[#C026D3] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A21CAF] disabled:opacity-60 cursor-pointer"
            >
              {isBusy
                ? 'Creating Firestore Profile...'
                : `Create ${
                    selectedRole === 'student' ? 'Student' : 'Client'
                  } Account & Enter Dashboard`}
            </button>
          </form>
        ) : (
          <div className="py-8 text-center text-sm text-[#52525B]">
            Loading your Pulzitive workspace...
          </div>
        )}
      </div>
    </div>
  );
}
