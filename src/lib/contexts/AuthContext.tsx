"use client";

import React, { createContext, useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from "firebase/auth";
import { User } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (userType: 'student' | 'company') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {
    console.log('Setting up auth state listener')
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user?.email)
      
      if (user) {
        setUser(user)
        // Get user type from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            console.log('User data from Firestore:', userData)
            
            // Route based on user type
            if (userData.userType === 'student') {
              console.log('Routing to student dashboard')
              router.push('/dashboard/student')
            } else if (userData.userType === 'company') {
              console.log('Routing to company dashboard')
              router.push('/dashboard/company')
            }
          }
        } catch (error) {
          console.error('Error getting user data:', error)
        }
      } else {
        setUser(null)
        console.log('No user, routing to home')
        router.push('/')
      }
      
      setLoading(false)
    });

    return () => unsubscribe();
  }, [router]);

  const signInWithGoogle = async (userType: 'student' | 'company') => {
    console.log('Starting Google sign in with user type:', userType)
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Sign in successful:', result.user.email)
      
      // Save user data to Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        console.log('Creating new user document')
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          userType: userType,
          createdAt: new Date(),
          profile: userType === 'student' 
            ? { skills: [] } 
            : { companyName: '', industry: '', companySize: '', description: '', location: '' }
        });
      }
    } catch (error) {
      console.error('Error in signInWithGoogle:', error)
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error)
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
