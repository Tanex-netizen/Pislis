'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  UserCheck, 
  BookOpen, 
  Unlock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  User,
  Mail,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface UserResult {
  id: string;
  user_code: string;
  email: string;
  name: string;
  full_name?: string;
  role: string;
  created_at: string;
  enrollments: {
    id: string;
    status: string;
    courses: {
      id: string;
      title: string;
    };
  }[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export default function AdminUnlockPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [searching, setSearching] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check admin access - only redirect if we're sure they're not admin
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/admin');
      } else if (user && user.role !== 'admin') {
        router.push('/admin');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch courses on mount
  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchCourses();
    }
  }, [token, user]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setMessage(null);
    setSelectedUser(null);

    try {
      // Check if it looks like a user code
      const isUserCode = searchQuery.toUpperCase().startsWith('USR-');
      
      if (isUserCode) {
        // Search by exact user code
        const response = await fetch(`${API_BASE_URL}/admin/users/${searchQuery.toUpperCase()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSearchResults([data.user]);
          setSelectedUser(data.user);
        } else {
          setSearchResults([]);
          setMessage({ type: 'error', text: 'User not found' });
        }
      } else {
        // Search by email
        const response = await fetch(`${API_BASE_URL}/admin/users?search=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.users || []);
          if (data.users?.length === 0) {
            setMessage({ type: 'error', text: 'No users found' });
          }
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setMessage({ type: 'error', text: 'Search failed. Please try again.' });
    } finally {
      setSearching(false);
    }
  };

  const unlockCourse = async () => {
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Please select a user' });
      return;
    }

    // Use the first available course
    const firstCourse = courses[0];
    if (!firstCourse) {
      setMessage({ type: 'error', text: 'No courses available' });
      return;
    }

    // Check if already enrolled
    const alreadyEnrolled = selectedUser.enrollments?.some(
      e => e.courses?.id === firstCourse.id && e.status === 'active'
    );

    if (alreadyEnrolled) {
      setMessage({ type: 'error', text: 'User is already enrolled in this course' });
      return;
    }

    setUnlocking(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/unlock-course`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          courseId: firstCourse.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Course unlocked for ${selectedUser.name || selectedUser.full_name}!` });
        
        // Refresh user data to show updated enrollments
        if (selectedUser.user_code) {
          const refreshResponse = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.user_code}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setSelectedUser(refreshData.user);
          }
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to unlock course' });
      }
    } catch (error) {
      console.error('Unlock failed:', error);
      setMessage({ type: 'error', text: 'Failed to unlock course. Please try again.' });
    } finally {
      setUnlocking(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <h1 className="text-xl font-bold text-white">Unlock Course Access</h1>
          </div>
          <div className="text-sm text-gray-400">
            Logged in as {user.email}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Search Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-500" />
              Find User
            </h2>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                placeholder="Enter User ID (USR-XXXXXX) or email..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                onClick={searchUsers}
                disabled={searching || !searchQuery.trim()}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && !selectedUser && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-3">Select a user:</p>
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedUser(result)}
                    className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{result.name || result.full_name}</p>
                        <p className="text-sm text-gray-400">{result.email}</p>
                      </div>
                      <span className="text-emerald-400 font-mono text-sm">
                        {result.user_code}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected User Card */}
            {selectedUser && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{selectedUser.name || selectedUser.full_name}</h3>
                      <p className="text-xl font-mono text-emerald-400">{selectedUser.user_code}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setSearchResults([]);
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    {selectedUser.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(selectedUser.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Current Enrollments */}
                {selectedUser.enrollments && selectedUser.enrollments.length > 0 && (
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <p className="text-sm text-gray-400 mb-2">Current enrollments:</p>
                    <div className="space-y-2">
                      {selectedUser.enrollments.map((enrollment) => (
                        <div 
                          key={enrollment.id}
                          className="flex items-center justify-between px-3 py-2 bg-gray-900/50 rounded-lg"
                        >
                          <span className="text-sm text-gray-300">
                            {enrollment.courses?.title || 'Unknown Course'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            enrollment.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {enrollment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unlock Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-500" />
              Grant Course Access
            </h2>

            {selectedUser ? (
              <div className="space-y-4">
                {/* Unlock Button */}
                <button
                  onClick={unlockCourse}
                  disabled={unlocking || courses.length === 0}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {unlocking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5" />
                      Grant Course for {(selectedUser.name || selectedUser.full_name || '').split(' ')[0]}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">
                  Search for a user first to grant course access
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 text-gray-400 mb-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">Total Courses</span>
            </div>
            <p className="text-2xl font-bold text-white">{courses.length}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
