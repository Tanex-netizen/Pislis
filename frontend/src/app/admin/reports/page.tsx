'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, BarChart2, History, Unlock, LogOut, Menu, X, TrendingUp, CheckCircle, Clock, Lock, Loader2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ReportsPage() {
  const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.push('/admin');
      } else {
        fetchData();
      }
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (statsRes.ok) setStats((await statsRes.json()).stats);
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  const SidebarLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
    <Link href={href} className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-dark-300 rounded-lg transition-colors">
      <Icon className="w-5 h-5" /><span>{label}</span>
    </Link>
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  // Build monthly bar data from daily data
  const monthlyData: Record<string, number> = {};
  (analytics?.dailyData || []).forEach((d: any) => {
    const month = d.date.substring(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + d.approvals;
  });
  const barData = Object.entries(monthlyData).map(([month, count]) => ({ month, approvals: count }));

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
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><X className="w-6 h-6" /></button>
        </div>
        <nav className="p-4 space-y-2">
          <SidebarLink href="/admin" icon={Users} label="Enrollments" />
          <SidebarLink href="/admin#monthly-payments" icon={CheckCircle} label="Monthly Payments" />
          <SidebarLink href="/admin/unlock" icon={Unlock} label="Unlock Course" />
          <Link href="/admin/reports" className="flex items-center space-x-3 px-4 py-3 bg-primary-500/10 text-primary-400 rounded-lg">
            <BarChart2 className="w-5 h-5" /><span>Reports</span>
          </Link>
          <SidebarLink href="/admin/history" icon={History} label="History" />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-900/30">
          <button onClick={logout} className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 w-full rounded-lg transition-colors">
            <LogOut className="w-5 h-5" /><span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        <header className="bg-dark-400 border-b border-primary-900/30 p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400"><Menu className="w-6 h-6" /></button>
          <h1 className="text-xl font-bold text-white">Reports & Analytics</h1>
          <span className="text-gray-400 text-sm hidden sm:block">Last 30 Days</span>
        </header>

        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Today Approvals', value: stats?.todayApprovals ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
              { label: 'This Week', value: stats?.weekApprovals ?? 0, color: 'text-orange-400', bg: 'bg-orange-500/10', icon: TrendingUp },
              { label: 'This Month', value: stats?.monthApprovals ?? 0, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: BarChart2 },
              { label: 'Total Students', value: stats?.totalStudents ?? 0, color: 'text-primary-400', bg: 'bg-primary-500/10', icon: Users },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  </div>
                  <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status Breakdown */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart */}
            <div className="card">
              <h2 className="text-white font-bold mb-4">Enrollment Status Breakdown</h2>
              {analytics?.statusBreakdown ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={analytics.statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                      {analytics.statusBreakdown.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #1a4731', borderRadius: 8, color: '#fff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-60 flex items-center justify-center text-gray-500">No data</div>}
            </div>

            {/* Monthly Bar */}
            <div className="card">
              <h2 className="text-white font-bold mb-4">Monthly Approvals</h2>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a4731" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #1a4731', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="approvals" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-60 flex items-center justify-center text-gray-500">No data</div>}
            </div>
          </div>

          {/* Daily Line Chart */}
          <div className="card">
            <h2 className="text-white font-bold mb-4">Daily Approvals — Last 30 Days</h2>
            {analytics?.dailyData ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analytics.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a4731" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={(v) => v.substring(5)} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #1a4731', borderRadius: 8, color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="approvals" stroke="#22c55e" strokeWidth={2} dot={false} name="Approvals" />
                  <Line type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} dot={false} name="New Signups" />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-60 flex items-center justify-center text-gray-500">No data</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
