import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, CheckCircle, AlertCircle, Calendar, ArrowRightLeft } from 'lucide-react';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError('');
      const url = currentUser.role === 'MEMBER' ? '/loans/my-loans' : '/loans';
      const response = await api.get(url);
      
      // Sort loans: active ones (BORROWED/OVERDUE) first, then sorted by borrowDate desc
      const sorted = response.data.sort((a, b) => {
        if (a.status !== 'RETURNED' && b.status === 'RETURNED') return -1;
        if (a.status === 'RETURNED' && b.status !== 'RETURNED') return 1;
        return new Date(b.borrowDate) - new Date(a.borrowDate);
      });
      
      setLoans(sorted);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch borrowing history records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturnBook = async (loanId, title) => {
    try {
      setError('');
      setSuccess('');
      await api.post(`/loans/return/${loanId}`);
      setSuccess(`Book "${title}" has been returned successfully!`);
      fetchLoans();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to return book.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RETURNED':
        return (
          <span class="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1.5 w-fit">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Returned</span>
          </span>
        );
      case 'OVERDUE':
        return (
          <span class="px-2.5 py-1 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center gap-1.5 w-fit animate-pulse">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Overdue</span>
          </span>
        );
      case 'BORROWED':
      default:
        return (
          <span class="px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center gap-1.5 w-fit">
            <Calendar className="h-3.5 w-3.5" />
            <span>Borrowed</span>
          </span>
        );
    }
  };

  return (
    <div class="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <History className="h-8 w-8 text-indigo-400" />
          <span>{currentUser.role === 'MEMBER' ? 'Your Borrowing History' : 'System Loan History'}</span>
        </h1>
        <p class="text-sm sm:text-base text-slate-400 mt-2">
          {currentUser.role === 'MEMBER' 
            ? 'Track your active checkouts, verify due dates, and view returned books.' 
            : 'Track status of borrowings system-wide, search user loan records, and resolve returns.'}
        </p>
      </div>

      {error && (
        <div class="mb-6 p-4 bg-red-950/20 border border-red-500/30 text-red-200 rounded-2xl text-sm flex items-center gap-3 animate-pulse">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div class="mb-6 p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 rounded-2xl text-sm flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
        </div>
      ) : loans.length === 0 ? (
        <div class="glass-card p-12 rounded-3xl text-center text-slate-400">
          <ArrowRightLeft className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p class="text-lg font-semibold">No borrowing history found.</p>
        </div>
      ) : (
        <div class="glass-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider">
                  <th class="py-3.5 px-4 sm:py-4 sm:px-6">Book Title</th>
                  <th class="py-3.5 px-4 sm:py-4 sm:px-6">ISBN</th>
                  {currentUser.role !== 'MEMBER' && <th class="py-3.5 px-4 sm:py-4 sm:px-6">Borrower</th>}
                  <th class="py-3.5 px-4 sm:py-4 sm:px-6">Date Borrowed</th>
                  <th class="py-3.5 px-4 sm:py-4 sm:px-6">Due Date</th>
                  <th class="py-3.5 px-4 sm:py-4 sm:px-6">Returned Date</th>
                  <th class="py-3.5 px-4 sm:py-4 sm:px-6">Status</th>
                  <th class="py-3.5 px-4 sm:py-4 sm:px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50 text-sm text-slate-300">
                {loans.map((loan) => (
                  <tr key={loan.id} class="hover:bg-slate-900/30 transition-colors">
                    <td class="py-3 px-4 sm:py-4 sm:px-6 font-semibold text-slate-100">{loan.bookTitle}</td>
                    <td class="py-3 px-4 sm:py-4 sm:px-6 font-mono text-xs">{loan.bookIsbn}</td>
                    {currentUser.role !== 'MEMBER' && (
                      <td class="py-3 px-4 sm:py-4 sm:px-6 text-slate-200">
                        <span class="font-medium">{loan.username}</span>
                      </td>
                    )}
                    <td class="py-3 px-4 sm:py-4 sm:px-6 font-mono text-xs">{loan.borrowDate}</td>
                    <td class="py-3 px-4 sm:py-4 sm:px-6 font-mono text-xs text-indigo-300">{loan.dueDate}</td>
                    <td class="py-3 px-4 sm:py-4 sm:px-6 font-mono text-xs">
                      {loan.returnDate ? (
                        <span class="text-slate-400">{loan.returnDate}</span>
                      ) : (
                        <span class="text-slate-500 italic">Not returned</span>
                      )}
                    </td>
                    <td class="py-3 px-4 sm:py-4 sm:px-6">{getStatusBadge(loan.status)}</td>
                    <td class="py-3 px-4 sm:py-4 sm:px-6 text-center">
                      {loan.status !== 'RETURNED' ? (
                        <button
                          onClick={() => handleReturnBook(loan.id, loan.bookTitle)}
                          class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          Return Book
                        </button>
                      ) : (
                        <span class="text-xs text-slate-500 italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
