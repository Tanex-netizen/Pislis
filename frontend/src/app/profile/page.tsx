'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrollment } from '@/hooks/useEnrollment';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, BookOpen, Copy, Check, LogOut, Clock, Calendar, Smartphone, Camera, X, PlayCircle } from 'lucide-react';
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
  const { user, isLoading, isAuthenticated, logout, resetDevice, refreshUser } = useAuth();
  const { getMyEnrolledCourses } = useEnrollment();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resettingDevice, setResettingDevice] = useState(false);
  const [resetError, setResetError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');


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

  const handleResetDevice = async () => {
    setResettingDevice(true);
    setResetError('');
    const result = await resetDevice();
    setResettingDevice(false);
    if (result.success) {
      router.push('/login');
    } else {
      setResetError(result.error || 'Failed to reset device');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5MB');
      return;
    }

    setUploadingAvatar(true);
    setAvatarError('');

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset!);
      formData.append('folder', 'profile_avatars');

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!cloudRes.ok) {
        throw new Error('Cloudinary upload failed. Check your upload preset.');
      }

      const cloudData = await cloudRes.json();
      const avatarUrl = cloudData.secure_url;

      // Save to backend
      const token = localStorage.getItem('auth_token');
      const saveRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar_url: avatarUrl }),
        }
      );

      if (!saveRes.ok) throw new Error('Failed to save profile picture');

      await refreshUser();
    } catch (err: any) {
      setAvatarError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingAvatar(false);
      // Reset input so same file can be re-selected
      e.target.value = '';
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="text-gray-400 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-950 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Migration Announcement ── */}
          <div className="mb-8 relative">
            {/* Badge */}
            <div className="flex justify-center mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-400/10 border border-amber-400/30 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                Website Migrated
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 via-gray-900/70 to-gray-900/50 p-6 sm:p-8 shadow-xl shadow-emerald-900/20 relative overflow-hidden">
              {/* Top glow line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
              {/* Background shimmer */}
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

              {/* Header row */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl leading-none">🚀</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70 mb-0.5">Announcement</p>
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">New Course Website Available</h2>
                  <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                    We now have a new website for course access.
                  </p>
                </div>
              </div>

              {/* Main CTA Button */}
              <a
                href="https://pesles.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-700/50 mb-5 group"
              >
                <span>Go to New Website</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              </a>

              {/* New site link highlight */}
              <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                <a
                  href="https://pesles.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-300 font-semibold text-sm hover:text-emerald-200 underline underline-offset-2"
                >
                  https://pesles.vercel.app
                </a>
              </div>

              {/* Steps */}
              <ol className="space-y-2.5 text-xs text-gray-400 mb-4">
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold text-emerald-400 mt-0.5">1</span>
                  <span>Log in using your account at{' '}
                    <a href="https://pilis.onrender.com" className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300" target="_blank" rel="noopener noreferrer">pilis.onrender.com</a>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold text-emerald-400 mt-0.5">2</span>
                  <span>The system will automatically detect your account and log you in.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold text-emerald-400 mt-0.5">3</span>
                  <span>Go to <span className="text-white font-medium">Profile Settings</span> and connect your Discord account.</span>
                </li>
              </ol>

              {/* Support */}
              <div className="pt-3 border-t border-gray-700/60">
                <p className="text-xs text-gray-500 text-center">
                  Account denied or experiencing issues?{' '}
                  <a
                    href="https://t.me/centssupport"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    @centssupport
                  </a>{' '}on Telegram
                </p>
              </div>
            </div>
          </div>

          {/* Profile Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative group w-28 h-28 flex-shrink-0">
                <label htmlFor="avatar-upload" className="cursor-pointer block w-28 h-28">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-28 h-28 rounded-full object-cover border-4 border-gray-700 group-hover:border-emerald-500 transition-colors"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-4 border-transparent group-hover:border-emerald-400 transition-colors">
                      <User className="w-14 h-14 text-white" />
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {user.name || user.full_name}
                </h1>
                <p className="text-gray-400 mb-1">{user.email}</p>
                <p className="text-xs text-gray-500 mb-4">
                  Click your avatar to upload a profile picture (max 5MB)
                </p>
                {avatarError && (
                  <p className="text-xs text-red-400 mb-3">{avatarError}</p>
                )}

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
                <button
                  onClick={() => { setShowResetConfirm(true); setResetError(''); }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-900/40 hover:bg-orange-900/60 border border-orange-700/50 text-orange-400 rounded-lg transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  Reset Device
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
                {enrolledCourses.map((enrollment) => {
                  const courseOverrides: Record<string, { title?: string; thumbnail_url?: string }> = {
                    'fb-automation-mastery': {
                      title: 'Faceless Facebook Mastery',
                      thumbnail_url: '/thumbnails/facebook-mastery.png',
                    },
                  };
                  const overrides = courseOverrides[enrollment.courses.slug] || {};
                  const displayTitle = overrides.title ?? enrollment.courses.title;
                  const displayThumbnail = overrides.thumbnail_url ?? enrollment.courses.thumbnail_url;
                  return (
                  <button
                    key={enrollment.id}
                    onClick={() => router.push(`/courses/${enrollment.courses.slug}/learn`)}
                    className="group bg-gray-800/50 border border-gray-700 hover:border-emerald-500/50 rounded-xl overflow-hidden transition-all text-left"
                  >
                    <div className="aspect-video relative bg-gray-800">
                      {displayThumbnail ? (
                        <img
                          src={displayThumbnail}
                          alt={displayTitle}
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
                        {displayTitle}
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
                    </div>
                  </button>
                  );
                })}
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

      {/* Reset Device Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Reset Device Binding</h2>
            </div>

            <p className="text-gray-300 mb-2">
              This will <span className="text-orange-400 font-semibold">unlink your account from this device</span> and log you out.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              After resetting, you can log in from a new device and it will become your bound device. Only one device is allowed at a time.
            </p>

            {resetError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
                {resetError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={resettingDevice}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDevice}
                disabled={resettingDevice}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resettingDevice ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Resetting...
                  </>
                ) : (
                  'Yes, Reset Device'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
