'use client';

import { Star, Clock, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';

const courses = [
  {
    id: 1,
    title: 'Facebook Page Growth Fundamentals',
    description: 'Master the basics of organic Facebook page growth. Learn content strategies that attract real followers.',
    price: 2999,
    rating: 4.9,
    students: 1850,
    duration: '18 hours',
    level: 'Beginner',
    category: 'FB Automation',
    image: '/courses/fb-fundamentals.jpg',
  },
  {
    id: 2,
    title: 'Facebook Automation Mastery',
    description: 'Advanced automation tools and strategies to manage multiple Facebook pages efficiently.',
    price: 4999,
    rating: 4.9,
    students: 1240,
    duration: '32 hours',
    level: 'Advanced',
    category: 'FB Automation',
    image: '/courses/fb-automation.jpg',
  },
  {
    id: 3,
    title: 'Organic Monetization Strategies',
    description: 'Learn proven methods to monetize your Facebook page without paid ads. Turn followers into income.',
    price: 3999,
    rating: 4.8,
    students: 980,
    duration: '24 hours',
    level: 'Intermediate',
    category: 'FB Monetization',
    image: '/courses/fb-monetization.jpg',
  },
  {
    id: 4,
    title: 'Content Creation for Facebook',
    description: 'Create viral-worthy content that boosts engagement and grows your audience organically.',
    price: 2499,
    rating: 4.7,
    students: 1560,
    duration: '16 hours',
    level: 'Beginner',
    category: 'FB Content',
    image: '/courses/fb-content.jpg',
  },
  {
    id: 5,
    title: 'Facebook Analytics & Optimization',
    description: 'Use Facebook Insights to optimize your page performance and maximize organic reach.',
    price: 3499,
    rating: 4.8,
    students: 890,
    duration: '20 hours',
    level: 'Intermediate',
    category: 'FB Analytics',
    image: '/courses/fb-analytics.jpg',
  },
  {
    id: 6,
    title: 'Facebook Business Automation Suite',
    description: 'Complete automation system for managing Facebook pages, scheduling posts, and engaging with followers.',
    price: 5999,
    rating: 4.9,
    students: 720,
    duration: '40 hours',
    level: 'Advanced',
    category: 'FB Automation',
    image: '/courses/fb-business.jpg',
  },
];

const FeaturedCourses = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">Facebook Automation Courses</h2>
          <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
            Master Facebook page growth and monetization with our comprehensive automation courses
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="card group">
              {/* Course Image */}
              <div className="relative aspect-video bg-dark-400 rounded-xl overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-700/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-primary-400/50" />
                </div>
                <span className="absolute top-3 left-3 px-3 py-1 bg-dark-500/80 text-primary-400 text-xs font-medium rounded-full">
                  {course.category}
                </span>
                <span className="absolute top-3 right-3 px-3 py-1 bg-primary-500/80 text-white text-xs font-medium rounded-full">
                  {course.level}
                </span>
              </div>

              {/* Course Info */}
              <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                {course.title}
              </h3>
              <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                {course.description}
              </p>

              {/* Course Meta */}
              <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{course.students}</span>
                </div>
              </div>

              {/* Price & Rating */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-900/30">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-medium">{course.rating}</span>
                </div>
                <span className="text-xl font-bold text-primary-400">
                  ₱{course.price.toLocaleString()}
                </span>
              </div>

              {/* Enroll Button */}
              <Link 
                href={`/enroll?course=${course.id}`}
                className="btn-outline w-full mt-4 text-center block text-sm"
              >
                Enroll Now
              </Link>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/courses" className="btn-primary">
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
