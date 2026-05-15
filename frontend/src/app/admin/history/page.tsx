'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, BarChart2, History, Unlock, LogOut, Menu, X, CheckCircle, Loader2, Search, Filter } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const ACTION_COLORS: Record<string, string> = {
  approved: 'bg-green-500/20 text-green-400',
  locked: 'bg-red-500/20 text-red-400',
  unlocked: 'bg-primary-500/20 text-primary-400',
  rejected: 'bg-red-500/20 text-red-400',
  reset_device: 'bg-orange-500/20 text-orange-400',
  login: 'bg-blue-500/20 text-blue-400',
  logout: 'bg-gray-500/20 text-gray-400',
  course_unlocked: 'bg-purple-500/20 text-purple-400',
};

export default function HistoryPage() {
  const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'admin') router.push('/admin');
      else fetchLogs();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/logs`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to load logs', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l => {
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    const matchSearch = !search || (l.student_name || '').toLowerCase().includes(search.toLowerCase()) || (l.action || '').toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div className="min-h-screen bg-dark-500 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-400 border-r border-primary-900/30 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-primary-900/30">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center"><BookOpen className="w-6 h-6 text-white" /></div>
            <span className="text-lg font-bold text-white">Darwin Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><X className="w-6 h-6" /></button>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-dark-300 rounded-lg transition-colors"><Users className="w-5 h-5" /><span>Enrollments</span></Link>
          <Link href="/admin/unlock" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-dark-300 rounded-lg transition-colors"><Unlock className="w-5 h-5" /><span>Unlock Course</span></Link>
          <Link href="/admin/reports" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-dark-300 rounded-lg transition-colors"><BarChart2 className="w-5 h-5" /><span>Reports</span></Link>
          <Link href="/admin/history" className="flex items-center space-x-3 px-4 py-3 bg-primary-500/10 text-primary-400 rounded-lg"><History className="w-5 h-5" /><span>History</span></Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-900/30">
          <button onClick={logout} className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 w-full rounded-lg transition-colors"><LogOut className="w-5 h-5" /><span>Logout</span></button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        <header className="bg-dark-400 border-b border-primary-900/30 p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400"><Menu className="w-6 h-6" /></button>
          <h1 className="text-xl font-bold text-white">Admin Activity History</h1>
          <span className="text-sm text-gray-400">{filtered.length} records</span>
        </header>

        <div className="p-6">
          <div className="card">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by student name or action..."
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-400 border border-primary-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="px-3 py-2.5 bg-dark-400 border border-primary-900/30 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <button onClick={fetchLogs} className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm transition-colors">Refresh</button>
            </div>

            {loading ? (
              <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-400" /></div>
            ) : paginated.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                {logs.length === 0 ? 'No activity logs yet. Logs will appear here after admin actions.' : 'No matching records.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-900/30">
                      <th className="text-left py-3 px-3 text-gray-400 font-medium">Action</th>
                      <th className="text-left py-3 px-3 text-gray-400 font-medium hidden sm:table-cell">Student</th>
                      <th className="text-left py-3 px-3 text-gray-400 font-medium hidden md:table-cell">Admin</th>
                      <th className="text-left py-3 px-3 text-gray-400 font-medium">Date & Time</th>
                      <th className="text-left py-3 px-3 text-gray-400 font-medium hidden lg:table-cell">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((log) => (
                      <tr key={log.id} className="border-b border-primary-900/20 hover:bg-dark-300/30">
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-500/20 text-gray-400'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-300 hidden sm:table-cell">
                          <div>
                            <p className="text-white">{log.student_name || '-'}</p>
                            <p className="text-xs text-gray-500">{log.student_code || ''}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-400 hidden md:table-cell">{log.admin_name || '-'}</td>
                        <td className="py-3 px-3 text-gray-400 whitespace-nowrap">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-3 text-gray-500 hidden lg:table-cell text-xs">{log.details || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-primary-900/30 mt-4">
                <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-dark-400 text-gray-300 text-sm rounded disabled:opacity-40 hover:bg-dark-300">Previous</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 bg-dark-400 text-gray-300 text-sm rounded disabled:opacity-40 hover:bg-dark-300">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
