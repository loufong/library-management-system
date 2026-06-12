import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, Edit2, Trash2, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null); // Null for Add, Book object for Edit
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publishedYear: '',
    genre: '',
    totalCopies: 1,
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdminOrLibrarian = currentUser.role === 'ADMIN' || currentUser.role === 'LIBRARIAN';

  const fetchBooks = async (query = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(query ? `/books?search=${query}` : '/books');
      setBooks(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch books catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks(searchQuery);
  };

  const handleOpenAddModal = () => {
    setSelectedBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      publishedYear: new Date().getFullYear(),
      genre: '',
      totalCopies: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher || '',
      publishedYear: book.publishedYear || '',
      genre: book.genre || '',
      totalCopies: book.totalCopies,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalCopies' || name === 'publishedYear' ? parseInt(value) || 0 : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (selectedBook) {
        // Edit Operation
        await api.put(`/books/${selectedBook.id}`, formData);
        setSuccessMsg(`Book "${formData.title}" updated successfully!`);
      } else {
        // Add Operation
        await api.post('/books', formData);
        setSuccessMsg(`Book "${formData.title}" added successfully!`);
      }
      setIsModalOpen(false);
      fetchBooks(searchQuery);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save book catalog record.');
    }
  };

  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      setError('');
      setSuccessMsg('');
      await api.delete(`/books/${bookId}`);
      setSuccessMsg(`Book "${title}" deleted successfully.`);
      fetchBooks(searchQuery);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete book.');
    }
  };

  const handleBorrowBook = async (book) => {
    try {
      setError('');
      setSuccessMsg('');

      // Fetch user profile details to get ID
      const userProfileRes = await api.get('/members');
      const profile = userProfileRes.data.find(u => u.username === currentUser.username);

      if (!profile) {
        throw new Error('User profile mismatch');
      }

      await api.post('/loans/borrow', {
        bookId: book.id,
        userId: profile.id,
      });

      setSuccessMsg(`You successfully borrowed "${book.title}". Pick it up at the counter!`);
      fetchBooks(searchQuery);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to borrow book. Check copy availability.');
    }
  };

  return (
    <div class="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-indigo-400" />
            <span>Books Catalog</span>
          </h1>
          <p class="text-sm sm:text-base text-slate-400 mt-2">Browse catalog, search details and borrow books.</p>
        </div>

        {isAdminOrLibrarian && (
          <button
            onClick={handleOpenAddModal}
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Book</span>
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div class="mb-6 p-4 bg-red-950/20 border border-red-500/30 text-red-200 rounded-2xl text-sm flex items-center gap-3 animate-pulse">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div class="mb-6 p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 rounded-2xl text-sm flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} class="flex flex-col sm:flex-row gap-4 mb-8">
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by Title, Author, ISBN, or Genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            class="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <button
          type="submit"
          class="bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-6 py-3 rounded-xl border border-slate-700 transition-all duration-200"
        >
          Search
        </button>
      </form>

      {/* Main Books Grid */}
      {loading ? (
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
        </div>
      ) : books.length === 0 ? (
        <div class="glass-card p-12 rounded-3xl text-center text-slate-400">
          <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p class="text-lg font-semibold">No books matching search filters found.</p>
          <button onClick={() => { setSearchQuery(''); fetchBooks(); }} class="text-indigo-400 hover:text-indigo-300 font-semibold mt-2 underline">
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} class="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-slate-600/50 transition-all duration-300 relative overflow-hidden group">
              <div class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/5 group-hover:bg-indigo-500/10 blur-xl pointer-events-none transition-all duration-300"></div>
              
              <div>
                <div class="flex items-start justify-between gap-2">
                  <span class="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-indigo-300 rounded border border-indigo-500/20 uppercase tracking-wider font-mono">
                    {book.genre || 'General'}
                  </span>
                  <span class="text-xs text-slate-400 font-mono">ISBN: {book.isbn}</span>
                </div>

                <h3 class="text-xl font-bold text-slate-100 mt-3 line-clamp-1 group-hover:text-indigo-300 transition-colors">{book.title}</h3>
                <p class="text-sm text-slate-300 mt-1">by {book.author}</p>
                
                <div class="mt-4 grid grid-cols-2 gap-4 border-t border-b border-slate-800 py-3 text-xs">
                  <div>
                    <span class="text-slate-400 block">Publisher</span>
                    <span class="text-slate-200 font-medium">{book.publisher || 'N/A'} ({book.publishedYear || 'N/A'})</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">Available Copies</span>
                    <span class={`font-bold block text-sm ${book.availableCopies > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {book.availableCopies} / {book.totalCopies}
                    </span>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between gap-3">
                {currentUser.role === 'MEMBER' ? (
                  <button
                    onClick={() => handleBorrowBook(book)}
                    disabled={book.availableCopies <= 0}
                    class="w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-transparent font-semibold py-2 px-4 rounded-xl transition-all duration-150 disabled:opacity-30 disabled:hover:bg-indigo-600/20 disabled:hover:text-indigo-300 disabled:hover:border-indigo-500/30"
                  >
                    {book.availableCopies > 0 ? 'Borrow Book' : 'Out of Stock'}
                  </button>
                ) : (
                  <div class="w-full flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(book)}
                      class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-150 flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id, book.title)}
                      class="bg-red-950/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent p-2.5 rounded-xl transition-all duration-150"
                      title="Delete Book"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div class="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-800 my-auto">
            <h2 class="text-2xl font-extrabold text-slate-100 mb-6">
              {selectedBook ? 'Edit Book Catalog' : 'Add New Book'}
            </h2>

            <form onSubmit={handleFormSubmit} class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Book Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleFormChange}
                    class="glass-input w-full px-4 py-2.5 rounded-xl"
                    placeholder="e.g. Clean Code"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Author</label>
                  <input
                    type="text"
                    name="author"
                    required
                    value={formData.author}
                    onChange={handleFormChange}
                    class="glass-input w-full px-4 py-2.5 rounded-xl"
                    placeholder="e.g. Robert C. Martin"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    required
                    value={formData.isbn}
                    onChange={handleFormChange}
                    class="glass-input w-full px-4 py-2.5 rounded-xl"
                    placeholder="e.g. 9780132350884"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleFormChange}
                    class="glass-input w-full px-4 py-2.5 rounded-xl"
                    placeholder="e.g. Technology"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleFormChange}
                    class="glass-input w-full px-4 py-2.5 rounded-xl"
                    placeholder="e.g. Prentice Hall"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Year</label>
                  <input
                    type="number"
                    name="publishedYear"
                    value={formData.publishedYear}
                    onChange={handleFormChange}
                    class="glass-input w-full px-4 py-2.5 rounded-xl"
                    placeholder="2008"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Copies</label>
                <input
                  type="number"
                  name="totalCopies"
                  required
                  min="1"
                  value={formData.totalCopies}
                  onChange={handleFormChange}
                  class="glass-input w-full px-4 py-2.5 rounded-xl"
                />
              </div>

              <div class="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  class="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold py-3 rounded-xl border border-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
