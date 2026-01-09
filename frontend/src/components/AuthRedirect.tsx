'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthRedirect({
  authedTo = '/profile',
  unauthedTo = '/login',
}: {
  authedTo?: string;
  unauthedTo?: string;
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isAuthenticated ? authedTo : unauthedTo);
  }, [isLoading, isAuthenticated, router, authedTo, unauthedTo]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );
}
