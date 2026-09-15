import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if specified
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// App Settings helpers
export interface AppSettings {
  customLogoUrl?: string | null;
  updatedAt?: string;
}

/**
 * Subscribe to real-time changes of global custom logo from Firestore
 */
export function subscribeToLogo(callback: (logoUrl: string | null) => void) {
  const docRef = doc(db, 'settings', 'app');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AppSettings;
        callback(data.customLogoUrl || null);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn('Firestore logo subscription error:', error);
    }
  );
}

/**
 * Save updated custom logo to Firestore
 */
export async function saveLogoToFirestore(logoUrl: string | null): Promise<void> {
  const docRef = doc(db, 'settings', 'app');
  await setDoc(
    docRef,
    {
      customLogoUrl: logoUrl || null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Fetch current logo from Firestore once
 */
export async function fetchLogoFromFirestore(): Promise<string | null> {
  try {
    const docRef = doc(db, 'settings', 'app');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data() as AppSettings;
      return data.customLogoUrl || null;
    }
  } catch (e) {
    console.warn('Failed to fetch logo from Firestore:', e);
  }
  return null;
}

/**
 * Cloud User Accounts Management (Firestore & Local Cache)
 */
export interface CloudUserAccount {
  email: string;
  name: string;
  password?: string;
  createdAt: string;
  lastLoginAt: string;
}

function getLocalAccounts(): Record<string, CloudUserAccount> {
  try {
    const raw = localStorage.getItem('wieszka_registered_accounts');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalAccount(acc: CloudUserAccount) {
  try {
    const accounts = getLocalAccounts();
    accounts[acc.email.toLowerCase().trim()] = acc;
    localStorage.setItem('wieszka_registered_accounts', JSON.stringify(accounts));
  } catch {}
}

export async function checkCloudAccountExists(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail) return false;
  
  const localAccs = getLocalAccounts();
  if (localAccs[cleanEmail]) {
    return true;
  }

  try {
    const userDocRef = doc(db, 'users', cleanEmail);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      saveLocalAccount(snap.data() as CloudUserAccount);
      return true;
    }
  } catch (e) {
    console.warn('Check account existence error:', e);
  }

  return false;
}

export async function registerCloudAccount(
  email: string,
  name: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, message: 'Nieprawidłowy adres e-mail.' };
    }

    const exists = await checkCloudAccountExists(cleanEmail);
    if (exists) {
      return {
        success: false,
        message: 'Konto na ten adres e-mail już istnieje. Zaloguj się lub zresetuj hasło.',
      };
    }

    const newUser: CloudUserAccount = {
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      password,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    saveLocalAccount(newUser);

    const userDocRef = doc(db, 'users', cleanEmail);
    await setDoc(userDocRef, newUser);

    return { success: true };
  } catch (e: any) {
    console.warn('Cloud account registration error:', e);
    return { success: true };
  }
}

export async function loginCloudAccount(
  email: string,
  password: string
): Promise<{ success: boolean; user?: CloudUserAccount; message?: string }> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const localAccs = getLocalAccounts();

    let data: CloudUserAccount | null = localAccs[cleanEmail] || null;

    try {
      const userDocRef = doc(db, 'users', cleanEmail);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        data = snap.data() as CloudUserAccount;
        saveLocalAccount(data);
      }
    } catch (e: any) {
      console.warn('Cloud login check error:', e);
    }

    if (!data) {
      return {
        success: false,
        message: 'Konto o tym adresie e-mail nie istnieje. Zarejestruj się najpierw.',
      };
    }

    if (data.password && data.password !== password) {
      return {
        success: false,
        message: 'Nieprawidłowe hasło. Wprowadź poprawne hasło dla podanego konta.',
      };
    }

    data.lastLoginAt = new Date().toISOString();
    saveLocalAccount(data);

    try {
      const userDocRef = doc(db, 'users', cleanEmail);
      await setDoc(userDocRef, { lastLoginAt: data.lastLoginAt }, { merge: true });
    } catch (e) {}

    return { success: true, user: data };
  } catch (e: any) {
    console.warn('Cloud login check error:', e);
    return {
      success: false,
      message: 'Wystąpił błąd podczas logowania. Spróbuj ponownie.',
    };
  }
}

export async function resetCloudAccountPassword(
  email: string,
  newPassword: string
): Promise<boolean> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const localAccs = getLocalAccounts();
    if (localAccs[cleanEmail]) {
      localAccs[cleanEmail].password = newPassword;
      localAccs[cleanEmail].lastLoginAt = new Date().toISOString();
      localStorage.setItem('wieszka_registered_accounts', JSON.stringify(localAccs));
    }

    const userDocRef = doc(db, 'users', cleanEmail);
    await setDoc(
      userDocRef,
      {
        password: newPassword,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.warn('Cloud password reset error:', e);
    return true;
  }
}

/**
 * Delete all saved cloud accounts from Firestore and clear local cached profiles.
 */
export async function clearAllCloudAccounts(): Promise<{ success: boolean; count: number }> {
  let count = 0;
  try {
    const usersColRef = collection(db, 'users');
    const snap = await getDocs(usersColRef);
    count = snap.size;
    const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (e) {
    console.warn('Error deleting cloud accounts from Firestore:', e);
  }

  try {
    localStorage.removeItem('wieszka_registered_accounts');
    localStorage.removeItem('wieszka_user_profile');
    sessionStorage.removeItem('wieszka_user_profile');
  } catch (e) {}

  return { success: true, count };
}

/**
 * Real-time subscription to total registered users count and users list for Admin
 */
export function subscribeToUserCount(callback: (count: number, usersList: CloudUserAccount[]) => void) {
  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const usersList: CloudUserAccount[] = snapshot.docs.map((docSnap) => docSnap.data() as CloudUserAccount);
      callback(snapshot.size, usersList);
    },
    (error) => {
      console.warn('Firestore user count subscription error:', error);
      try {
        const raw = localStorage.getItem('wieszka_registered_accounts');
        const accs = raw ? JSON.parse(raw) : {};
        const list = Object.values(accs) as CloudUserAccount[];
        callback(list.length, list);
      } catch {
        callback(0, []);
      }
    }
  );
}

