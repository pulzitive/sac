import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import {
  ActivityCategory,
  createUserProfile,
  ensureAdminRecord,
  isUserBootstrappedAdmin,
  logActivity,
  PortalRole,
  signInWithGooglePortal,
  signOutPortal,
  subscribeIsAdminDoc,
  subscribeUserProfile,
  UserProfile,
} from '@/src/lib/pulzitiveDb';

export type DashboardRoute = 'student' | 'client' | 'admin';

interface PortalAuthContextValue {
  authReady: boolean;
  user: User | null;
  profile: UserProfile | null;
  profileLoaded: boolean;
  isAdmin: boolean;
  authModalOpen: boolean;
  authIntentRole: PortalRole;
  pendingTargetPage: DashboardRoute | null;
  openAuthModal: (
    intentRole?: PortalRole,
    targetPage?: DashboardRoute | null
  ) => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<User>;
  completeSignUpProfile: (input: {
    role: PortalRole;
    displayName: string;
    organization: string;
    phone: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  recordActivity: (
    category: ActivityCategory,
    action: string,
    details: string
  ) => Promise<void>;
}

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null);

export function PortalAuthProvider({
  children,
  onNavigateDashboard,
}: {
  children: ReactNode;
  onNavigateDashboard: (page: DashboardRoute) => void;
}) {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [hasAdminDoc, setHasAdminDoc] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authIntentRole, setAuthIntentRole] = useState<PortalRole>('client');
  const [pendingTargetPage, setPendingTargetPage] =
    useState<DashboardRoute | null>(null);

  const isAdmin = isUserBootstrappedAdmin(user) || hasAdminDoc;

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (!firebaseUser) {
        setProfile(null);
        setProfileLoaded(true);
        setHasAdminDoc(false);
      } else {
        setProfileLoaded(false);
        if (isUserBootstrappedAdmin(firebaseUser)) {
          void ensureAdminRecord(firebaseUser);
        }
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    const unsubProfile = subscribeUserProfile(
      user.uid,
      (p) => {
        setProfile(p);
        setProfileLoaded(true);
      },
      () => {
        setProfileLoaded(true);
      }
    );
    const unsubAdmin = subscribeIsAdminDoc(user.uid, (flag) => {
      setHasAdminDoc(flag);
    });
    return () => {
      unsubProfile();
      unsubAdmin();
    };
  }, [authReady, user]);

  const openAuthModal = useCallback(
    (intentRole: PortalRole = 'client', targetPage: DashboardRoute | null = null) => {
      setAuthIntentRole(intentRole);
      setPendingTargetPage(targetPage);
      setAuthModalOpen(true);
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const signedInUser = await signInWithGooglePortal();
    return signedInUser;
  }, []);

  const completeSignUpProfile = useCallback(
    async (input: {
      role: PortalRole;
      displayName: string;
      organization: string;
      phone: string;
    }) => {
      if (!auth.currentUser) {
        throw new Error('Please sign in with Google first.');
      }
      const u = auth.currentUser;
      await createUserProfile(u.uid, {
        role: input.role,
        displayName: input.displayName,
        email: u.email || '',
        organization: input.organization,
        phone: input.phone,
      });
      await logActivity({
        actorUid: u.uid,
        actorName: input.displayName,
        actorEmail: u.email || '',
        actorRole: input.role,
        category: 'auth',
        action: `Registered ${input.role === 'student' ? 'Student' : 'Client'} Account`,
        details: `${input.organization || 'Individual'} joined Pulzitive ${input.role} portal.`,
      });

      setAuthModalOpen(false);
      const nextTarget =
        pendingTargetPage || (input.role === 'student' ? 'student' : 'client');
      setPendingTargetPage(null);
      onNavigateDashboard(nextTarget);
    },
    [onNavigateDashboard, pendingTargetPage]
  );

  const signOut = useCallback(async () => {
    await signOutPortal();
    setProfile(null);
    setHasAdminDoc(false);
    setAuthModalOpen(false);
  }, []);

  const recordActivity = useCallback(
    async (category: ActivityCategory, action: string, details: string) => {
      if (!auth.currentUser) return;
      const u = auth.currentUser;
      const role: 'student' | 'client' | 'admin' = isUserBootstrappedAdmin(u) || hasAdminDoc
        ? 'admin'
        : profile?.role || 'client';
      await logActivity({
        actorUid: u.uid,
        actorName: profile?.displayName || u.displayName || 'Pulzitive Member',
        actorEmail: u.email || '',
        actorRole: role,
        category,
        action,
        details,
      });
    },
    [hasAdminDoc, profile]
  );

  return (
    <PortalAuthContext.Provider
      value={{
        authReady,
        user,
        profile,
        profileLoaded,
        isAdmin,
        authModalOpen,
        authIntentRole,
        pendingTargetPage,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        completeSignUpProfile,
        signOut,
        recordActivity,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth(): PortalAuthContextValue {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) {
    throw new Error('usePortalAuth must be used inside PortalAuthProvider');
  }
  return ctx;
}
