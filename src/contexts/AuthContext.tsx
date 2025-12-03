import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types';

// Bootstrap admin credentials
const BOOTSTRAP_ADMIN_EMAIL = 'admin@dts.com';
const BOOTSTRAP_ADMIN_PASSWORD = 'admin@123';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      // Check if admin first
      const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
      if (adminDoc.exists()) {
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: 'admin',
          name: adminDoc.data().name || 'Admin',
        };
      }
      
      // Check if gem - now using the firebaseUser.uid as the document ID
      const gemDoc = await getDoc(doc(db, 'gems', firebaseUser.uid));
      if (gemDoc.exists()) {
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: 'gem',
          name: gemDoc.data().name || 'Gem',
        };
      }
      
      // If not found in admins or gems, return null
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      let userCredential;
      
      // Check if this is the bootstrap admin trying to login
      if (email === BOOTSTRAP_ADMIN_EMAIL && password === BOOTSTRAP_ADMIN_PASSWORD) {
        try {
          // Try to sign in first
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (signInError: any) {
          // If user doesn't exist, create the bootstrap admin
          if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
            // Create the admin user in Firebase Auth
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Create admin document in Firestore
            await setDoc(doc(db, 'admins', userCredential.user.uid), {
              name: 'Admin',
              email: email,
              role: 'admin',
              createdAt: Timestamp.now(),
            });
          } else {
            throw signInError;
          }
        }
        
        // Ensure admin document exists (in case user was created but document wasn't)
        const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
        if (!adminDoc.exists()) {
          await setDoc(doc(db, 'admins', userCredential.user.uid), {
            name: 'Admin',
            email: email,
            role: 'admin',
            createdAt: Timestamp.now(),
          });
        }
        
        const adminUser: User = {
          id: userCredential.user.uid,
          email: email,
          role: 'admin',
          name: 'Admin',
        };
        
        setUser(adminUser);
        return adminUser;
      }
      
      // Regular login flow for other users
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(userCredential.user);
      
      if (!userData) {
        // Sign out if user is not registered in our system
        await signOut(auth);
        throw new Error('User not found. Please contact administrator.');
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
