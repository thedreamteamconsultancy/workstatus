import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, setDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { db, auth } from '@/lib/firebase';
import { Gem } from '@/types';
import { toast } from '@/hooks/use-toast';

// Create a secondary Firebase app for creating users without signing out the admin
const firebaseConfig = {
  apiKey: "AIzaSyCcDImXrQZLTc529DwWMJdfXUUVWWXeN64",
  authDomain: "workstatus-d9c7b.firebaseapp.com",
  projectId: "workstatus-d9c7b",
  storageBucket: "workstatus-d9c7b.firebasestorage.app",
  messagingSenderId: "948085345438",
  appId: "1:948085345438:web:637faee9e4fe46273c7f8f",
  measurementId: "G-796WT325L5"
};

// Initialize secondary app for user creation
let secondaryApp: ReturnType<typeof initializeApp> | null = null;
const getSecondaryAuth = () => {
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
  }
  return getAuth(secondaryApp);
};

export const useGems = () => {
  const [gems, setGems] = useState<Gem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'gems'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gemsData: Gem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as Gem));
      setGems(gemsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching gems:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createGem = async (gemData: Omit<Gem, 'id' | 'createdAt' | 'userId'>) => {
    try {
      // Use secondary auth to create user without signing out the admin
      const secondaryAuth = getSecondaryAuth();
      
      // Create Firebase Auth user for the gem
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        gemData.email,
        gemData.password
      );
      
      const userId = userCredential.user.uid;
      
      // Sign out from secondary auth immediately
      await secondaryAuth.signOut();
      
      // Store gem in Firestore with the auth user's UID as the document ID
      await setDoc(doc(db, 'gems', userId), {
        name: gemData.name,
        phone: gemData.phone,
        email: gemData.email,
        password: gemData.password, // Note: In production, don't store passwords in Firestore
        userId: userId,
        createdAt: Timestamp.now(),
      });
      
      toast({
        title: "Gem Created",
        description: `${gemData.name} has been added successfully. They can now login with their email and password.`,
      });
      
      return userId;
    } catch (error: any) {
      let errorMessage = "Failed to create gem";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please use a different email.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateGem = async (id: string, data: Partial<Gem>) => {
    try {
      await updateDoc(doc(db, 'gems', id), data);
      toast({
        title: "Gem Updated",
        description: "Gem information has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update gem",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteGem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gems', id));
      toast({
        title: "Gem Deleted",
        description: "Gem has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete gem",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { gems, loading, createGem, updateGem, deleteGem };
};
