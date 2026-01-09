'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function EnrollPage() {
  const router = useRouter();

  useEffect(() => {
    // If anything still navigates here, send users to Profile.
    const t = setTimeout(() => router.replace('/profile'), 800);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="min-h-screen bg-dark-500">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card p-6 sm:p-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
              Enrollment Disabled
            </h1>
            <p className="text-sm sm:text-base text-gray-400 mb-6">
              Course access is now handled by admin approval/unlock after you login.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/profile" className="btn-primary inline-block text-sm sm:text-base">
                Go to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
