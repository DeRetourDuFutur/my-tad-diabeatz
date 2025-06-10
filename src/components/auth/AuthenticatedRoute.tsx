'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthenticatedRouteProps {
  children: ReactNode;
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.push('/');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (currentUser) {
    return null;
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;