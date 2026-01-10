'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrollment } from '@/hooks/useEnrollment';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, BookOpen, Copy, Check, LogOut, Clock, Calendar, AlertCircle, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface EnrolledCourse {
  id: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  monthly_payment_amount: number | null;
  last_payment_date: string | null;
  next_payment_due: string | null;
  monthly_payment_status: 'paid' | 'pending' | 'overdue' | null;
  days_remaining: number | null;
  is_overdue: boolean;
  courses: {
    id: string;
    slug: string;
    title: string;
    short_description: string;
    thumbnail_url: string;
    duration_hours: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { getMyEnrolledCourses } = useEnrollment();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [copied, setCopied] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch enrolled courses
  useEffect(() => {
    async function fetchCourses() {
      if (isAuthenticated) {
        const courses = await getMyEnrolledCourses();
        console.log('📊 Enrolled courses data:', courses);
        setEnrolledCourses(courses);
        setLoadingCourses(false);
      }
    }
    fetchCourses();
  }, [isAuthenticated, getMyEnrolledCourses]);

  const copyUserCode = async () => {
    if (user?.user_code) {
      await navigator.clipboard.writeText(user.user_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-950 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {user.name || user.full_name}
                </h1>
                <p className="text-gray-400 mb-4">{user.email}</p>

                {/* User Code - Prominently Displayed */}
                <div className="inline-flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Your User ID</p>
                    <p className="text-xl font-mono font-bold text-emerald-400">{user.user_code}</p>
                  </div>
                  <button
                    onClick={copyUserCode}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copy User ID"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-emerald-400 font-semibold mb-1">
                    Access & Approval
                  </p>
                  <p className="text-xs text-gray-400">
                    Courses become available after an admin approves/unlocks them.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 text-gray-400 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Member Since</span>
              </div>
              <p className="text-lg text-white font-semibold">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 text-gray-400 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm">Enrolled Courses</span>
              </div>
              <p className="text-lg text-white font-semibold">
                {enrolledCourses.length} {enrolledCourses.length === 1 ? 'Course' : 'Courses'}
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 text-gray-400 mb-2">
                <User className="w-5 h-5" />
                <span className="text-sm">Account Type</span>
              </div>
              <p className="text-lg text-white font-semibold capitalize">{user.role}</p>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-emerald-500" />
              My Courses
            </h2>

            {loadingCourses ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No courses yet</h3>
                <p className="text-gray-400 mb-6">
                  Your courses will appear here once an admin approves/unlocks access.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {enrolledCourses.map((enrollment) => (
                  <Link
                    key={enrollment.id}
                    href={`/courses/${enrollment.courses.slug}/learn`}
                    className="group bg-gray-800/50 border border-gray-700 hover:border-emerald-500/50 rounded-xl overflow-hidden transition-all"
                  >
                    <div className="aspect-video relative bg-gray-800">
                      {enrollment.courses.thumbnail_url ? (
                        <img
                          src={enrollment.courses.thumbnail_url}
                          alt={enrollment.courses.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg">
                          Continue Learning
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2">
                        {enrollment.courses.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {enrollment.courses.short_description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {enrollment.courses.duration_hours}h
                        </span>
                        <span>
                          Enrolled {new Date(enrollment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Monthly Payment Timer */}
                      {enrollment.next_payment_due && (
                        <div className={`p-3 rounded-lg border ${
                          enrollment.is_overdue 
                            ? 'bg-red-500/10 border-red-500/30' 
                            : enrollment.days_remaining !== null && enrollment.days_remaining <= 5
                              ? 'bg-orange-500/10 border-orange-500/30'
                              : enrollment.monthly_payment_status === 'paid'
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-yellow-500/10 border-yellow-500/30'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs font-semibold">
                              Monthly Payment: ₱{enrollment.monthly_payment_amount || 100}
                            </span>
                          </div>
                          <div className={`text-sm font-medium ${
                            enrollment.is_overdue 
                              ? 'text-red-400' 
                              : enrollment.days_remaining !== null && enrollment.days_remaining <= 5
                                ? 'text-orange-400'
                                : enrollment.monthly_payment_status === 'paid'
                                  ? 'text-green-400'
                                  : 'text-yellow-400'
                          }`}>
                            {enrollment.monthly_payment_status === 'paid' ? (
                              <>✓ Paid - Next due: {new Date(enrollment.next_payment_due).toLocaleDateString()}</>
                            ) : enrollment.is_overdue ? (
                              <>⚠ Overdue by {Math.abs(enrollment.days_remaining || 0)} days</>
                            ) : (
                              <>{enrollment.days_remaining} days until payment due</>
                            )}
                          </div>
                          {enrollment.next_payment_due && (
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {new Date(enrollment.next_payment_due).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Community */}
          <div className="mt-8 flex justify-center">
            <a
              href="https://t.me/+MaOIiu5SXVhlZGE9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              Free Community
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
