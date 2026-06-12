// Dashboard.jsx - Render library metrics, navigation, and system status
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Users, History, AlertTriangle, BookMarked, ArrowRight, Library } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch Books, Loans, and Members (if Admin/Librarian)
        const booksRes = await api.get('/books');
        
        let loans = [];
        if (user.role === 'MEMBER') {
          const loansRes = await api.get('/loans/my-loans');
          loans = loansRes.data;
        } else {
          const loansRes = await api.get('/loans');
          loans = loansRes.data;
        }

        let membersCount = 0;
        if (user.role === 'ADMIN' || user.role === 'LIBRARIAN') {
          const membersRes = await api.get('/members');
          membersCount = membersRes.data.filter(m => m.role === 'MEMBER').length;
        }

        const totalBooks = booksRes.data.reduce((acc, book) => acc + book.totalCopies, 0);
        const activeLoans = loans.filter(l => l.status === 'BORROWED' || l.status === 'OVERDUE').length;
        const overdueLoans = loans.filter(l => l.status === 'OVERDUE').length;

        setStats({
          totalBooks,
          activeLoans,
          overdueLoans,
          totalMembers: membersCount,
        });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard metrics. Please make sure the backend services are running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.role]);

  const StatCard = ({ title, value, icon: Icon, colorClass, borderClass }) => (
    <div className={`glass-card p-6 rounded-2xl border-l-4 ${borderClass} flex items-center justify-between`}>
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <h3 class="text-3xl font-extrabold text-slate-100 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="h-6 w-6 text-slate-100" />
      </div>
    </div>
  );

  return (
    <div class="flex-1 p-8 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div class="relative overflow-hidden glass-card p-8 rounded-3xl mb-8 border border-indigo-500/20 glow-indigo">
        <div class="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>
        <div class="relative z-10">
          <span class="px-3 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">System Portal</span>
          <h1 class="text-3xl font-extrabold text-slate-100 mt-4">Welcome back, {user.username}!</h1>
          <p class="text-slate-400 mt-2 max-w-xl">
            {user.role === 'MEMBER' 
              ? 'Browse our extensive catalog, search for titles, and manage your current active borrowings.' 
              : 'Monitor active book loans, track overdue deadlines, and maintain the member database.'}
          </p>
        </div>
      </div>

      {error && (
        <div class="mb-8 p-4 bg-red-950/20 border border-red-500/30 text-red-200 rounded-2xl text-sm flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title={user.role === 'MEMBER' ? "Total Catalog Copies" : "Total Catalog Books"}
              value={stats.totalBooks} 
              icon={BookOpen} 
              colorClass="bg-indigo-600/30 text-indigo-400"
              borderClass="border-indigo-500"
            />
            <StatCard 
              title={user.role === 'MEMBER' ? "Your Active Loans" : "Active Loans"}
              value={stats.activeLoans} 
              icon={BookMarked} 
              colorClass="bg-emerald-600/30 text-emerald-400"
              borderClass="border-emerald-500"
            />
            <StatCard 
              title={user.role === 'MEMBER' ? "Your Overdue Books" : "Overdue Books"}
              value={stats.overdueLoans} 
              icon={AlertTriangle} 
              colorClass={stats.overdueLoans > 0 ? "bg-red-600/30 text-red-400 animate-pulse" : "bg-slate-800/30 text-slate-400"}
              borderClass={stats.overdueLoans > 0 ? "border-red-500" : "border-slate-500"}
            />
            {user.role !== 'MEMBER' ? (
              <StatCard 
                title="Active Members" 
                value={stats.totalMembers} 
                icon={Users} 
                colorClass="bg-purple-600/30 text-purple-400"
                borderClass="border-purple-500"
              />
            ) : (
              <StatCard 
                title="Membership Level" 
                value="Standard" 
                icon={Users} 
                colorClass="bg-purple-600/30 text-purple-400"
                borderClass="border-purple-500"
              />
            )}
          </div>

          {/* Quick Actions Grid */}
          <h2 class="text-xl font-bold text-slate-200 mb-4">Quick Navigation</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/books" class="group glass-card p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900/50 transition-all duration-300 flex flex-col justify-between h-40">
              <div>
                <BookOpen className="h-8 w-8 text-indigo-400 mb-4" />
                <h3 class="font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">Search & Browse Catalog</h3>
                <p class="text-xs text-slate-400 mt-2">Lookup book details, titles, authors, and check copy availability.</p>
              </div>
              <div class="flex items-center gap-1 text-xs text-indigo-400 font-bold self-end group-hover:translate-x-1 transition-transform">
                <span>Go to Catalog</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>

            <Link to="/loans" class="group glass-card p-6 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-900/50 transition-all duration-300 flex flex-col justify-between h-40">
              <div>
                <History className="h-8 w-8 text-emerald-400 mb-4" />
                <h3 class="font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                  {user.role === 'MEMBER' ? 'Your Borrowings' : 'Manage Active Loans'}
                </h3>
                <p class="text-xs text-slate-400 mt-2">Track borrowing status, view return timelines, or process returns.</p>
              </div>
              <div class="flex items-center gap-1 text-xs text-emerald-400 font-bold self-end group-hover:translate-x-1 transition-transform">
                <span>View Loans</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>

            {(user.role === 'ADMIN' || user.role === 'LIBRARIAN') && (
              <Link to="/members" class="group glass-card p-6 rounded-2xl hover:border-purple-500/50 hover:bg-slate-900/50 transition-all duration-300 flex flex-col justify-between h-40">
                <div>
                  <Users className="h-8 w-8 text-purple-400 mb-4" />
                  <h3 class="font-bold text-slate-200 group-hover:text-purple-300 transition-colors">Member Directory</h3>
                  <p class="text-xs text-slate-400 mt-2">Register new library members, search profiles, and adjust role access.</p>
                </div>
                <div class="flex items-center gap-1 text-xs text-purple-400 font-bold self-end group-hover:translate-x-1 transition-transform">
                  <span>View Directory</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
