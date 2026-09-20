import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, ReadingResult, FollowUpMessage, SystemSettings } from '../types';
import {
  subscribeToAuth,
  signInWithGoogle as fbSignInWithGoogle,
  signInWithEmail as fbSignInWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  signInGuest as fbSignInGuest,
  logOut as fbLogOut,
  getUserReadings,
  saveReading,
  updateReadingFollowUps,
  deleteUserReading,
  migrateGuestReadingsToUser,
  getSystemSettings,
  saveSystemSettings as fbSaveSystemSettings,
  subscribeToSystemSettings,
  DEFAULT_SYSTEM_SETTINGS,
  isSuperAdminEmail,
} from '../services/firebase';

interface AuthContextType {
  currentUser: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInGuest: () => Promise<void>;
  logout: () => Promise<void>;
  readings: ReadingResult[];
  refreshReadings: () => Promise<void>;
  saveNewReading: (reading: ReadingResult) => Promise<void>;
  updateFollowUps: (readingId: string, followUps: FollowUpMessage[]) => Promise<void>;
  deleteReading: (readingId: string) => Promise<void>;
  systemSettings: SystemSettings;
  updateSystemSettings: (partial: Partial<SystemSettings>) => Promise<void>;
  activateAdminByPasskey: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [readings, setReadings] = useState<ReadingResult[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [manualAdminUnlocked, setManualAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('celestial-admin-unlocked') === 'true';
  });

  const isAdmin = Boolean(
    currentUser?.isAdmin ||
    isSuperAdminEmail(currentUser?.email) ||
    manualAdminUnlocked
  );

  useEffect(() => {
    const unsubscribeSys = subscribeToSystemSettings((settings) => {
      setSystemSettings(settings);
    });
    return () => unsubscribeSys();
  }, []);

  const refreshReadings = useCallback(async () => {
    try {
      const list = await getUserReadings(currentUser?.uid);
      setReadings(list);
    } catch (e) {
      console.error('Failed to load readings', e);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      if (user && isSuperAdminEmail(user.email)) {
        user.isAdmin = true;
        user.role = 'admin';
      }
      if (!user && localStorage.getItem('celestial-admin-unlocked') === 'true') {
        const localAdmin: AuthUser = {
          uid: 'admin_local',
          email: 'nekyohotaru@gmail.com',
          displayName: 'Quản Trị Viên (nekyohotaru)',
          photoURL: null,
          isAnonymous: false,
          role: 'admin',
          isAdmin: true,
        };
        setCurrentUser(localAdmin);
      } else {
        setCurrentUser(user);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      refreshReadings();
    }
  }, [currentUser, loading, refreshReadings]);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openAdminModal = () => setIsAdminModalOpen(true);
  const closeAdminModal = () => setIsAdminModalOpen(false);

  const activateAdminByPasskey = (code: string): boolean => {
    // Admin passkey for the owner (nekyohotaru or secret key)
    if (code.trim() === 'admin888' || code.trim().toLowerCase() === 'nekyohotaru') {
      setManualAdminUnlocked(true);
      localStorage.setItem('celestial-admin-unlocked', 'true');
      if (currentUser) {
        setCurrentUser({ ...currentUser, isAdmin: true, role: 'admin' });
      } else {
        const localAdmin: AuthUser = {
          uid: 'admin_local',
          email: 'nekyohotaru@gmail.com',
          displayName: 'Quản Trị Viên (nekyohotaru)',
          photoURL: null,
          isAnonymous: false,
          role: 'admin',
          isAdmin: true,
        };
        setCurrentUser(localAdmin);
      }
      return true;
    }
    return false;
  };

  const signInWithGoogle = async () => {
    const user = await fbSignInWithGoogle();
    if (isSuperAdminEmail(user.email)) {
      user.isAdmin = true;
      user.role = 'admin';
    }
    setCurrentUser(user);
    closeAuthModal();
    await migrateGuestReadingsToUser(user.uid);
    await refreshReadings();
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const user = await fbSignInWithEmail(email, pass);
    if (isSuperAdminEmail(user.email)) {
      user.isAdmin = true;
      user.role = 'admin';
    }
    setCurrentUser(user);
    closeAuthModal();
    await migrateGuestReadingsToUser(user.uid);
    await refreshReadings();
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const user = await fbSignUpWithEmail(email, pass, name);
    if (isSuperAdminEmail(user.email)) {
      user.isAdmin = true;
      user.role = 'admin';
    }
    setCurrentUser(user);
    closeAuthModal();
    await migrateGuestReadingsToUser(user.uid);
    await refreshReadings();
  };

  const signInGuest = async () => {
    const user = await fbSignInGuest();
    setCurrentUser(user);
    closeAuthModal();
    refreshReadings();
  };

  const logout = async () => {
    try {
      await fbLogOut();
    } catch (e) {
      console.warn('Firebase logout warning', e);
    }
    setCurrentUser(null);
    setManualAdminUnlocked(false);
    localStorage.removeItem('celestial-admin-unlocked');
    setReadings([]); // Clear any account readings instantly
    try {
      const guestList = await getUserReadings(undefined);
      setReadings(guestList);
    } catch (e) {
      setReadings([]);
    }
  };

  const saveNewReading = async (reading: ReadingResult) => {
    const uid = currentUser?.uid || 'guest';
    const updatedReading = { ...reading, userId: uid };
    await saveReading(uid, updatedReading);
    setReadings((prev) => [updatedReading, ...prev.filter((r) => r.id !== updatedReading.id)]);
  };

  const updateFollowUps = async (readingId: string, followUps: FollowUpMessage[]) => {
    const uid = currentUser?.uid || 'guest';
    await updateReadingFollowUps(uid, readingId, followUps);
    setReadings((prev) =>
      prev.map((r) => (r.id === readingId ? { ...r, followUps } : r))
    );
  };

  const deleteReading = async (readingId: string) => {
    await deleteUserReading(currentUser?.uid, readingId);
    setReadings((prev) => prev.filter((r) => r.id !== readingId));
  };

  const updateSystemSettings = async (partial: Partial<SystemSettings>) => {
    const updated = await fbSaveSystemSettings(partial, currentUser?.email || 'admin');
    setSystemSettings(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isAdminModalOpen,
        openAdminModal,
        closeAdminModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInGuest,
        logout,
        readings,
        refreshReadings,
        saveNewReading,
        updateFollowUps,
        deleteReading,
        systemSettings,
        updateSystemSettings,
        activateAdminByPasskey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
