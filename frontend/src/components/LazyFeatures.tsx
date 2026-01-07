'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading skeleton for Features
const FeaturesSkeleton = () => (
  <section className="py-20 relative">
    <div className="max-w-7xl mx-auto px-4">
      <div className="h-8 w-64 bg-dark-400 rounded mx-auto mb-12 animate-pulse" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-dark-400 rounded-xl h-48 animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

// Lazy load Features (below the fold)
const Features = dynamic(() => import('@/components/Features'), {
  loading: () => <FeaturesSkeleton />,
});

export default function LazyFeatures() {
  return (
    <Suspense fallback={<FeaturesSkeleton />}>
      <Features />
    </Suspense>
  );
}
