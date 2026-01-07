import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactContent from '@/components/ContactContent';
import type { Metadata } from 'next';

// Static metadata for SEO
export const metadata: Metadata = {
  title: 'Contact Us - Darwin Education',
  description: 'Have questions about Facebook automation? Get in touch with Darwin Education for support and assistance.',
  openGraph: {
    title: 'Contact Darwin Education',
    description: 'Have questions about Facebook automation? We are here to help you succeed.',
  },
};

// Force static generation
export const dynamic = 'force-static';
export const revalidate = false;

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-dark-500">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-hero-gradient">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have questions about Facebook automation? We&apos;re here to help you succeed
          </p>
        </div>
      </section>

      {/* Contact Section - Client component for interactivity */}
      <ContactContent />

      <Footer />
    </main>
  );
}
