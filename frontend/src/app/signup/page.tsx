'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Copy, Check } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';
  
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Success state - show user code
  const [success, setSuccess] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Redirect if already authenticated (unless just signed up)
  useEffect(() => {
    if (!authLoading && isAuthenticated && !success) {
      router.push(redirect);
    }
  }, [authLoading, isAuthenticated, router, redirect, success]);

  const copyUserCode = async () => {
    await navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await signup(email, password, fullName);

    if (result.success && result.user_code) {
      setUserCode(result.user_code);
      setSuccess(true);
    } else {
      setError(result.error || 'Signup failed');
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // Success screen - show user code prominently
  if (success) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-950 pt-24 pb-16 flex items-center justify-center">
          <div className="w-full max-w-md px-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">Account Created!</h1>
              <p className="text-gray-400 mb-6">Welcome to Darwin Education</p>

              {/* User Code */}
              <div className="bg-gray-800/50 border border-emerald-700 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-400 mb-2">Your Student ID</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-mono font-bold text-emerald-400">
                    {userCode}
                  </span>
                  <button
                    onClick={copyUserCode}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-emerald-400 mt-3 font-medium">
                  Keep this ID — the admin will use it to approve/unlock your access.
                </p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-emerald-400 font-semibold mb-2">Access & Approval</p>
                <p className="text-xs text-gray-400">
                  Once you login, your account is created with a Student ID. Courses become available after an admin approves/unlocks them.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href={redirect}
                  className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Continue
                </Link>
                <Link
                  href="/courses"
                  className="block w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-950 pt-24 pb-16 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-400">Join Darwin Education today</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-sm text-gray-500">Already have an account?</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Login Link */}
            <Link
              href={`/login${redirect !== '/profile' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="block w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Log In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
