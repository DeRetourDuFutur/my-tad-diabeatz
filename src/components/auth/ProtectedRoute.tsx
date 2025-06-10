"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    // Vous pouvez afficher un spinner de chargement ici si vous le souhaitez
    return <p>Chargement...</p>;
  }

  if (!currentUser) {
    // Redirection déjà gérée dans useEffect, mais cela empêche le rendu des enfants
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;