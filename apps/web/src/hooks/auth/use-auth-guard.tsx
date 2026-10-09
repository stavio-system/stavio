'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './use-auth';

export const useAuthGuard = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/register?redirect=/list');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isLoading };
};
