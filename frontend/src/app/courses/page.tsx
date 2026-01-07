import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Users } from 'lucide-react';
import type { Metadata } from 'next';

// SEO metadata
export const metadata: Metadata = {
  title: 'Facebook Automation Courses - Darwin Education',
  description: 'Master Facebook page growth and monetization with our comprehensive organic strategies - no paid ads required.',
  openGraph: {
    title: 'Facebook Automation Courses',
    description: 'Master Facebook page growth and monetization with comprehensive organic strategies.',
  },
};

// ISR: Revalidate every 60 seconds for fresh course data
export const revalidate = 60;

export default function CoursesPage() {

  return (
    <main className="min-h-screen bg-dark-500">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 bg-hero-gradient">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-3 sm:mb-4">
            Facebook Automation <span className="text-gradient">Courses</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Master Facebook page growth and monetization with our comprehensive organic strategies - no paid ads required
          </p>
        </div>
      </section>

      {/* Course Details Section */}
      <section className="py-12 px-4 bg-dark-400/30">
        <div className="max-w-5xl mx-auto">
          {/* What You'll Get */}
          <div className="card">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              What You'll <span className="text-gradient">Get</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Course Module Item */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Understanding Facebook Distribution</h3>
                <p className="text-gray-400 text-sm">How Facebook's algorithm works and how your content gets pushed to the right audience.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Proper Facebook Account</h3>
                <p className="text-gray-400 text-sm">Step-by-step guide to safely creating and setting up a new Facebook account without restrictions.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Choosing the Right Niche</h3>
                <p className="text-gray-400 text-sm">How to pick a profitable niche that fits your skills and has high demand.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">How to Get US Followers & Viewers Organically</h3>
                <p className="text-gray-400 text-sm">Proven strategies to attract U.S.-based audiences without ads.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Best Time to Post & Why It Matters</h3>
                <p className="text-gray-400 text-sm">Learn optimal posting times and how timing affects reach and engagement.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Page Naming Strategy & Video Editing Basics</h3>
                <p className="text-gray-400 text-sm">How to name your page for growth and edit videos that perform well.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">How to Create a Facebook Page & Publish Posts Properly</h3>
                <p className="text-gray-400 text-sm">From page creation to posting the right content the right way.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">How to Grow Followers Organically</h3>
                <p className="text-gray-400 text-sm">No bots, no fake engagement — only real, sustainable growth methods.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">How I Earned 6 Digits Using Photos</h3>
                <p className="text-gray-400 text-sm">Image strategies that convert views into income.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">How to Create Simple Photos Using Canva</h3>
                <p className="text-gray-400 text-sm">Beginner-friendly photo creation that still looks professional.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">How to Create Impressive & Engaging AI Prompts for Images</h3>
                <p className="text-gray-400 text-sm">Crafting prompts that generate high-quality, scroll-stopping visuals.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Free AI Alternatives to ChatGPT Pro</h3>
                <p className="text-gray-400 text-sm">Tools you can use without paying — tested and effective.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Ways to Avoid Spam & Account Restrictions</h3>
                <p className="text-gray-400 text-sm">Safe posting habits to protect your accounts and pages.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">How I Earned 6 Digits Using Facebook Stories</h3>
                <p className="text-gray-400 text-sm">Story strategies that generate daily income.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Sample Edits for Reaction Video Niche</h3>
                <p className="text-gray-400 text-sm">Real examples and editing ideas for reaction content.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Where to Download Content in 1080p Quality</h3>
                <p className="text-gray-400 text-sm">Reliable sources and tools for high-quality content downloads.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">AI Video Generators & Free Usage Strategy</h3>
                <p className="text-gray-400 text-sm">How to use AI video tools strategically without spending money.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Websites That Unlock Paid AI Features</h3>
                <p className="text-gray-400 text-sm">Smart tools that give premium-level features for free.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Ways to Go Viral</h3>
                <p className="text-gray-400 text-sm">Content structures and triggers that increase viral potential.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Scam Awareness & Online Safety</h3>
                <p className="text-gray-400 text-sm">How to avoid scams and protect your accounts and earnings.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">Important Do's and Don'ts</h3>
                <p className="text-gray-400 text-sm">Clear rules to follow so you don't make costly mistakes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
