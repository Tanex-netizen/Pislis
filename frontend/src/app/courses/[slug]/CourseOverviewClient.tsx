'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrollment } from '@/hooks/useEnrollment';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  Lock, 
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CourseModule {
  id: string;
  title: string;
  description: string;
  order_index: number;
  duration_minutes: number;
  course_lessons: {
    id: string;
    title: string;
    duration_minutes: number;
    is_free_preview: boolean;
    lesson_type: string;
  }[];
}

interface Course {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  price: number;
  original_price: number | null;
  category: string;
  level: string;
  duration_hours: number;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  rating: number;
  total_students: number;
  learning_outcomes: string[];
  requirements: string[];
  course_modules: CourseModule[];
}

interface CourseOverviewClientProps {
  course: Course;
  totalLessons: number;
}

export default function CourseOverviewClient({ course, totalLessons }: CourseOverviewClientProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { checkEnrollmentBySlug } = useEnrollment();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Check enrollment status
  useEffect(() => {
    async function checkEnrollment() {
      if (isAuthenticated) {
        const result = await checkEnrollmentBySlug(course.slug);
        setIsEnrolled(result.isEnrolled);
      }
      setCheckingEnrollment(false);
    }
    checkEnrollment();
  }, [isAuthenticated, course.slug, checkEnrollmentBySlug]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleEnrollClick = () => {
    if (isEnrolled) {
      router.push(`/courses/${course.slug}/learn`);
    } else if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${course.slug}`);
    } else {
      router.push('/profile');
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-950 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-900 to-gray-950 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-full">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm font-medium rounded-full">
                    {course.level}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {course.title}
                </h1>

                <p className="text-xl text-gray-300 mb-6">
                  {course.short_description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-white">{course.rating?.toFixed(1) || '4.8'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{course.total_students || 0} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{course.duration_hours}h total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>{totalLessons} lessons</span>
                  </div>
                </div>

                {/* CTA for mobile */}
                <div className="lg:hidden mb-8">
                  <button
                    onClick={handleEnrollClick}
                    disabled={checkingEnrollment}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50"
                  >
                    {checkingEnrollment ? 'Loading...' : isEnrolled ? 'Continue Learning' : 'View Student ID'}
                  </button>
                </div>
              </div>

              {/* Sticky Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden sticky top-24">
                  {/* Thumbnail */}
                  <div className="aspect-video relative bg-gray-800">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                    {course.preview_video_url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <button className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-3xl font-bold text-white">
                        ₱{course.price?.toLocaleString()}
                      </span>
                      {course.original_price && course.original_price > course.price && (
                        <span className="text-lg text-gray-500 line-through">
                          ₱{course.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={handleEnrollClick}
                      disabled={checkingEnrollment}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 mb-4"
                    >
                      {checkingEnrollment ? 'Loading...' : isEnrolled ? 'Continue Learning' : 'View Student ID'}
                    </button>

                    {isEnrolled ? (
                      <div className="text-center p-3 bg-emerald-900/20 border border-emerald-700/50 rounded-lg">
                        <p className="text-sm text-emerald-400 font-medium">✓ You're enrolled in this course</p>
                      </div>
                    ) : (
                      <p className="text-center text-sm text-gray-400">
                        Access becomes available after admin approval/unlock.
                      </p>
                    )}

                    {/* Course includes */}
                    <div className="mt-6 pt-6 border-t border-gray-800">
                      <h4 className="font-semibold text-white mb-4">This course includes:</h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-emerald-500" />
                          {course.duration_hours} hours of content
                        </li>
                        <li className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-emerald-500" />
                          {totalLessons} lessons
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          Lifetime access
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Description */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">About This Course</h2>
              <div className="prose prose-invert prose-gray max-w-none">
                <p className="text-gray-300 whitespace-pre-line">{course.description}</p>
              </div>
            </div>

            {/* Learning Outcomes */}
            {course.learning_outcomes && course.learning_outcomes.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-4">What You&apos;ll Learn</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.learning_outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <span className="text-emerald-500">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Curriculum */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {course.course_modules?.map((module) => (
                  <div 
                    key={module.id}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-800/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold text-white">{module.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {module.course_lessons?.length || 0} lessons • {formatDuration(module.duration_minutes || 0)}
                        </p>
                      </div>
                      {expandedModules.includes(module.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {expandedModules.includes(module.id) && (
                      <div className="border-t border-gray-800">
                        {module.course_lessons?.map((lesson) => (
                          <div 
                            key={lesson.id}
                            className="flex items-center justify-between px-5 py-4 hover:bg-gray-800/30 transition-colors border-b border-gray-800/50 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.is_free_preview || isEnrolled ? (
                                <Play className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Lock className="w-4 h-4 text-gray-500" />
                              )}
                              <span className={`${lesson.is_free_preview || isEnrolled ? 'text-gray-300' : 'text-gray-500'}`}>
                                {lesson.title}
                              </span>
                              {lesson.is_free_preview && !isEnrolled && (
                                <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                                  Preview
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDuration(lesson.duration_minutes || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {!isEnrolled && (
              <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-800/50 rounded-2xl p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Course Locked</h2>

                  {isAuthenticated ? (
                    <>
                      <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                        Your account is active with a Student ID. This course will unlock after admin approval.
                      </p>

                      <div className="bg-gray-900/50 border border-emerald-700 rounded-lg p-5 inline-block mb-6">
                        <p className="text-sm text-gray-400 mb-2">Your Student ID:</p>
                        <p className="text-2xl font-mono font-bold text-emerald-400">{user?.user_code}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                          href="/profile"
                          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                        >
                          Go to Profile
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                        Create an account to get your Student ID, then login. Courses become available after admin approval.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                          href={`/signup?redirect=/courses/${course.slug}`}
                          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                        >
                          Create Account
                        </Link>
                        <Link
                          href={`/login?redirect=/courses/${course.slug}`}
                          className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          Log In
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
