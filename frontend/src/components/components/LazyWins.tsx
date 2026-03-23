'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading skeleton for Wins section
const WinsSkeleton = () => (
  <section className="py-20 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4">
      <div className="h-8 w-64 bg-dark-400 rounded mx-auto mb-8 animate-pulse" />
      <div className="flex space-x-6 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-72 h-48 bg-dark-400 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

// Lazy load the Wins component (heavy with videos)
const Wins = dynamic(() => import('@/components/Wins'), {
  loading: () => <WinsSkeleton />,
  ssr: false, // Disable SSR for video-heavy component
});

export default function LazyWins() {
  return (
    <Suspense fallback={<WinsSkeleton />}>
      <Wins />
    </Suspense>
  );
}
