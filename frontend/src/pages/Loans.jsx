import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, CheckCircle, AlertCircle, Calendar, ArrowRightLeft, BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [booksMap, setBooksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // E-Book Reader State
  const [readerBook, setReaderBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [readerTheme, setReaderTheme] = useState('sepia');
  const [readerFontSize, setReaderFontSize] = useState(18);
  const [readerFontFamily, setReaderFontFamily] = useState('serif');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError('');
      const url = currentUser.role === 'MEMBER' ? '/loans/my-loans' : '/loans';
      const response = await api.get(url);
      
      // Fetch books to check digital availability
      const booksRes = await api.get('/books');
      const bMap = {};
      booksRes.data.forEach(b => {
        bMap[b.id] = b;
      });
      setBooksMap(bMap);

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
                      <div class="flex items-center justify-center gap-2">
                        {loan.status !== 'RETURNED' ? (
                          <>
                            <button
                              onClick={() => handleReturnBook(loan.id, loan.bookTitle)}
                              class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm"
                            >
                              Return Book
                            </button>
                            {booksMap[loan.bookId] && booksMap[loan.bookId].fileType !== 'NONE' && (
                              <button
                                onClick={() => {
                                  setReaderBook(booksMap[loan.bookId]);
                                  setCurrentPage(0);
                                }}
                                class="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-transparent font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1"
                                title="Read Digital E-Book"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>Read</span>
                              </button>
                            )}
                          </>
                        ) : (
                          <span class="text-xs text-slate-500 italic">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* E-Book Reader Modal */}
      {readerBook && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 md:p-6 overflow-y-auto animate-fade-in">
          {readerBook.fileType === 'TEXT' ? (
            <div class={`w-full max-w-3xl rounded-3xl shadow-2xl relative border flex flex-col h-[90vh] md:h-[85vh] transition-all duration-300 ${
              readerTheme === 'light' 
                ? 'bg-slate-50 text-slate-900 border-slate-200' 
                : readerTheme === 'sepia'
                  ? 'bg-[#faf4e8] text-[#3c2f2f] border-[#ebdcc5]'
                  : 'bg-slate-950 text-slate-200 border-slate-800'
            }`}>
              {/* Header */}
              <div class={`px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${
                readerTheme === 'light' 
                  ? 'border-slate-200 bg-slate-100/50' 
                  : readerTheme === 'sepia'
                    ? 'border-[#ebdcc5] bg-[#ebdcc5]/20'
                    : 'border-slate-800 bg-slate-900/50'
              }`}>
                <div>
                  <h3 class="font-extrabold text-lg line-clamp-1">{readerBook.title}</h3>
                  <p class={`text-xs ${readerTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>by {readerBook.author}</p>
                </div>

                <div class="flex items-center gap-4 self-end md:self-auto">
                  {/* Font Style & Size Toggles */}
                  <div class="flex items-center gap-1.5 border-r border-slate-300/50 pr-4">
                    <button 
                      onClick={() => setReaderFontFamily(readerFontFamily === 'serif' ? 'sans' : 'serif')}
                      class={`px-2 py-1 text-xs rounded font-semibold border ${
                        readerTheme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-200/50'
                      }`}
                    >
                      {readerFontFamily === 'serif' ? 'Sans-Serif' : 'Serif'}
                    </button>
                    <button 
                      onClick={() => setReaderFontSize(Math.max(12, readerFontSize - 2))}
                      class={`p-1.5 text-xs rounded font-bold border ${
                        readerTheme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-200/50'
                      }`}
                      title="Decrease Text Size"
                    >
                      A-
                    </button>
                    <button 
                      onClick={() => setReaderFontSize(Math.min(28, readerFontSize + 2))}
                      class={`p-1.5 text-xs rounded font-bold border ${
                        readerTheme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-200/50'
                      }`}
                      title="Increase Text Size"
                    >
                      A+
                    </button>
                  </div>

                  {/* Theme Selectors */}
                  <div class="flex gap-2">
                    <button 
                      onClick={() => setReaderTheme('light')} 
                      class={`w-6 h-6 rounded-full bg-slate-50 border-2 ${readerTheme === 'light' ? 'border-indigo-500 scale-110' : 'border-slate-300'}`} 
                      title="Light Theme"
                    />
                    <button 
                      onClick={() => setReaderTheme('sepia')} 
                      class={`w-6 h-6 rounded-full bg-[#faf4e8] border-2 ${readerTheme === 'sepia' ? 'border-indigo-500 scale-110' : 'border-orange-200'}`} 
                      title="Sepia Theme"
                    />
                    <button 
                      onClick={() => setReaderTheme('dark')} 
                      class={`w-6 h-6 rounded-full bg-slate-900 border-2 ${readerTheme === 'dark' ? 'border-indigo-400 scale-110' : 'border-slate-700'}`} 
                      title="Dark Theme"
                    />
                  </div>

                  <button 
                    onClick={() => setReaderBook(null)}
                    class={`p-2 rounded-xl border ${
                      readerTheme === 'dark' ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 hover:bg-slate-200/50'
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Immersive Text Reading Area */}
              <div class={`flex-1 overflow-y-auto p-6 md:p-12 leading-relaxed selection:bg-indigo-500 selection:text-white ${
                readerFontFamily === 'serif' ? 'font-serif font-georgia' : 'font-sans'
              }`} style={{ fontSize: `${readerFontSize}px` }}>
                <div class="max-w-2xl mx-auto whitespace-pre-wrap">
                  {readerBook.fileContent 
                    ? readerBook.fileContent.split('---PAGE---')[currentPage]?.trim() 
                    : 'This book has no digitised text content.'}
                </div>
              </div>

              {/* Reader Navigation Footer */}
              <div class={`px-6 py-4 flex items-center justify-between border-t ${
                readerTheme === 'light' 
                  ? 'border-slate-200 bg-slate-100/50' 
                  : readerTheme === 'sepia'
                    ? 'border-[#ebdcc5] bg-[#ebdcc5]/20'
                    : 'border-slate-800 bg-slate-900/50'
              }`}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  class={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    readerTheme === 'dark'
                      ? 'border-slate-800 hover:bg-slate-900 disabled:opacity-20'
                      : 'border-slate-300 hover:bg-slate-200/50 disabled:opacity-35'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <span class="text-xs font-semibold font-mono tracking-wide">
                  Page {currentPage + 1} of {readerBook.fileContent ? readerBook.fileContent.split('---PAGE---').length : 1}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min((readerBook.fileContent ? readerBook.fileContent.split('---PAGE---').length : 1) - 1, prev + 1))}
                  disabled={currentPage === (readerBook.fileContent ? readerBook.fileContent.split('---PAGE---').length : 1) - 1}
                  class={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    readerTheme === 'dark'
                      ? 'border-slate-800 hover:bg-slate-900 disabled:opacity-20'
                      : 'border-slate-300 hover:bg-slate-200/50 disabled:opacity-35'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div class="w-full max-w-5xl rounded-3xl bg-slate-950 shadow-2xl relative border border-slate-800 flex flex-col h-[90vh] overflow-hidden">
              {/* Header for PDF */}
              <div class="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
                <div>
                  <h3 class="font-extrabold text-lg text-slate-100">{readerBook.title}</h3>
                  <p class="text-xs text-slate-400">PDF Document Viewer</p>
                </div>
                <div class="flex items-center gap-3">
                  <a 
                    href={readerBook.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Open in New Tab
                  </a>
                  <button 
                    onClick={() => setReaderBook(null)}
                    class="p-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* PDF Frame */}
              <div class="flex-1 bg-slate-900 p-2 h-full">
                <iframe 
                  src={readerBook.fileUrl} 
                  className="w-full h-full rounded-2xl border-0 bg-slate-900" 
                  title={readerBook.title}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Loans;
