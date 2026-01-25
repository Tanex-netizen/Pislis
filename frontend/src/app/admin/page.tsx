'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, BookOpen, Clock, CheckCircle, XCircle, 
  Eye, Mail, MoreVertical, Search, Filter,
  LogOut, Menu, X, AlertCircle, Loader2, Unlock, DollarSign, Calendar, Smartphone
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Enrollment {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected' | string;
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

interface AdminUser {
  id: string;
  user_code: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  created_at: string;
  last_login?: string | null;
  pending_enrollments?: number;
  approved_enrollments?: number;
  total_enrollments?: number;
  enrollments?: Array<{
    id: string;
    status: string;
    course_id: string;
    courses?: { id: string; title: string };
  }>;
}

interface MonthlyPayment {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  approved_at: string;
  monthly_payment_amount: number;
  last_payment_date: string | null;
  next_payment_due: string | null;
  monthly_payment_status: 'paid' | 'pending' | 'overdue';
  days_remaining: number | null;
  is_overdue: boolean;
  courses?: { id: string; title: string };
  users?: { id: string; user_code: string; name: string; email: string };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { login, user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
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
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [recentLogins, setRecentLogins] = useState<AdminUser[]>([]);
  const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPayment[]>([]);
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<string>('all');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');

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
      if (!token) {
        setEnrollments([]);
        setRecentLogins([]);
        setMonthlyPayments([]);
        setStats({
          pendingEnrollments: 0,
          approvedEnrollments: 0,
          totalCourses: 0,
          totalStudents: 0,
        });
        return;
      }

      const [enrollmentsRes, coursesRes, usersRes, recentLoginsRes, monthlyPaymentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/enrollments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/admin/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/admin/users?limit=100&page=1&includeEnrollments=true`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/admin/monthly-payments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const enrollmentsData = enrollmentsRes.ok ? await enrollmentsRes.json() : { enrollments: [] };
      const coursesData = coursesRes.ok ? await coursesRes.json() : { courses: [] };
      const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
      const recentLoginsData = recentLoginsRes.ok ? await recentLoginsRes.json() : { users: [] };
      const monthlyPaymentsData = monthlyPaymentsRes.ok ? await monthlyPaymentsRes.json() : { payments: [] };

      setMonthlyPayments(monthlyPaymentsData.payments || []);

      const fetchedEnrollments: Enrollment[] = (enrollmentsData.enrollments || []).map((e: Partial<Enrollment>) => ({
        ...(e as Enrollment),
        name: e.name || 'Unknown',
        email: (e.email || '').toLowerCase(),
        phone: e.phone || '',
      }));

      setEnrollments(fetchedEnrollments);

      const mappedLogins = (recentLoginsData.users || []).map((u: Partial<AdminUser>) => ({
        id: String(u.id || ''),
        user_code: String(u.user_code || ''),
        name: String(u.name || 'Unknown'),
        email: String((u.email || '')).toLowerCase(),
        phone: u.phone ?? null,
        role: String(u.role || 'student'),
        created_at: String(u.created_at || ''),
        last_login: u.last_login ?? null,
        pending_enrollments: u.pending_enrollments || 0,
        approved_enrollments: u.approved_enrollments || 0,
        total_enrollments: u.total_enrollments || 0,
        enrollments: u.enrollments || [],
      }));

      setRecentLogins(mappedLogins);

      // Count students based on their approval status
      const students = mappedLogins.filter((u: AdminUser) => u.role === 'student');
      const pendingEnrollments = students.filter((u: AdminUser) => (u.approved_enrollments || 0) === 0).length;
      const approvedEnrollments = students.filter((u: AdminUser) => (u.approved_enrollments || 0) > 0).length;
      const totalCourses = (coursesData.courses || []).length;
      const totalStudents = students.length;

      setStats({
        pendingEnrollments,
        approvedEnrollments,
        totalCourses,
        totalStudents,
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      if (!token) {
        throw new Error('Missing admin token');
      }

      const response = await fetch(`${API_BASE_URL}/admin/enrollments/${enrollmentId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresInDays: 365 }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve enrollment');
      }

      setSelectedEnrollment(null);
      await fetchData();
      alert(data.accessUrl ? `Enrollment approved. Access URL: ${data.accessUrl}` : 'Enrollment approved.');
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
      if (!token) {
        throw new Error('Missing admin token');
      }

      const response = await fetch(`${API_BASE_URL}/admin/enrollments/${enrollmentId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason || undefined }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject enrollment');
      }

      setSelectedEnrollment(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendLink = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      if (!token) {
        throw new Error('Missing admin token');
      }

      const response = await fetch(`${API_BASE_URL}/admin/enrollments/${enrollmentId}/resend-link`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend link');
      }

      alert('Access link resent.');
    } catch (err) {
      console.error('Failed to resend link:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      if (!token) {
        throw new Error('Missing admin token');
      }

      const response = await fetch(`${API_BASE_URL}/admin/monthly-payments/${enrollmentId}/mark-paid`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as paid');
      }

      alert(data.message || 'Payment marked as paid');
      await fetchData();
    } catch (err) {
      console.error('Failed to mark as paid:', err);
      alert('Failed to mark as paid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkUnpaid = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      if (!token) {
        throw new Error('Missing admin token');
      }

      const response = await fetch(`${API_BASE_URL}/admin/monthly-payments/${enrollmentId}/mark-unpaid`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as unpaid');
      }

      alert(data.message || 'Payment marked as unpaid');
      await fetchData();
    } catch (err) {
      console.error('Failed to mark as unpaid:', err);
      alert('Failed to mark as unpaid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetDevice = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to reset the device binding for ${userName}? This will allow them to login from a new device.`)) {
      return;
    }
    
    setActionLoading(`device-${userId}`);
    try {
      if (!token) {
        throw new Error('Missing admin token');
      }

      const response = await fetch(`${API_BASE_URL}/auth/reset-device/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset device');
      }

      alert(data.message || 'Device binding reset successfully');
    } catch (err: any) {
      console.error('Failed to reset device:', err);
      alert(err.message || 'Failed to reset device');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
    const matchesSearch = 
      (enrollment.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enrollment.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const normalizedStudentSearch = studentSearchQuery.trim().toLowerCase();
  const filteredStudents = !normalizedStudentSearch
    ? recentLogins
    : recentLogins.filter((u) => {
        const name = (u.name || '').toLowerCase();
        const userCode = (u.user_code || '').toLowerCase();
        return name.includes(normalizedStudentSearch) || userCode.includes(normalizedStudentSearch);
      });

  const normalizedPaymentSearch = paymentSearchQuery.trim().toLowerCase();
  const filteredPayments = monthlyPayments.filter((p) => {
    const matchesStatus = paymentFilterStatus === 'all' || p.monthly_payment_status === paymentFilterStatus;
    const matchesSearch = !normalizedPaymentSearch || 
      (p.name || '').toLowerCase().includes(normalizedPaymentSearch) ||
      (p.email || '').toLowerCase().includes(normalizedPaymentSearch) ||
      (p.users?.user_code || '').toLowerCase().includes(normalizedPaymentSearch);
    return matchesStatus && matchesSearch;
  });

  const getPaymentStatusBadge = (status: string, daysRemaining: number | null) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Paid</span>;
      case 'overdue':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">Overdue</span>;
      case 'pending':
        return (
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            daysRemaining !== null && daysRemaining <= 5 
              ? 'bg-orange-500/20 text-orange-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {daysRemaining !== null && daysRemaining <= 5 ? 'Due Soon' : 'Pending'}
          </span>
        );
      default:
        return null;
    }
  };

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
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="Enter admin email"
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
          <a href="#monthly-payments" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-dark-300 rounded-lg transition-colors">
            <DollarSign className="w-5 h-5" />
            <span>Monthly Payments</span>
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

          {/* All Students */}
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">All Students</h2>
              <span className="text-sm text-gray-400">
                {filteredStudents.length} student{filteredStudents.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Search by name or Student ID (USR-XXXXXX)"
                  className="w-full pl-12 pr-4 py-3 bg-dark-400 border border-primary-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-900/30">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Student</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm hidden md:table-cell">Email</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm hidden lg:table-cell">Phone</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm hidden xl:table-cell">Last Login</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        {normalizedStudentSearch ? 'No matching students found' : 'No login activity yet'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((u) => (
                      <tr key={u.id} className="border-b border-primary-900/20 hover:bg-dark-300/30">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.user_code}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-300 text-sm hidden md:table-cell">{u.email}</td>
                        <td className="py-4 px-4 text-gray-300 text-sm hidden lg:table-cell">{u.phone || '-'}</td>
                        <td className="py-4 px-4 text-gray-300 text-sm hidden xl:table-cell">
                          {u.last_login ? new Date(u.last_login).toLocaleString() : '-'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {u.pending_enrollments && u.pending_enrollments > 0 ? (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">
                                {u.pending_enrollments} Pending
                              </span>
                            ) : null}
                            {u.approved_enrollments && u.approved_enrollments > 0 ? (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                                {u.approved_enrollments} Active
                              </span>
                            ) : null}
                            {(!u.total_enrollments || u.total_enrollments === 0) ? (
                              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded">
                                No Courses
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <button
                              onClick={() => handleResetDevice(u.id, u.name)}
                              disabled={actionLoading === `device-${u.id}`}
                              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                              title="Reset device binding - allows user to login from a new device"
                            >
                              {actionLoading === `device-${u.id}` ? (
                                <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                              ) : (
                                <Smartphone className="w-3 h-3 inline mr-1" />
                              )}
                              Reset Device
                            </button>
                            <Link
                              href={`/admin/unlock?userId=${u.id}&userCode=${u.user_code}`}
                              className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded transition-colors"
                            >
                              <Unlock className="w-3 h-3 inline mr-1" />
                              Unlock
                            </Link>
                            {u.enrollments && u.enrollments.length > 0 ? (
                              u.enrollments.map((enrollment) => (
                                <div key={enrollment.id} className="flex items-center gap-1">
                                  {enrollment.status === 'pending' ? (
                                    <>
                                      <button
                                        onClick={() => handleApprove(enrollment.id)}
                                        disabled={actionLoading === enrollment.id}
                                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                                        title={`Approve: ${enrollment.courses?.title || 'Course'}`}
                                      >
                                        <CheckCircle className="w-3 h-3 inline mr-0.5" />
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleReject(enrollment.id)}
                                        disabled={actionLoading === enrollment.id}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                                        title={`Reject: ${enrollment.courses?.title || 'Course'}`}
                                      >
                                        <XCircle className="w-3 h-3 inline mr-0.5" />
                                        Reject
                                      </button>
                                    </>
                                  ) : enrollment.status === 'approved' || enrollment.status === 'active' ? (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded" title={enrollment.courses?.title || 'Course'}>
                                      ✓ Approved
                                    </span>
                                  ) : enrollment.status === 'rejected' ? (
                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded" title={enrollment.courses?.title || 'Course'}>
                                      ✗ Rejected
                                    </span>
                                  ) : null}
                                </div>
                              ))
                            ) : (
                              <span className="px-2 py-1 bg-gray-600/50 text-gray-400 text-xs rounded">
                                No enrollments
                              </span>
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

          {/* Monthly Payments Section */}
          <div id="monthly-payments" className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Monthly Payments</h2>
                  <p className="text-sm text-gray-400">₱100/month per student</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">
                {filteredPayments.length} record{filteredPayments.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={paymentSearchQuery}
                  onChange={(e) => setPaymentSearchQuery(e.target.value)}
                  placeholder="Search by name, email or Student ID"
                  className="w-full pl-12 pr-4 py-3 bg-dark-400 border border-primary-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>
              <select
                value={paymentFilterStatus}
                onChange={(e) => setPaymentFilterStatus(e.target.value)}
                className="px-4 py-3 bg-dark-400 border border-primary-900/30 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-900/30">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Student</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm hidden md:table-cell">Course</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Timer</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm hidden lg:table-cell">Last Paid</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        {normalizedPaymentSearch || paymentFilterStatus !== 'all' 
                          ? 'No matching payments found' 
                          : 'No approved enrollments yet'}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="border-b border-primary-900/20 hover:bg-dark-300/30">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">{p.users?.name || p.name}</p>
                            <p className="text-xs text-gray-500">{p.users?.user_code || p.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-300 text-sm hidden md:table-cell">
                          {p.courses?.title || '-'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {p.days_remaining !== null ? (
                              <span className={`font-medium ${
                                p.is_overdue 
                                  ? 'text-red-400' 
                                  : p.days_remaining <= 5 
                                    ? 'text-orange-400' 
                                    : 'text-gray-300'
                              }`}>
                                {p.is_overdue 
                                  ? `${Math.abs(p.days_remaining)} days overdue` 
                                  : `${p.days_remaining} days left`}
                              </span>
                            ) : (
                              <span className="text-gray-500">Not set</span>
                            )}
                          </div>
                          {p.next_payment_due && (
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {new Date(p.next_payment_due).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {getPaymentStatusBadge(p.monthly_payment_status, p.days_remaining)}
                        </td>
                        <td className="py-4 px-4 text-gray-300 text-sm hidden lg:table-cell">
                          {p.last_payment_date 
                            ? new Date(p.last_payment_date).toLocaleDateString() 
                            : '-'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {p.monthly_payment_status === 'paid' ? (
                              <button
                                onClick={() => handleMarkUnpaid(p.id)}
                                disabled={actionLoading === p.id}
                                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                              >
                                {actionLoading === p.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Mark Unpaid'
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleMarkPaid(p.id)}
                                disabled={actionLoading === p.id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                              >
                                {actionLoading === p.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-3 h-3 inline mr-1" />
                                    Mark Paid
                                  </>
                                )}
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
                <p className="text-white font-medium">{selectedEnrollment.courses?.title || 'Not specified'}</p>
                {typeof selectedEnrollment.courses?.price === 'number' && (
                  <p className="text-primary-400 font-bold">₱{selectedEnrollment.courses.price.toLocaleString()}</p>
                )}
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
                  {selectedEnrollment.payment_proof_url ? (
                    <a
                      href={selectedEnrollment.payment_proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-400 hover:text-primary-300"
                    >
                      View payment proof
                    </a>
                  ) : (
                    <p className="text-gray-500">No payment proof uploaded</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedEnrollment.status === 'pending' && (
                <div className="flex space-x-4 pt-4">
                  {selectedEnrollment.courses?.id && (
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
                  )}
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
