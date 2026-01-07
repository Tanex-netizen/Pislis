'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  price: number;
}

function EnrollForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseIdParam = searchParams.get('course');
  const { user, token, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  // Check if user is already enrolled
  useEffect(() => {
    async function checkEnrollment() {
      if (!isAuthenticated || !token) {
        setCheckingEnrollment(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/my-courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Check if user has any enrollments
          if (data.enrollments && data.enrollments.length > 0) {
            setIsEnrolled(true);
          }
        }
      } catch (err) {
        console.error('Error checking enrollment:', err);
      } finally {
        setCheckingEnrollment(false);
      }
    }

    checkEnrollment();
  }, [isAuthenticated, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit enrollment');
      }

      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show already enrolled message
  if (checkingEnrollment) {
    return (
      <>
        <Navbar />
        <div className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-4">
          <div className="max-w-lg mx-auto text-center">
            <Loader2 className="w-12 h-12 text-emerald-500 mx-auto animate-spin" />
            <p className="text-gray-400 mt-4">Checking enrollment status...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isEnrolled) {
    return (
      <>
        <Navbar />
        <div className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-4">
          <div className="max-w-lg mx-auto">
            <div className="card p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">You're Already Enrolled!</h1>
              <p className="text-sm sm:text-base text-gray-400 mb-6">
                You already have active course enrollments. Visit your profile to access your courses and continue learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/profile')}
                  className="btn-primary inline-block text-sm sm:text-base"
                >
                  Go to My Profile
                </button>
                <button
                  onClick={() => router.push('/courses')}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
                >
                  Browse Courses
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-4">
          <div className="max-w-lg mx-auto">
            <div className="card p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Enrollment Request Received!</h1>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                Your enrollment request has been submitted. Please contact us on Telegram to complete your payment and get your course unlocked.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-4 sm:mb-6">
                <p className="text-sm text-emerald-400 font-semibold mb-2">Next Steps:</p>
                <ol className="text-xs sm:text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Log in to see your Student ID on your profile</li>
                  <li>Contact us on Telegram with your Student ID</li>
                  <li>Complete payment via your preferred method</li>
                  <li>We'll unlock your course immediately!</li>
                </ol>
              </div>
              <a href="/" className="btn-primary inline-block text-sm sm:text-base">
                Back to Home
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-3 sm:mb-4">
              Enroll in a Course
            </h1>
            <p className="text-sm sm:text-base text-gray-400 px-4 mb-4">
              Submit your interest and we'll contact you on Telegram to complete enrollment
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <span className="text-sm text-emerald-400">📱 Payment via Telegram • Quick & Easy</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card p-4 sm:p-6 md:p-8">
            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
              <div>
                <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Juan Dela Cruz"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-dark-400 border border-primary-900/30 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="juan@example.com"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-dark-400 border border-primary-900/30 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="mb-5 sm:mb-6">
              <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                Phone Number / Telegram <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+63 912 345 6789 or @telegram_username"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-dark-400 border border-primary-900/30 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                required
              />
              <p className="text-xs text-gray-500 mt-1">We'll use this to contact you on Telegram for payment</p>
            </div>

            {/* How It Works */}
            <div className="p-3 sm:p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-5 sm:mb-6">
              <h4 className="text-emerald-400 font-medium mb-3 text-sm sm:text-base">How It Works:</h4>
              <div className="space-y-2 text-gray-300 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">1</span>
                  <p>Submit this form with your details</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">2</span>
                  <p>Create an account and get your unique Student ID</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">3</span>
                  <p>Contact us on Telegram with your Student ID</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">4</span>
                  <p>Complete payment via GCash, Bank, or PayPal</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">5</span>
                  <p>We unlock your course instantly!</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-3 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Interest</span>
              )}
            </button>

            <p className="text-gray-500 text-xs sm:text-sm text-center mt-4">
              No payment needed now • Complete payment via Telegram
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

function LoadingFallback() {
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function EnrollPage() {
  return (
    <main className="min-h-screen bg-dark-500">
      <Suspense fallback={<LoadingFallback />}>
        <EnrollForm />
      </Suspense>
    </main>
  );
}
