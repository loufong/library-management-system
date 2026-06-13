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
  const [members, setMembers] = useState([]);
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
        let membersList = [];
        if (user.role === 'ADMIN' || user.role === 'LIBRARIAN') {
          const membersRes = await api.get('/members');
          membersList = membersRes.data;
          membersCount = membersList.filter(m => m.role === 'MEMBER').length;
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
        setMembers(membersList);
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
    <div className={`glass-card p-5 sm:p-6 rounded-xl sm:rounded-2xl border-l-4 ${borderClass} flex items-center justify-between`}>
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">{value}</h3>
      </div>
      <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl ${colorClass}`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-100" />
      </div>
    </div>
  );

  return (
    <div class="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div class="relative overflow-hidden glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 border border-indigo-500/20 glow-indigo">
        <div class="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>
        <div class="relative z-10">
          <span class="px-3 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">System Portal</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-4">Welcome back, {user.username}!</h1>
          <p class="text-sm sm:text-base text-slate-400 mt-2 max-w-xl">
            {user.role === 'MEMBER' 
              ? 'Browse our extensive catalog, search for titles, and manage your current active borrowings.' 
              : 'Monitor active book loans, track overdue deadlines, and maintain the member database.'}
          </p>
        </div>
      </div>

      {error && (
        <div class="mb-6 sm:mb-8 p-4 bg-red-950/20 border border-red-500/30 text-red-200 rounded-2xl text-sm flex items-center gap-3">
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          {/* Members List Panel on Dashboard (Admin/Librarian only) */}
          {(user.role === 'ADMIN' || user.role === 'LIBRARIAN') && (
            <div class="mt-8">
              <h2 class="text-xl font-bold text-slate-200 mb-4">Registered Members</h2>
              <div class="glass-card rounded-2xl border border-slate-800 overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider">
                        <th class="py-3 px-4">Username</th>
                        <th class="py-3 px-4">Email Address</th>
                        <th class="py-3 px-4">Role</th>
                        <th class="py-3 px-4">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/50 text-xs text-slate-300">
                      {members.length === 0 ? (
                        <tr>
                          <td colSpan="4" class="py-4 text-center text-slate-500 italic">No registered members found.</td>
                        </tr>
                      ) : (
                        members.slice(0, 5).map((member) => (
                          <tr key={member.id} class="hover:bg-slate-900/20 transition-colors">
                            <td class="py-3 px-4 font-semibold text-slate-100">
                              <div class="flex flex-col">
                                <span>{member.fullName || member.username}</span>
                                {member.fullName && <span class="text-[10px] text-slate-500 font-mono">@{member.username}</span>}
                              </div>
                            </td>
                            <td class="py-3 px-4 font-mono">{member.email}</td>
                            <td class="py-3 px-4">
                              <span class={`px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider rounded border ${
                                member.role === 'ADMIN' 
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                  : member.role === 'LIBRARIAN' 
                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              }`}>
                                {member.role}
                              </span>
                            </td>
                            <td class="py-3 px-4 font-mono text-slate-400">
                              {member.createdAt ? member.createdAt.split('T')[0] : 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {members.length > 5 && (
                  <div class="p-3 bg-slate-900/40 border-t border-slate-800/60 text-center">
                    <Link to="/members" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                      View all {members.length} members &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
