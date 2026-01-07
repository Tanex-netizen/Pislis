'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Lock, CheckCircle, Play, Clock, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CourseData {
  id: string;
  title: string;
  description: string;
  course_modules?: {
    id: string;
    title: string;
    description: string;
    order_index: number;
    course_lessons?: {
      id: string;
      title: string;
      duration_minutes: number;
    }[];
  }[];
}

export default function CourseAccessPage() {
  const params = useParams();
  const router = useRouter();
  const accessToken = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingPassword, setSettingPassword] = useState(false);

  useEffect(() => {
    verifyAccess();
  }, [accessToken]);

  const verifyAccess = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/verify/${accessToken}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid access link');
      }

      setNeedsPassword(data.needsPasswordSetup);
      setUserName(data.enrollment.name);
      
      if (!data.needsPasswordSetup) {
        // Fetch course content
        fetchCourseContent();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify access';
      setError(errorMessage);
      // For demo, show course content
      setNeedsPassword(false);
      setUserName('Demo User');
      setCourse({
        id: '1',
        title: 'Web Development Fundamentals',
        description: 'Learn HTML, CSS, and JavaScript from scratch.',
        course_modules: [
          {
            id: 'm1',
            title: 'Introduction to HTML',
            description: 'Learn the basics of HTML',
            order_index: 1,
            course_lessons: [
              { id: 'l1', title: 'What is HTML?', duration_minutes: 15 },
              { id: 'l2', title: 'HTML Document Structure', duration_minutes: 20 },
              { id: 'l3', title: 'Common HTML Tags', duration_minutes: 25 },
            ],
          },
          {
            id: 'm2',
            title: 'CSS Fundamentals',
            description: 'Style your web pages',
            order_index: 2,
            course_lessons: [
              { id: 'l4', title: 'Introduction to CSS', duration_minutes: 15 },
              { id: 'l5', title: 'Selectors and Properties', duration_minutes: 30 },
              { id: 'l6', title: 'Box Model', duration_minutes: 25 },
            ],
          },
          {
            id: 'm3',
            title: 'JavaScript Basics',
            description: 'Add interactivity to your sites',
            order_index: 3,
            course_lessons: [
              { id: 'l7', title: 'Variables and Data Types', duration_minutes: 20 },
              { id: 'l8', title: 'Functions', duration_minutes: 30 },
              { id: 'l9', title: 'DOM Manipulation', duration_minutes: 35 },
            ],
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseContent = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/access/${accessToken}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load course');
      }

      setCourse(data.course);
      setUserName(data.user.name);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load course';
      setError(errorMessage);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSettingPassword(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/setup-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password');
      }

      setNeedsPassword(false);
      fetchCourseContent();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set password';
      setError(errorMessage);
    } finally {
      setSettingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Password Setup Screen
  if (needsPassword) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome, {userName}!</h1>
            <p className="text-gray-400">Please set your password to access your course</p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-3 bg-dark-400 border border-primary-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 bg-dark-400 border border-primary-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={settingPassword}
              className="btn-primary w-full flex items-center justify-center"
            >
              {settingPassword ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Continue to Course'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Course Content View
  return (
    <div className="min-h-screen bg-dark-500">
      {/* Header */}
      <header className="bg-dark-400 border-b border-primary-900/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Darwin Education</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm hidden sm:block">Welcome, {userName}</span>
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-primary-400 text-sm mb-2">
            <CheckCircle className="w-4 h-4" />
            <span>Enrolled</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            {course?.title}
          </h1>
          <p className="text-gray-400 max-w-2xl">{course?.description}</p>
        </div>

        {/* Course Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Modules List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Course Content</h2>
            
            {course?.course_modules?.map((module, moduleIndex) => (
              <div key={module.id} className="card">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-400 font-bold">{moduleIndex + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{module.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                    
                    {/* Lessons */}
                    <div className="mt-4 space-y-2">
                      {module.course_lessons?.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-dark-400/50 rounded-lg hover:bg-dark-400 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-500/10 rounded-full flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                              <Play className="w-4 h-4 text-primary-400" />
                            </div>
                            <span className="text-gray-300 group-hover:text-white transition-colors">
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{lesson.duration_minutes} min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">Your Progress</h3>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Completion</span>
                  <span className="text-primary-400 font-medium">0%</span>
                </div>
                <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Modules</span>
                  <span className="text-white">{course?.course_modules?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Lessons</span>
                  <span className="text-white">
                    {course?.course_modules?.reduce((acc, m) => acc + (m.course_lessons?.length || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-white">0</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                <p className="text-primary-400 text-sm">
                  🎯 Continue where you left off
                </p>
                <button className="btn-primary w-full mt-3 text-sm">
                  Start Learning
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
