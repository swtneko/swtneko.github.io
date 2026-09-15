import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { AuthUser, ReadingResult, FollowUpMessage, SystemSettings, DeckType } from '../types';

export const SUPER_ADMIN_EMAILS = ['nekyohotaru@gmail.com'];

export const isSuperAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase().trim());
};

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use specified databaseId or default
const dbId = (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, dbId);

// Test connection as required by skill guidelines
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error?.message && error.message.includes('the client is offline')) {
      console.warn('Firestore offline status:', error);
    }
  }
}
testFirestoreConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const googleProvider = new GoogleAuthProvider();

export const mapFirebaseUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  const isAdmin = isSuperAdminEmail(user.email);
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || (user.isAnonymous ? `Khách vãng lai #${user.uid.slice(0, 4).toUpperCase()}` : (isAdmin ? 'Quản Trị Viên' : 'Người tìm kiếm')),
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    role: isAdmin ? 'admin' : 'user',
    isAdmin,
  };
};

export const signInWithGoogle = async (): Promise<AuthUser> => {
  const result = await signInWithPopup(auth, googleProvider);
  return mapFirebaseUser(result.user)!;
};

export const signInWithEmail = async (email: string, pass: string): Promise<AuthUser> => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return mapFirebaseUser(result.user)!;
};

export const signUpWithEmail = async (email: string, pass: string, name: string): Promise<AuthUser> => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (name.trim()) {
    await updateProfile(result.user, { displayName: name.trim() });
  }
  return mapFirebaseUser(result.user)!;
};

export const signInGuest = async (): Promise<AuthUser> => {
  const result = await signInAnonymously(auth);
  return mapFirebaseUser(result.user)!;
};

export const logOut = async (): Promise<void> => {
  await signOut(auth);
  localStorage.removeItem('celestial-synced-user');
};

export const syncUserProfile = async (authUser: AuthUser): Promise<AuthUser> => {
  try {
    const userRef = doc(db, 'users', authUser.uid);
    const snap = await getDoc(userRef);
    
    if (snap.exists()) {
      const existingData = snap.data();
      const synced = {
        ...authUser,
        assignedProvider: existingData.assignedProvider || 'openrouter',
        assignedModel: existingData.assignedModel || 'auto',
        role: existingData.role || authUser.role || 'user',
        isAdmin: (existingData.role === 'admin') || authUser.isAdmin,
        createdAt: existingData.createdAt,
      };
      localStorage.setItem('celestial-synced-user', JSON.stringify(synced));
      return synced;
    } else {
      const newProfile = {
        id: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        photoURL: authUser.photoURL,
        createdAt: new Date().toISOString(),
        assignedProvider: 'openrouter', // Default to openrouter for new users as requested
        assignedModel: 'auto',
        role: authUser.role || 'user',
      };
      await setDoc(userRef, newProfile);
      
      const synced = {
        ...authUser,
        assignedProvider: 'openrouter',
        assignedModel: 'auto',
        createdAt: newProfile.createdAt,
      };
      localStorage.setItem('celestial-synced-user', JSON.stringify(synced));
      return synced;
    }
  } catch (e) {
    console.error('Lỗi khi đồng bộ UserProfile:', e);
    return authUser;
  }
};

export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    const usersColl = collection(db, 'users');
    const snap = await getDocs(usersColl);
    const usersList: AuthUser[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      usersList.push({
        uid: doc.id,
        email: data.email || null,
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        isAnonymous: false,
        role: data.role || 'user',
        isAdmin: data.role === 'admin',
        assignedProvider: data.assignedProvider || 'openrouter',
        assignedModel: data.assignedModel || 'auto',
        createdAt: data.createdAt,
      });
    });
    return usersList;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'users');
    return [];
  }
};

export const deleteUserAccount = async (userId: string): Promise<void> => {
  try {
    // 1. Delete user readings
    const readingsColl = collection(db, 'users', userId, 'readings');
    const snap = await getDocs(readingsColl);
    const promises: Promise<void>[] = [];
    snap.forEach((doc) => {
      promises.push(deleteDoc(doc.ref));
    });
    await Promise.all(promises);

    // 2. Delete user profile
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
  }
};

export const updateUserAIModel = async (
  userId: string,
  provider: string,
  model: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        assignedProvider: provider,
        assignedModel: model,
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
};

export const subscribeToAuth = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const mapped = mapFirebaseUser(user)!;
      const synced = await syncUserProfile(mapped);
      callback(synced);
    } else {
      callback(null);
    }
  });
};

// Storage keys
const GUEST_READINGS_KEY = 'celestial-guest-readings';
const getUserCacheKey = (uid: string) => `celestial-user-cache-${uid}`;

export const getGuestReadings = (): ReadingResult[] => {
  try {
    const raw = localStorage.getItem(GUEST_READINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse guest readings', e);
    return [];
  }
};

export const saveGuestReading = (reading: ReadingResult): void => {
  try {
    const readings = getGuestReadings().filter(r => r.id !== reading.id);
    readings.unshift(reading);
    localStorage.setItem(GUEST_READINGS_KEY, JSON.stringify(readings.slice(0, 30)));
  } catch (e) {
    console.error('Failed to save guest reading', e);
  }
};

export const deleteGuestReading = (id: string): void => {
  try {
    const readings = getGuestReadings().filter(r => r.id !== id);
    localStorage.setItem(GUEST_READINGS_KEY, JSON.stringify(readings));
  } catch (e) {
    console.error('Failed to delete guest reading', e);
  }
};

export const getUserCacheReadings = (userId: string): ReadingResult[] => {
  try {
    const raw = localStorage.getItem(getUserCacheKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveUserCacheReading = (userId: string, reading: ReadingResult): void => {
  try {
    const readings = getUserCacheReadings(userId).filter(r => r.id !== reading.id);
    readings.unshift(reading);
    localStorage.setItem(getUserCacheKey(userId), JSON.stringify(readings.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save cached user reading', e);
  }
};

// Firestore reading persistence
export const saveReading = async (userId: string | undefined, reading: ReadingResult): Promise<void> => {
  if (!userId || userId === 'guest') {
    // Guest mode: save only to guest storage
    saveGuestReading(reading);
    return;
  }

  // Account mode: save to user local cache and Firestore
  saveUserCacheReading(userId, reading);

  try {
    const readingRef = doc(db, 'users', userId, 'readings', reading.id);
    await setDoc(readingRef, {
      ...reading,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save reading to Firestore, saved to user local cache:', err);
  }
};

export const updateReadingFollowUps = async (
  userId: string | undefined,
  readingId: string,
  followUps: FollowUpMessage[]
): Promise<void> => {
  if (!userId || userId === 'guest') {
    const local = getGuestReadings();
    const found = local.find(r => r.id === readingId);
    if (found) {
      found.followUps = followUps;
      localStorage.setItem(GUEST_READINGS_KEY, JSON.stringify(local));
    }
    return;
  }

  // Update user local cache
  const userCache = getUserCacheReadings(userId);
  const foundInCache = userCache.find(r => r.id === readingId);
  if (foundInCache) {
    foundInCache.followUps = followUps;
    localStorage.setItem(getUserCacheKey(userId), JSON.stringify(userCache));
  }

  try {
    const readingRef = doc(db, 'users', userId, 'readings', readingId);
    await setDoc(readingRef, {
      followUps,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to update follow-ups in Firestore:', err);
  }
};

export const getUserReadings = async (userId?: string): Promise<ReadingResult[]> => {
  if (!userId || userId === 'guest') {
    // Guest mode: only return readings created as a guest (never leakage of account history)
    return getGuestReadings();
  }

  try {
    const readingsColl = collection(db, 'users', userId, 'readings');
    const q = query(readingsColl, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    const cloudReadings: ReadingResult[] = [];
    snapshot.forEach((d) => {
      cloudReadings.push(d.data() as ReadingResult);
    });

    if (cloudReadings.length > 0) {
      localStorage.setItem(getUserCacheKey(userId), JSON.stringify(cloudReadings));
      return cloudReadings;
    }
    return getUserCacheReadings(userId);
  } catch (err) {
    console.warn('Failed to fetch readings from Firestore, returning user cache:', err);
    return getUserCacheReadings(userId);
  }
};

export const deleteUserReading = async (userId: string | undefined, readingId: string): Promise<void> => {
  if (!userId || userId === 'guest') {
    deleteGuestReading(readingId);
    return;
  }

  // Delete from user cache
  try {
    const updated = getUserCacheReadings(userId).filter(r => r.id !== readingId);
    localStorage.setItem(getUserCacheKey(userId), JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }

  try {
    const readingRef = doc(db, 'users', userId, 'readings', readingId);
    await deleteDoc(readingRef);
  } catch (err) {
    console.warn('Failed to delete reading from Firestore:', err);
  }
};

const SYSTEM_SETTINGS_KEY = 'celestial-system-settings';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  announcement: '✨ Chúc bạn một ngày thanh thản và đón nhận những thông điệp tích cực từ các vì sao.',
  announcementActive: false,
  globalAiProvider: 'auto',
  globalAiModel: 'gemini-3.8-flash',
  aiProviderPriority: ['groq', 'gemini', 'deepseek', 'openai', 'openrouter'],
  allowFallback: true,
  enableGuestReadings: true,
  enableClarificationCards: true,
  enableCosmicEffects: true,
  maxGuestReadingsPerDay: 15,
  enabledAiProviders: {
    auto: true,
    gemini: true,
    groq: true,
    deepseek: true,
    openai: true,
    openrouter: true,
  },
  enabledDeckTypes: {
    [DeckType.TAROT]: true,
    [DeckType.PLAYING_CARDS]: true,
  },
  enabledTarotStyles: {
    'rider-waite': true,
    'marseille': true,
    'sola-busca': true,
  },
  customSystemPrompt: '',
  systemApiKeys: {},
  adminEmails: ['nekyohotaru@gmail.com'],
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const docRef = doc(db, 'system', 'settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as SystemSettings;
      localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(data));
      return { ...DEFAULT_SYSTEM_SETTINGS, ...data };
    }
  } catch (err) {
    console.warn('Cannot fetch system settings from Firestore, using cached/default:', err);
  }

  try {
    const cached = localStorage.getItem(SYSTEM_SETTINGS_KEY);
    if (cached) return { ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(cached) };
  } catch (e) {}

  return DEFAULT_SYSTEM_SETTINGS;
};

export const saveSystemSettings = async (
  partial: Partial<SystemSettings>,
  updatedBy: string = 'admin'
): Promise<SystemSettings> => {
  const current = await getSystemSettings();
  const updated: SystemSettings = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(updated));

  try {
    const docRef = doc(db, 'system', 'settings');
    await setDoc(docRef, updated, { merge: true });
  } catch (err) {
    console.warn('Cannot save system settings to Firestore, saved to local cache:', err);
  }

  return updated;
};

export const subscribeToSystemSettings = (callback: (settings: SystemSettings) => void) => {
  try {
    const docRef = doc(db, 'system', 'settings');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as SystemSettings;
          const merged = { ...DEFAULT_SYSTEM_SETTINGS, ...data };
          localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(merged));
          callback(merged);
        } else {
          callback(DEFAULT_SYSTEM_SETTINGS);
        }
      },
      (error) => {
        console.warn('System settings listener error, fallback to local:', error);
        getSystemSettings().then(callback);
      }
    );
  } catch (err) {
    console.warn('Cannot subscribe to system settings, using local:', err);
    getSystemSettings().then(callback);
    return () => {};
  }
};
