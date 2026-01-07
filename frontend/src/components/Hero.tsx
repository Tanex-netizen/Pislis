import { Play, Star, Users, Clock } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse" />
              <span className="text-primary-400 text-sm font-medium">Facebook Automation Mastery</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight">
              Grow &
              <span className="text-gradient"> Monetize</span>
              <br />
              Your FB Page
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-lg max-w-lg">
              Master Facebook automation and organic growth strategies. 
              Learn proven methods to grow your audience and monetize your 
              Facebook page without spending on ads.
            </p>

            {/* CTAs removed as requested */}
          </div>

          {/* Right Content - Featured Course Card */}
          <div className="relative">
            {/* Main Card */}
            <div className="card glow animate-float">
              <div className="relative aspect-video bg-dark-400 rounded-xl overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-700/20 flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
                <span className="absolute top-3 right-3 px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                  Popular
                </span>
              </div>
              <p className="text-primary-400 text-sm font-medium">Featured Course</p>
              <h3 className="text-xl font-bold text-white mt-1">Facebook Automation Mastery</h3>
              <p className="text-gray-400 text-sm mt-2">
                Complete guide to automating Facebook page growth and monetizing organically without ads.
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-900/30">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-medium">4.9</span>
                  <span className="text-gray-500 text-sm">(1.2k reviews)</span>
                </div>
                <span className="text-2xl font-bold text-primary-400">₱2,178</span>
              </div>
              <Link href="/courses/fb-automation" className="btn-primary w-full mt-4 text-center block">
                Enroll Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
