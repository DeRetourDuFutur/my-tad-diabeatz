'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile } from '../lib/types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createInitialUserProfile = (user: User): UserProfile => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
  isAnonymous: user.isAnonymous,
  providerData: user.providerData,
  role: 'Utilisateur', // Default role
  createdAt: user.metadata.creationTime,
  lastLoginAt: user.metadata.lastSignInTime
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger ou créer le profil utilisateur
  const loadUserProfile = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      setUserProfile(userDoc.data() as UserProfile);
    } else {
      const initialProfile = createInitialUserProfile(user);
      await setDoc(userDocRef, initialProfile);
      setUserProfile(initialProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, data);

    // Mettre à jour le state local
    setUserProfile({ ...userProfile, ...data });

    // Si le displayName est modifié, mettre à jour également le profil Firebase
    if (data.firstName || data.lastName) {
      const newDisplayName = `${data.firstName || userProfile.firstName || ''} ${data.lastName || userProfile.lastName || ''}`.trim();
      // TODO: Implémenter la mise à jour du displayName Firebase si nécessaire
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};