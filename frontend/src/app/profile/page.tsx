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
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null);

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
                      thumbnail_url: 'https://res.cloudinary.com/dwcxvaswf/image/upload/v1774255173/Faceless_Facebook_Mastery_uhlstt.png',
                    },
                  };
                  const overrides = courseOverrides[enrollment.courses.slug] || {};
                  const displayTitle = overrides.title ?? enrollment.courses.title;
                  const displayThumbnail = overrides.thumbnail_url ?? enrollment.courses.thumbnail_url;
                  return (
                  <button
                    key={enrollment.id}
                    onClick={() => setSelectedCourse(enrollment)}
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

      {/* Course Introduction Modal */}
      {selectedCourse && (() => {
        const modalOverrides: Record<string, { title?: string }> = {
          'fb-automation-mastery': { title: 'Faceless Facebook Mastery' },
        };
        const modalOverride = modalOverrides[selectedCourse.courses.slug] || {};
        const modalTitle = modalOverride.title ?? selectedCourse.courses.title;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white truncate pr-4">
                {modalTitle}
              </h2>
              <button
                onClick={() => setSelectedCourse(null)}
                className="flex-shrink-0 p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Introduction Video */}
            <div className="mx-6 mt-6 aspect-video rounded-xl overflow-hidden relative bg-gray-800">
              <video
                className="w-full h-full object-cover"
                controls
                poster="https://res.cloudinary.com/dwcxvaswf/image/upload/v1774256591/INTRODUCTION_ps5yc0.png"
                preload="none"
              >
                <source src="https://res.cloudinary.com/dwcxvaswf/video/upload/v1774259279/INTRODUCTION_VIDEO_v57yde.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Course Info */}
            <div className="px-6 py-5">
              <p className="text-white font-semibold text-sm mb-6 tracking-wide uppercase">
                Introduction Video
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
                <Link
                  href={`/courses/${selectedCourse.courses.slug}/learn`}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-center"
                  onClick={() => setSelectedCourse(null)}
                >
                  Continue Learning
                </Link>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

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
