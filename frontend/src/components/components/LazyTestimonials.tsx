'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading skeleton for Testimonials
const TestimonialsSkeleton = () => (
  <section className="py-20 relative bg-dark-300/30">
    <div className="max-w-7xl mx-auto px-4">
      <div className="h-8 w-48 bg-dark-400 rounded mx-auto mb-8 animate-pulse" />
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-dark-400 rounded-xl h-64 animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

// Lazy load Testimonials (below the fold)
const Testimonials = dynamic(() => import('@/components/Testimonials'), {
  loading: () => <TestimonialsSkeleton />,
});

export default function LazyTestimonials() {
  return (
    <Suspense fallback={<TestimonialsSkeleton />}>
      <Testimonials />
    </Suspense>
  );
}
