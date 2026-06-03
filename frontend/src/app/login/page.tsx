'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, MessageCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';
  
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirect);
    }
  }, [authLoading, isAuthenticated, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'Login failed');
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-950 pt-24 pb-16 flex items-start justify-center">
        <div className="w-full max-w-md px-4 mt-4">

          {/* ── Migration Announcement ── */}
          <div className="mb-5 relative">
            {/* Badge */}
            <div className="flex justify-center mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-400/10 border border-amber-400/30 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                Website Migrated
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/60 via-gray-900/80 to-gray-900/60 p-6 shadow-lg shadow-emerald-900/20 backdrop-blur-sm">
              {/* Glow accent */}
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl leading-none">🚀</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70 mb-0.5">Announcement</p>
                  <h2 className="text-base font-bold text-white leading-tight">New Course Website Available</h2>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                We now have a new website for course access.
              </p>

              {/* CTA Button */}
              <a
                href="https://pesles.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all duration-200 shadow-md shadow-emerald-900/40 hover:shadow-emerald-700/50 mb-4 group"
              >
                <span>Go to New Website</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              </a>

              {/* Steps */}
              <ol className="space-y-2 text-xs text-gray-400">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold text-emerald-400">1</span>
                  Log in using your account at{' '}
                  <a href="https://pilis.onrender.com" className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300" target="_blank" rel="noopener noreferrer">pilis.onrender.com</a>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold text-emerald-400">2</span>
                  The system will automatically detect and log you in.
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold text-emerald-400">3</span>
                  Go to <span className="text-white font-medium">Profile Settings</span> and connect your Discord account.
                </li>
              </ol>

              {/* Support */}
              <div className="mt-4 pt-3 border-t border-gray-700/60">
                <p className="text-xs text-gray-500 text-center">
                  Issues or denied access?{' '}
                  <a
                    href="https://t.me/centssupport"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 font-medium"
                  >
                    @centssupport
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Log in to access your courses</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-sm text-gray-500">Don&apos;t have an account?</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Sign Up Link */}
            <Link
              href={`/signup${redirect !== '/profile' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="block w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Create Account
            </Link>

            {/* Telegram Free Community Link */}
            <a
              href="https://t.me/+MaOIiu5SXVhlZGE9"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Free Community
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
