import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: any | null; // Keeping signature
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (currentUser: User) => {
    try {
      // Fetch profile
      const userDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
      if (userDoc.exists()) {
        setProfile({ id: currentUser.uid, email: currentUser.email!, ...userDoc.data() } as Profile);
      } else {
        // Create basic profile if doesn't exist
        const newProfile = { email: currentUser.email!, full_name: currentUser.displayName, avatar_url: currentUser.photoURL };
        await setDoc(doc(db, 'profiles', currentUser.uid), newProfile, { merge: true });
        setProfile({ id: currentUser.uid, ...newProfile });
      }

      // Check admin role
      const roleDoc = await getDoc(doc(db, 'user_roles', currentUser.uid));
      setIsAdmin(roleDoc.exists() && roleDoc.data().role === 'admin' || currentUser.email === 'admin@proagrisa.co.za');
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) {
        await updateProfile(cred.user, { displayName: fullName });
      }
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session: user ? { user } : null,
      profile,
      isAdmin,
      isLoading,
      signIn,
      signUp,
      signOut: signOutUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
