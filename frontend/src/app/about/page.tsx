import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Target, Users, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';

// Static metadata for SEO
export const metadata: Metadata = {
  title: 'About Darwin - Facebook Automation Education',
  description: 'Empowering entrepreneurs to master Facebook automation and build profitable online businesses. Learn our story and mission.',
  openGraph: {
    title: 'About Darwin Education',
    description: 'Empowering entrepreneurs to master Facebook automation and build profitable online businesses.',
  },
};

// Force static generation - no dynamic data
export const dynamic = 'force-static';
export const revalidate = false;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-dark-500">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-hero-gradient">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            About <span className="text-gradient">Darwin</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Empowering entrepreneurs to master Facebook automation and build profitable online businesses
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-4">
                We believe anyone can build a successful Facebook business without spending thousands on ads. 
                Our mission is to teach proven organic growth strategies and automation techniques that actually work.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Since 2020, we've helped over 3,200+ students grow their Facebook pages from zero to thousands 
                of engaged followers, turning their passion into profitable online businesses.
              </p>
            </div>
            <div className="card p-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Results-Driven</h3>
                    <p className="text-gray-400 text-sm">Proven strategies with real, measurable results</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Community First</h3>
                    <p className="text-gray-400 text-sm">Supportive community of like-minded entrepreneurs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Growth Focused</h3>
                    <p className="text-gray-400 text-sm">Continuous innovation and cutting-edge strategies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section removed per design */}

      {/* Story Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Our Story
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            In 2018, when I was just 13 years old and a Grade 8 student, I 
            almost lost my life to dengue. After that experience, my mother 
            rarely allowed me to go outside because of fear for my health. 
            Being stuck at home, I started searching for health tips every day, 
            hoping that someday I would become strong enough to live normally again. 
            To keep myself entertained, I began experimenting with simple video 
            edits—memes, random clips, anything that helped me pass the time.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            In 2020, when the pandemic hit, I created my first online page. 
            It wasn’t monetized, and for years it didn’t earn anything. 
            I kept going anyway. In 2024, I decided to create a page focused on 
            health, based on everything I had learned from years of research, 
            curiosity, and personal experience. It started purely for fun—I never 
            expected it to be monetized or to generate income. But to my surprise, 
            I reached my first million at the age of 19. Now, at 21, I consistently
             generate six figures per month.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed">
            As I shared my journey online, many people began asking about 
            my hustle and how I did it. That’s when I realized it was time to 
            teach. This course was created to share real information and knowledge 
            that came directly from my own trial and error—insights you won’t 
            easily find online. Everything here is something I personally tested, 
            experienced, and lived.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
