'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, BookOpen, Clock, CheckCircle, XCircle, 
  Eye, Mail, MoreVertical, Search, Filter,
  LogOut, Menu, X, AlertCircle, Loader2, Unlock
} from 'lucide-react';

interface Enrollment {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  transaction_id?: string;
  payment_proof_url?: string;
  courses?: {
    id: string;
    title: string;
    price: number;
  };
}

interface Stats {
  pendingEnrollments: number;
  approvedEnrollments: number;
  totalCourses: number;
  totalStudents: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { login, user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<Stats>({
    pendingEnrollments: 0,
    approvedEnrollments: 0,
    totalCourses: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check authentication on mount and when user changes
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user?.role === 'admin') {
        fetchData();
      } else if (isAuthenticated && user?.role !== 'admin') {
        setLoginError('Admin access required. Please login with an admin account.');
        logout();
      }
    }
  }, [authLoading, isAuthenticated, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const result = await login(loginData.email, loginData.password);

      if (result.success) {
        // Wait a moment for user state to update, then check
        setTimeout(() => {
          setLoginLoading(false);
        }, 100);
      } else {
        setLoginError(result.error || 'Login failed');
        setLoginLoading(false);
      }
    } catch (error) {
      setLoginError('Login failed');
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Demo data
      setStats({
        pendingEnrollments: 5,
        approvedEnrollments: 48,
        totalCourses: 6,
        totalStudents: 53,
      });

      setEnrollments([
        {
          id: '1',
          name: 'Juan Dela Cruz',
          email: 'juan@example.com',
          phone: '+63 912 345 6789',
          status: 'pending',
          created_at: new Date().toISOString(),
          transaction_id: 'TXN123456',
          courses: { id: '1', title: 'Web Development Fundamentals', price: 2999 },
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@example.com',
          phone: '+63 923 456 7890',
          status: 'pending',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          transaction_id: 'TXN789012',
          courses: { id: '2', title: 'Advanced React & Next.js', price: 3999 },
        },
        {
          id: '3',
          name: 'Carlos Rodriguez',
          email: 'carlos@example.com',
          phone: '+63 934 567 8901',
          status: 'approved',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          transaction_id: 'TXN345678',
          courses: { id: '3', title: 'UI/UX Design Masterclass', price: 3499 },
        },
        {
          id: '4',
          name: 'Ana Garcia',
          email: 'ana@example.com',
          phone: '+63 945 678 9012',
          status: 'rejected',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          courses: { id: '4', title: 'Digital Marketing Essentials', price: 2499 },
        },
        {
          id: '5',
          name: 'Pedro Reyes',
          email: 'pedro@example.com',
          phone: '+63 956 789 0123',
          status: 'pending',
          created_at: new Date(Date.now() - 43200000).toISOString(),
          transaction_id: 'TXN901234',
          courses: { id: '5', title: 'Data Science with Python', price: 4499 },
        },
      ]);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEnrollments(prev => 
        prev.map(e => e.id === enrollmentId ? { ...e, status: 'approved' as const } : e)
      );
      setStats(prev => ({
        ...prev,
        pendingEnrollments: prev.pendingEnrollments - 1,
        approvedEnrollments: prev.approvedEnrollments + 1,
        totalStudents: prev.totalStudents + 1,
      }));
      setSelectedEnrollment(null);
      
      alert('Enrollment approved! Access link sent to student email.');
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (enrollmentId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    setActionLoading(enrollmentId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEnrollments(prev => 
        prev.map(e => e.id === enrollmentId ? { ...e, status: 'rejected' as const } : e)
      );
      setStats(prev => ({
        ...prev,
        pendingEnrollments: prev.pendingEnrollments - 1,
      }));
      setSelectedEnrollment(null);
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
    const matchesSearch = 
      enrollment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">Pending</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">Rejected</span>;
      default:
        return null;
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-gray-400 mt-2">Darwin Education Dashboard</p>
          </div>

          {loginError && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-400 text-sm">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Email</label>
              <input
                type=" || user?.role !== 'admin'email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="pisliskontint@gmail.com"
                className="w-full px-4 py-3 bg-dark-400 border border-primary-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-dark-400 border border-primary-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loginLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            Demo: pisliskontint@gmail.com / Pislis@123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-500 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-400 border-r border-primary-900/30 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-primary-900/30">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Darwin Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-primary-500/10 text-primary-400 rounded-lg">
            <Users className="w-5 h-5" />
            <span>Enrollments</span>
          </a>
          <Link href="/admin/unlock" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-dark-300 rounded-lg transition-colors">
            <Unlock className="w-5 h-5" />
            <span>Unlock Course</span>
          </Link>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-dark-300 rounded-lg transition-colors">
            <BookOpen className="w-5 h-5" />
            <span>Courses</span>
          </a>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-900/30">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 w-full rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="bg-dark-400 border-b border-primary-900/30 p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm hidden sm:block">Welcome, Admin</span>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.pendingEnrollments}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Approved</p>
                  <p className="text-3xl font-bold text-green-400">{stats.approvedEnrollments}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-primary-400">{stats.totalStudents}</p>
                </div>
                <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-400" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Courses</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.totalCourses}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Enrollments Table */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-white">Enrollment Requests</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-dark-400 border border-primary-900/30 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-dark-400 border border-primary-900/30 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-900/30">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Student</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm hidden md:table-cell">Course</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm hidden sm:table-cell">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No enrollments found
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="border-b border-primary-900/20 hover:bg-dark-400/50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">{enrollment.name}</p>
                            <p className="text-gray-500 text-sm">{enrollment.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          <p className="text-gray-300 text-sm">{enrollment.courses?.title}</p>
                          <p className="text-primary-400 text-sm">₱{enrollment.courses?.price.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-4 hidden sm:table-cell">
                          <p className="text-gray-400 text-sm">
                            {new Date(enrollment.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(enrollment.status)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedEnrollment(enrollment)}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {enrollment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(enrollment.id)}
                                  disabled={actionLoading === enrollment.id}
                                  className="p-2 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                                  title="Approve"
                                >
                                  {actionLoading === enrollment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleReject(enrollment.id)}
                                  disabled={actionLoading === enrollment.id}
                                  className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {enrollment.status === 'approved' && (
                              <button
                                className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                                title="Resend Link"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Enrollment Detail Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Enrollment Details</h3>
              <button onClick={() => setSelectedEnrollment(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                {getStatusBadge(selectedEnrollment.status)}
              </div>
              <div className="border-b border-primary-900/30 pb-4">
                <p className="text-gray-400 text-sm">Student</p>
                <p className="text-white font-medium">{selectedEnrollment.name}</p>
                <p className="text-gray-300">{selectedEnrollment.email}</p>
                <p className="text-gray-300">{selectedEnrollment.phone}</p>
              </div>
              <div className="border-b border-primary-900/30 pb-4">
                <p className="text-gray-400 text-sm">Course</p>
                <p className="text-white font-medium">{selectedEnrollment.courses?.title}</p>
                <p className="text-primary-400 font-bold">₱{selectedEnrollment.courses?.price.toLocaleString()}</p>
              </div>
              {selectedEnrollment.transaction_id && (
                <div className="border-b border-primary-900/30 pb-4">
                  <p className="text-gray-400 text-sm">Transaction ID</p>
                  <p className="text-white font-mono">{selectedEnrollment.transaction_id}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm">Submitted</p>
                <p className="text-white">{new Date(selectedEnrollment.created_at).toLocaleString()}</p>
              </div>

              {/* Payment Proof Placeholder */}
              <div className="p-4 bg-dark-400/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Payment Proof</p>
                <div className="aspect-video bg-dark-500 rounded-lg flex items-center justify-center border border-primary-900/30">
                  <p className="text-gray-500">Payment proof image would appear here</p>
                </div>
              </div>

              {/* Actions */}
              {selectedEnrollment.status === 'pending' && (
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => handleApprove(selectedEnrollment.id)}
                    disabled={actionLoading === selectedEnrollment.id}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    {actionLoading === selectedEnrollment.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(selectedEnrollment.id)}
                    disabled={actionLoading === selectedEnrollment.id}
                    className="flex-1 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
