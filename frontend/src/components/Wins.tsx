'use client';

import { useState } from 'react';
import { TrendingUp, DollarSign, Users, BarChart, Award, Target, Zap, CheckCircle, Video, X, ChevronLeft, ChevronRight } from 'lucide-react';
import homepageVideos from '../../../public/data/homepage-videos.json';

const winsData = [
  { id: 1, title: 'Wins', description: 'Student success', icon: Users, color: 'from-green-500 to-emerald-600', category: 'Wins', image: '/Wins/photo_6260264869919656889_w.jpg' },
  { id: 2, title: 'Wins', description: 'Growth results', icon: TrendingUp, color: 'from-emerald-500 to-teal-600', category: 'Wins', image: '/Wins/photo_6260264869919656891_w.jpg' },
  { id: 3, title: 'Wins', description: 'Achievement', icon: BarChart, color: 'from-green-600 to-primary-600', category: 'Wins', image: '/Wins/photo_6260264869919656892_w.jpg' },
  { id: 4, title: 'Wins', description: 'Success story', icon: TrendingUp, color: 'from-primary-400 to-emerald-500', category: 'Wins', image: '/Wins/photo_6260264869919656893_w.jpg' },
  { id: 5, title: 'Wins', description: 'Page growth', icon: Users, color: 'from-green-500 to-emerald-600', category: 'Wins', image: '/Wins/photo_6260264869919656894_w.jpg' },
  { id: 6, title: 'Wins', description: 'Engagement', icon: TrendingUp, color: 'from-emerald-500 to-teal-600', category: 'Wins', image: '/Wins/photo_6260264869919656895_w.jpg' },
  { id: 7, title: 'Wins', description: 'Reach', icon: BarChart, color: 'from-green-600 to-primary-600', category: 'Wins', image: '/Wins/photo_6260264869919656896_w.jpg' },
  { id: 8, title: 'Wins', description: 'Organic', icon: TrendingUp, color: 'from-primary-400 to-emerald-500', category: 'Wins', image: '/Wins/photo_6260264869919656897_w.jpg' },
  { id: 9, title: 'Wins', description: 'Automation', icon: Users, color: 'from-green-500 to-emerald-600', category: 'Wins', image: '/Wins/photo_6260264869919656898_w.jpg' },
  { id: 10, title: 'Wins', description: 'Results', icon: TrendingUp, color: 'from-emerald-500 to-teal-600', category: 'Wins', image: '/Wins/photo_6260264869919656899_w.jpg' },
  { id: 11, title: 'Wins', description: 'Performance', icon: BarChart, color: 'from-green-600 to-primary-600', category: 'Wins', image: '/Wins/photo_6260264869919656900_w.jpg' },
  { id: 12, title: 'Wins', description: 'Progress', icon: TrendingUp, color: 'from-primary-400 to-emerald-500', category: 'Wins', image: '/Wins/photo_6260264869919656901_w.jpg' },
  { id: 13, title: 'Wins', description: 'Success', icon: Users, color: 'from-green-500 to-emerald-600', category: 'Wins', image: '/Wins/photo_6260264869919656902_w.jpg' },
  { id: 14, title: 'Wins', description: 'Achievement', icon: TrendingUp, color: 'from-emerald-500 to-teal-600', category: 'Wins', image: '/Wins/photo_6260264869919656903_w.jpg' },
  { id: 15, title: 'Wins', description: 'Growth', icon: BarChart, color: 'from-green-600 to-primary-600', category: 'Wins', image: '/Wins/photo_6260264869919656904_w.jpg' },
  { id: 16, title: 'Wins', description: 'Milestone', icon: TrendingUp, color: 'from-primary-400 to-emerald-500', category: 'Wins', image: '/Wins/photo_6260264869919656905_w.jpg' },
  { id: 17, title: 'Wins', description: 'Excellence', icon: Users, color: 'from-green-500 to-emerald-600', category: 'Wins', image: '/Wins/photo_6260264869919656906_w.jpg' },
  { id: 18, title: 'Wins', description: 'Impact', icon: TrendingUp, color: 'from-emerald-500 to-teal-600', category: 'Wins', image: '/Wins/photo_6260264869919656907_w.jpg' },
  { id: 19, title: 'Wins', description: 'Transformation', icon: BarChart, color: 'from-green-600 to-primary-600', category: 'Wins', image: '/Wins/photo_6260264869919656908_w.jpg' },
  { id: 20, title: 'Wins', description: 'Victory', icon: TrendingUp, color: 'from-primary-400 to-emerald-500', category: 'Wins', image: '/Wins/photo_6260264869919656909_w.jpg' },
  { id: 21, title: 'Wins', description: 'Achievement', icon: Users, color: 'from-green-500 to-emerald-600', category: 'Wins', image: '/Wins/photo_6260264869919656910_w.jpg' },
  { id: 22, title: 'Wins', description: 'Success', icon: TrendingUp, color: 'from-emerald-500 to-teal-600', category: 'Wins', image: '/Wins/photo_6260264869919656911_w.jpg' },
  { id: 23, title: 'Wins', description: 'Results', icon: BarChart, color: 'from-green-600 to-primary-600', category: 'Wins', image: '/Wins/photo_6260264869919656912_w.jpg' },
  { id: 24, title: 'Wins', description: 'Growth', icon: TrendingUp, color: 'from-primary-400 to-emerald-500', category: 'Wins', image: '/Wins/photo_6260264869919656913_w.jpg' },
  { id: 25, title: 'Wins', description: 'Progress', icon: Users, color: 'from-green-500 to-emerald-600', category: 'Wins', image: '/Wins/photo_6260264869919656914_w.jpg' },
  { id: 26, title: 'Wins', description: 'Performance', icon: TrendingUp, color: 'from-emerald-500 to-teal-600', category: 'Wins', image: '/Wins/photo_6260264869919656915_w.jpg' },
  { id: 27, title: 'Wins', description: 'Excellence', icon: BarChart, color: 'from-green-600 to-primary-600', category: 'Wins', image: '/Wins/photo_6260264869919656916_w.jpg' },
];

const coachingData = [
  { id: 5, title: 'Coaching', description: 'Professional coaching', icon: Award, color: 'from-blue-500 to-cyan-600', category: 'Coaching', image: '/coaching/1.jpg' },
  { id: 6, title: 'Coaching', description: 'Expert guidance', icon: Video, color: 'from-cyan-500 to-blue-600', category: 'Coaching', image: '/coaching/2.jpg' },
  { id: 7, title: 'Coaching', description: 'Strategic planning', icon: Target, color: 'from-blue-600 to-indigo-600', category: 'Coaching', image: '/coaching/3.jpg' },
  { id: 8, title: 'Coaching', description: 'Community support', icon: Users, color: 'from-indigo-500 to-blue-500', category: 'Coaching', image: '/coaching/4.jpg' },
  { id: 9, title: 'Coaching', description: 'Training sessions', icon: Award, color: 'from-blue-500 to-cyan-600', category: 'Coaching', image: '/coaching/5.jpg' },
  { id: 10, title: 'Coaching', description: 'Development', icon: Video, color: 'from-cyan-500 to-blue-600', category: 'Coaching', image: '/coaching/6.jpg' },
  { id: 11, title: 'Coaching', description: 'Performance', icon: Target, color: 'from-blue-600 to-indigo-600', category: 'Coaching', image: '/coaching/7.jpg' },
  { id: 12, title: 'Coaching', description: 'Collaboration', icon: Users, color: 'from-indigo-500 to-blue-500', category: 'Coaching', image: '/coaching/8.jpg' },
  { id: 13, title: 'Coaching', description: 'Leadership', icon: Award, color: 'from-blue-500 to-cyan-600', category: 'Coaching', image: '/coaching/9.jpg' },
  { id: 14, title: 'Coaching', description: 'Skills', icon: Video, color: 'from-cyan-500 to-blue-600', category: 'Coaching', image: '/coaching/10.jpg' },
  { id: 15, title: 'Coaching', description: 'Strategies', icon: Target, color: 'from-blue-600 to-indigo-600', category: 'Coaching', image: '/coaching/11.jpg' },
  { id: 16, title: 'Coaching', description: 'Networking', icon: Users, color: 'from-indigo-500 to-blue-500', category: 'Coaching', image: '/coaching/12.jpg' },
  { id: 17, title: 'Coaching', description: 'Acceleration', icon: Award, color: 'from-blue-500 to-cyan-600', category: 'Coaching', image: '/coaching/13.jpg' },
  { id: 18, title: 'Coaching', description: 'Marketing', icon: Video, color: 'from-cyan-500 to-blue-600', category: 'Coaching', image: '/coaching/14.jpg' },
  { id: 19, title: 'Coaching', description: 'Revenue', icon: Target, color: 'from-blue-600 to-indigo-600', category: 'Coaching', image: '/coaching/15.jpg' },
  { id: 20, title: 'Coaching', description: 'Automation', icon: Users, color: 'from-indigo-500 to-blue-500', category: 'Coaching', image: '/coaching/16.jpg' },
  { id: 21, title: 'Coaching', description: 'Growth', icon: Award, color: 'from-blue-500 to-cyan-600', category: 'Coaching', image: '/coaching/17.jpg' },
  { id: 22, title: 'Coaching', description: 'Monetization', icon: Video, color: 'from-cyan-500 to-blue-600', category: 'Coaching', image: '/coaching/18.jpg' },
  { id: 23, title: 'Coaching', description: 'Training', icon: Target, color: 'from-blue-600 to-indigo-600', category: 'Coaching', image: '/coaching/Untitled.jpg' },
  { id: 24, title: 'Coaching', description: 'Expert coaching', icon: Users, color: 'from-indigo-500 to-blue-500', category: 'Coaching', image: '/coaching/photo_6242377696931417378_w.jpg' },
  { id: 25, title: 'Coaching', description: 'Professional', icon: Award, color: 'from-blue-500 to-cyan-600', category: 'Coaching', image: '/coaching/photo_6242377696931417379_w.jpg' },
  { id: 26, title: 'Coaching', description: 'Advanced', icon: Video, color: 'from-cyan-500 to-blue-600', category: 'Coaching', image: '/coaching/photo_6242377696931417381_y.jpg' },
  { id: 27, title: 'Coaching', description: 'Mastery', icon: Target, color: 'from-blue-600 to-indigo-600', category: 'Coaching', image: '/coaching/photo_6242377696931417382_w.jpg' },
  { id: 28, title: 'Coaching', description: 'Excellence', icon: Users, color: 'from-indigo-500 to-blue-500', category: 'Coaching', image: '/coaching/photo_6242377696931417383_w.jpg' },
  { id: 29, title: 'Coaching', description: 'Success', icon: Award, color: 'from-blue-500 to-cyan-600', category: 'Coaching', image: '/coaching/photo_6242377696931417384_w.jpg' },
  { id: 30, title: 'Coaching', description: 'Achievement', icon: Video, color: 'from-cyan-500 to-blue-600', category: 'Coaching', image: '/coaching/photo_6242377696931417385_w.jpg' },
  { id: 31, title: 'Coaching', description: 'Results', icon: Target, color: 'from-blue-600 to-indigo-600', category: 'Coaching', image: '/coaching/photo_6242377696931417386_w.jpg' },
  { id: 32, title: 'Coaching', description: 'Impact', icon: Users, color: 'from-indigo-500 to-blue-500', category: 'Coaching', image: '/coaching/photo_6242377696931417387_w.jpg' },
  { id: 33, title: 'Coaching', description: 'Transformation', icon: Award, color: 'from-blue-500 to-cyan-600', category: 'Coaching', image: '/coaching/photo_6242377696931417388_w.jpg' },
  { id: 34, title: 'Coaching', description: 'Performance', icon: Video, color: 'from-cyan-500 to-blue-600', category: 'Coaching', image: '/coaching/photo_6242377696931417388_w(1).jpg' },
];

const monetizedData = [
  { id: 100, title: 'Monetized', description: 'Revenue success', icon: DollarSign, color: 'from-yellow-500 to-orange-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656918_w.jpg' },
  { id: 101, title: 'Monetized', description: 'Earnings growth', icon: Zap, color: 'from-orange-500 to-red-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656919_w.jpg' },
  { id: 102, title: 'Monetized', description: 'Profit milestone', icon: CheckCircle, color: 'from-red-500 to-pink-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656920_w.jpg' },
  { id: 103, title: 'Monetized', description: 'Income stream', icon: TrendingUp, color: 'from-pink-500 to-rose-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656921_w.jpg' },
  { id: 104, title: 'Monetized', description: 'Revenue boost', icon: DollarSign, color: 'from-yellow-500 to-orange-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656922_w.jpg' },
  { id: 105, title: 'Monetized', description: 'Financial success', icon: Zap, color: 'from-orange-500 to-red-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656923_w.jpg' },
  { id: 106, title: 'Monetized', description: 'Passive income', icon: CheckCircle, color: 'from-red-500 to-pink-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656924_w.jpg' },
  { id: 107, title: 'Monetized', description: 'Profit growth', icon: TrendingUp, color: 'from-pink-500 to-rose-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656925_w.jpg' },
  { id: 108, title: 'Monetized', description: 'Cash flow', icon: DollarSign, color: 'from-yellow-500 to-orange-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656926_w.jpg' },
  { id: 109, title: 'Monetized', description: 'Revenue stream', icon: Zap, color: 'from-orange-500 to-red-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656927_w.jpg' },
  { id: 110, title: 'Monetized', description: 'Earnings', icon: CheckCircle, color: 'from-red-500 to-pink-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656928_w.jpg' },
  { id: 111, title: 'Monetized', description: 'Income growth', icon: TrendingUp, color: 'from-pink-500 to-rose-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656929_w.jpg' },
  { id: 112, title: 'Monetized', description: 'Profit', icon: DollarSign, color: 'from-yellow-500 to-orange-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656930_w.jpg' },
  { id: 113, title: 'Monetized', description: 'Revenue', icon: Zap, color: 'from-orange-500 to-red-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656931_w.jpg' },
  { id: 114, title: 'Monetized', description: 'Success', icon: CheckCircle, color: 'from-red-500 to-pink-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656932_w.jpg' },
  { id: 115, title: 'Monetized', description: 'Achievement', icon: TrendingUp, color: 'from-pink-500 to-rose-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656933_w.jpg' },
  { id: 116, title: 'Monetized', description: 'Financial', icon: DollarSign, color: 'from-yellow-500 to-orange-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656934_w.jpg' },
  { id: 117, title: 'Monetized', description: 'Earnings boost', icon: Zap, color: 'from-orange-500 to-red-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656940_w(1).jpg' },
  { id: 118, title: 'Monetized', description: 'Income', icon: CheckCircle, color: 'from-red-500 to-pink-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656940_w.jpg' },
  { id: 119, title: 'Monetized', description: 'Profit growth', icon: TrendingUp, color: 'from-pink-500 to-rose-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656941_w.jpg' },
  { id: 120, title: 'Monetized', description: 'Revenue', icon: DollarSign, color: 'from-yellow-500 to-orange-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656942_w.jpg' },
  { id: 121, title: 'Monetized', description: 'Success', icon: Zap, color: 'from-orange-500 to-red-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656943_w.jpg' },
  { id: 122, title: 'Monetized', description: 'Achievement', icon: CheckCircle, color: 'from-red-500 to-pink-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656944_w.jpg' },
  { id: 123, title: 'Monetized', description: 'Growth', icon: TrendingUp, color: 'from-pink-500 to-rose-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656945_w.jpg' },
  { id: 124, title: 'Monetized', description: 'Financial', icon: DollarSign, color: 'from-yellow-500 to-orange-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656946_w.jpg' },
  { id: 125, title: 'Monetized', description: 'Profit', icon: Zap, color: 'from-orange-500 to-red-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656947_w.jpg' },
  { id: 126, title: 'Monetized', description: 'Earnings', icon: CheckCircle, color: 'from-red-500 to-pink-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656948_w.jpg' },
  { id: 127, title: 'Monetized', description: 'Revenue', icon: TrendingUp, color: 'from-pink-500 to-rose-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656949_w.jpg' },
  { id: 128, title: 'Monetized', description: 'Income', icon: DollarSign, color: 'from-yellow-500 to-orange-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656950_w.jpg' },
  { id: 129, title: 'Monetized', description: 'Success', icon: Zap, color: 'from-orange-500 to-red-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656951_w.jpg' },
  { id: 130, title: 'Monetized', description: 'Growth', icon: CheckCircle, color: 'from-red-500 to-pink-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656952_w.jpg' },
  { id: 131, title: 'Monetized', description: 'Achievement', icon: TrendingUp, color: 'from-pink-500 to-rose-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656953_w.jpg' },
  { id: 132, title: 'Monetized', description: 'Financial success', icon: DollarSign, color: 'from-yellow-500 to-orange-600', category: 'Monetized', image: '/Monetized/photo_6260264869919656954_w.jpg' },
];

// Alternate pattern: Wins, Coaching, Monetized
// Create interleaved array with all items from each category
const maxLength = Math.max(winsData.length, coachingData.length, monetizedData.length);
const allData: any[] = [];

for (let i = 0; i < maxLength; i++) {
  if (i < winsData.length) allData.push(winsData[i]);
  if (i < coachingData.length) allData.push(coachingData[i]);
  if (i < monetizedData.length) allData.push(monetizedData[i]);
}

// Video testimonials data for the second row - Using Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dwcxvaswf';

const colorGradients = [
  'from-purple-500 to-pink-600',
  'from-blue-500 to-purple-600',
  'from-green-500 to-blue-600',
  'from-yellow-500 to-green-600',
  'from-pink-500 to-red-600',
  'from-orange-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-lime-500 to-green-600',
  'from-teal-500 to-cyan-600',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
  'from-red-500 to-rose-600',
  'from-green-500 to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-violet-600',
];

const videoTestimonialsData = homepageVideos.map((video, index) => ({
  id: video.id + 100,
  title: video.title,
  description: video.description,
  icon: Video,
  color: colorGradients[index % colorGradients.length],
  category: 'Testimonial',
  videoUrl: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${video.publicId}.mp4`,
}));

const Wins = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleCardClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentSlide(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory('');
    setCurrentSlide(0);
  };

  const getCategoryData = () => {
    if (selectedCategory === 'Wins') return winsData;
    if (selectedCategory === 'Coaching') return coachingData;
    if (selectedCategory === 'Monetized') return monetizedData;
    return [];
  };

  const categoryData = getCategoryData();

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % categoryData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + categoryData.length) % categoryData.length);
  };

  const getBadgeColor = (category: string) => {
    if (category === 'Wins') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (category === 'Coaching') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  };

  return (
    <section className="py-20 relative overflow-hidden bg-dark-400/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            What You Will Get is <span className="text-gradient">Wins</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real results our students achieve with Facebook automation strategies
          </p>
        </div>

        {/* Single Scrolling Row with All Categories */}
        <div className="overflow-hidden">
          <div className="animate-scroll-left flex space-x-6 hover:pause-animation">
            {[...allData, ...allData, ...allData, ...allData].map((item, index) => (
              <div
                key={`item-${index}`}
                onClick={() => handleCardClick(item.category)}
                className="flex-shrink-0 w-80 card p-6 hover:scale-105 transition-transform duration-300 hover:shadow-2xl group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getBadgeColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
                {/* Title removed per request - show only description */}
                <p className="text-gray-300 text-lg font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Second Scrolling Row - Video Testimonials (Scrolls Right) */}
        <div className="overflow-hidden mt-6">
          <div className="animate-scroll-right flex space-x-6 hover:pause-animation">
            {[...videoTestimonialsData, ...videoTestimonialsData, ...videoTestimonialsData, ...videoTestimonialsData].map((item, index) => (
              <div
                key={`video-${index}`}
                className="flex-shrink-0 w-80 hover:scale-105 transition-transform duration-300 hover:shadow-2xl group"
              >
                {/* Video Player */}
                <div className="relative aspect-video bg-dark-500 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                  <video
                    src={item.videoUrl}
                    loop
                    muted
                    playsInline
                    autoPlay
                    preload="metadata"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    onCanPlay={(e) => {
                      const video = e.currentTarget;
                      video.play().catch(() => {});
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Slideshow */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl mx-4">
            {/* Close Button - More visible over images */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 bg-black/70 hover:bg-primary-500 rounded-full flex items-center justify-center text-white transition-colors z-20 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Slideshow Container - Image Only */}
            <div className="relative bg-dark-400 rounded-2xl overflow-hidden border border-primary-900/30">
              {/* Current Slide - Only Image */}
              {categoryData[currentSlide] && (() => {
                const currentItem = categoryData[currentSlide];
                const IconComponent = currentItem.icon;
                return (
                  <div className="relative w-full" style={{ minHeight: '400px', maxHeight: '80vh' }}>
                    {/* Full size image or gradient icon */}
                    {currentItem.image ? (
                      <img 
                        src={currentItem.image} 
                        alt={`Slide ${currentSlide + 1}`}
                        className="w-full h-full object-contain bg-dark-500"
                        style={{ maxHeight: '80vh' }}
                        onError={(e) => {
                          // Fallback to gradient icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full bg-gradient-to-br ${currentItem.color} flex items-center justify-center ${currentItem.image ? 'hidden' : 'flex'}`}
                      style={{ minHeight: '400px' }}
                    >
                      <IconComponent className="w-32 h-32 text-white opacity-50" />
                    </div>
                  </div>
                );
              })()}

              {/* Navigation Arrows - Positioned over image */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-primary-500 rounded-full flex items-center justify-center text-white transition-all z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-primary-500 rounded-full flex items-center justify-center text-white transition-all z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots Indicator - Positioned at bottom */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center space-x-2 z-10">
                {categoryData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Wins;
