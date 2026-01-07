import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { Users } from 'lucide-react';
import type { Metadata } from 'next';

// Lazy-loaded components for below-the-fold content
import LazyWins from '@/components/LazyWins';
import LazyFeatures from '@/components/LazyFeatures';

// SEO metadata for home page
export const metadata: Metadata = {
  title: 'Darwin Education - Facebook Automation & Growth Mastery',
  description: 'Master Facebook automation and organic growth strategies. Learn proven methods to grow your audience and monetize your Facebook page without spending on ads.',
  openGraph: {
    title: 'Darwin Education - Facebook Automation Mastery',
    description: 'Master Facebook automation and organic growth strategies.',
  },
};

// Force static generation for maximum CDN caching
export const dynamic = 'force-static';
export const revalidate = false;

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-500">
      <Navbar />
      <Hero />
      
      {/* Lifetime Community Updates & Course Content */}
      <section className="py-12 px-4 bg-dark-400/30">
        <div className="max-w-5xl mx-auto">
          {/* Lifetime Community Updates */}
          <div className="card mb-8">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Lifetime Community Updates</h2>
                <p className="text-gray-300 mb-3">You'll get lifetime access to the community where:</p>
                <ul className="space-y-2 text-gray-400 mb-4">
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>I regularly post new updates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>I add new lessons every time I learn something new</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>The course keeps growing and improving over time</span>
                  </li>
                </ul>
                <p className="text-white font-medium italic">
                  This means you're not just buying a course — you're investing in continuous learning and long-term growth.
                </p>
              </div>
            </div>
          </div>

          {/* What You'll Get */}
          <div className="card">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              What You'll <span className="text-gradient">Get</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">1. Understanding Facebook Distribution</h3>
                <p className="text-gray-400 text-sm">How Facebook's algorithm works and how your content gets pushed to the right audience.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">2. Proper Facebook Account</h3>
                <p className="text-gray-400 text-sm">Step-by-step guide to safely creating and setting up a new Facebook account without restrictions.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">3. Choosing the Right Niche</h3>
                <p className="text-gray-400 text-sm">How to pick a profitable niche that fits your skills and has high demand.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">4. How to Get US Followers & Viewers Organically</h3>
                <p className="text-gray-400 text-sm">Proven strategies to attract U.S.-based audiences without ads.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">5. Best Time to Post & Why It Matters</h3>
                <p className="text-gray-400 text-sm">Learn optimal posting times and how timing affects reach and engagement.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">6. Page Naming Strategy & Video Editing Basics</h3>
                <p className="text-gray-400 text-sm">How to name your page for growth and edit videos that perform well.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">7. How to Create a Facebook Page & Publish Posts Properly</h3>
                <p className="text-gray-400 text-sm">From page creation to posting the right content the right way.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">8. How to Grow Followers Organically</h3>
                <p className="text-gray-400 text-sm">No bots, no fake engagement — only real, sustainable growth methods.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">9. How I Earned 6 Digits Using Photos</h3>
                <p className="text-gray-400 text-sm">Image strategies that convert views into income.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">10. How to Create Simple Photos Using Canva</h3>
                <p className="text-gray-400 text-sm">Beginner-friendly photo creation that still looks professional.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">11. How to Create Impressive & Engaging AI Prompts for Images</h3>
                <p className="text-gray-400 text-sm">Crafting prompts that generate high-quality, scroll-stopping visuals.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">12. Free AI Alternatives to ChatGPT Pro</h3>
                <p className="text-gray-400 text-sm">Tools you can use without paying — tested and effective.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">13. Ways to Avoid Spam & Account Restrictions</h3>
                <p className="text-gray-400 text-sm">Safe posting habits to protect your accounts and pages.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">14. How I Earned 6 Digits Using Facebook Stories</h3>
                <p className="text-gray-400 text-sm">Story strategies that generate daily income.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">15. Sample Edits for Reaction Video Niche</h3>
                <p className="text-gray-400 text-sm">Real examples and editing ideas for reaction content.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">16. Where to Download Content in 1080p Quality</h3>
                <p className="text-gray-400 text-sm">Reliable sources and tools for high-quality content downloads.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">17. AI Video Generators & Free Usage Strategy</h3>
                <p className="text-gray-400 text-sm">How to use AI video tools strategically without spending money.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">18. Websites That Unlock Paid AI Features</h3>
                <p className="text-gray-400 text-sm">Smart tools that give premium-level features for free.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">19. Ways to Go Viral</h3>
                <p className="text-gray-400 text-sm">Content structures and triggers that increase viral potential.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">20. Scam Awareness & Online Safety</h3>
                <p className="text-gray-400 text-sm">How to avoid scams and protect your accounts and earnings.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-400">21. Important Do&apos;s and Don&apos;ts</h3>
                <p className="text-gray-400 text-sm">Clear rules to follow so you don&apos;t make costly mistakes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Lazy-loaded sections for better initial load */}
      <LazyWins />
      <LazyFeatures />
      <Footer />
    </main>
  );
}
