import axios from 'axios';

// Dynamically check base URL. Use env variable or fallback to standard localhost API port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Detect if we should use the localStorage mock adapter (e.g. running on GitHub Pages)
const isGitHubPages = window.location.hostname.endsWith('github.io');
const forceMock = localStorage.getItem('use_mock_api') === 'true';
const useMock = isGitHubPages || forceMock;

if (useMock) {
  console.log('%c[Library OS] Running in Client-Side Mock Database Mode (localStorage)', 'color: #818cf8; font-weight: bold; font-size: 12px;');
}

// Helper: Seed Data Initializers
const getMockUsers = () => {
  let users = localStorage.getItem('mock_users');
  if (!users) {
    const defaultUsers = [
      { id: 'u1', username: 'admin', email: 'admin@library.com', password: 'password', role: 'ADMIN', createdAt: new Date().toISOString() },
      { id: 'u2', username: 'librarian', email: 'librarian@library.com', password: 'password', role: 'LIBRARIAN', createdAt: new Date().toISOString() },
      { id: 'u3', username: 'member1', email: 'member1@library.com', password: 'password', role: 'MEMBER', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('mock_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(users);
};

const saveMockUsers = (users) => {
  localStorage.setItem('mock_users', JSON.stringify(users));
};

const getMockBooks = () => {
  let books = localStorage.getItem('mock_books');
  if (!books) {
    const defaultBooks = [
      { id: 'b1', title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', publisher: 'Prentice Hall', publishedYear: 2008, genre: 'Technology', totalCopies: 5, availableCopies: 5 },
      { id: 'b2', title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780007487289', publisher: 'George Allen & Unwin', publishedYear: 1937, genre: 'Fantasy', totalCopies: 3, availableCopies: 3 },
      { id: 'b3', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '9780262033848', publisher: 'MIT Press', publishedYear: 2009, genre: 'Education', totalCopies: 2, availableCopies: 2 },
      { id: 'b4', title: 'Design Patterns', author: 'Erich Gamma', isbn: '9780201633610', publisher: 'Addison-Wesley', publishedYear: 1994, genre: 'Technology', totalCopies: 4, availableCopies: 4 }
    ];
    localStorage.setItem('mock_books', JSON.stringify(defaultBooks));
    return defaultBooks;
  }
  return JSON.parse(books);
};

const saveMockBooks = (books) => {
  localStorage.setItem('mock_books', JSON.stringify(books));
};

const getMockLoans = () => {
  let loans = localStorage.getItem('mock_loans');
  if (!loans) {
    const defaultLoans = [
      { id: 'l1', bookId: 'b1', bookTitle: 'Clean Code', bookIsbn: '9780132350884', username: 'member1', borrowDate: '2026-06-01', dueDate: '2026-06-15', returnDate: '2026-06-08', status: 'RETURNED' }
    ];
    localStorage.setItem('mock_loans', JSON.stringify(defaultLoans));
    return defaultLoans;
  }
  return JSON.parse(loans);
};

const saveMockLoans = (loans) => {
  localStorage.setItem('mock_loans', JSON.stringify(loans));
};

// Helper: Normalize URLs for Mocking
const getRelativeUrl = (config) => {
  let url = config.url || '';
  if (config.baseURL && url.startsWith(config.baseURL)) {
    url = url.substring(config.baseURL.length);
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      url = parsed.pathname + parsed.search;
      if (url.startsWith('/api')) {
        url = url.substring(4);
      }
    } catch (e) {
      // Ignore URL parsing failure
    }
  }
  if (!url.startsWith('/')) {
    url = '/' + url;
  }
  return url;
};

// Helper: Build mock Axios response
const mockResponse = (status, data, config) => ({
  data,
  status,
  statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
  headers: {},
  config: config || {},
  request: {}
});

// Helper: Build mock Axios error
const mockError = (status, message) => {
  const error = new Error(message || 'Request failed');
  error.response = {
    data: { message: message || 'Request failed' },
    status,
    statusText: 'Error',
    headers: {}
  };
  return error;
};

// Custom Adapter logic
const mockAdapter = (config) => {
  return new Promise((resolve, reject) => {
    // Simulate network delay (200ms)
    setTimeout(() => {
      const relativeUrl = getRelativeUrl(config);
      const urlObj = new URL(relativeUrl, 'http://localhost');
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;
      const method = config.method ? config.method.toUpperCase() : 'GET';
      const body = config.data ? JSON.parse(config.data) : null;

      try {
        // --- AUTH REGISTRATION ---
        if (pathname === '/auth/register' && method === 'POST') {
          const { username, email, password, role } = body;
          const users = getMockUsers();
          if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return reject(mockError(400, 'Username already exists.'));
          }
          if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return reject(mockError(400, 'Email address already registered.'));
          }
          const newUser = {
            id: 'u_' + Date.now(),
            username,
            email,
            password,
            role: role || 'MEMBER',
            createdAt: new Date().toISOString()
          };
          users.push(newUser);
          saveMockUsers(users);
          return resolve(mockResponse(200, { message: 'Registration successful!' }, config));
        }

        // --- AUTH LOGIN ---
        if (pathname === '/auth/login' && method === 'POST') {
          const { username, password } = body;
          const users = getMockUsers();
          const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
          if (!user) {
            return reject(mockError(400, 'Invalid username or password. Please try again.'));
          }
          return resolve(mockResponse(200, {
            token: 'mock-jwt-token-' + user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }, config));
        }

        // --- MEMBERS MANAGEMENT ---
        if (pathname.startsWith('/members')) {
          const users = getMockUsers();

          // GET /members
          if (method === 'GET') {
            const safeUsers = users.map(({ password, ...u }) => u);
            return resolve(mockResponse(200, safeUsers, config));
          }

          // POST /members
          if (method === 'POST') {
            const { username, email, password, role } = body;
            if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
              return reject(mockError(400, 'Username already exists.'));
            }
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
              return reject(mockError(400, 'Email already exists.'));
            }
            const newUser = {
              id: 'u_' + Date.now(),
              username,
              email,
              password,
              role: role || 'MEMBER',
              createdAt: new Date().toISOString()
            };
            users.push(newUser);
            saveMockUsers(users);
            return resolve(mockResponse(200, newUser, config));
          }

          // PUT /members/:id
          if (method === 'PUT') {
            const id = pathname.split('/')[2];
            const idx = users.findIndex(u => u.id === id);
            if (idx === -1) return reject(mockError(404, 'User not found.'));
            
            const { username, email, password, role } = body;
            if (users.some(u => u.id !== id && u.username.toLowerCase() === username.toLowerCase())) {
              return reject(mockError(400, 'Username already exists.'));
            }
            if (users.some(u => u.id !== id && u.email.toLowerCase() === email.toLowerCase())) {
              return reject(mockError(400, 'Email already exists.'));
            }
            
            users[idx] = {
              ...users[idx],
              username,
              email,
              role,
              ...(password ? { password } : {})
            };
            saveMockUsers(users);
            return resolve(mockResponse(200, users[idx], config));
          }

          // DELETE /members/:id
          if (method === 'DELETE') {
            const id = pathname.split('/')[2];
            const filtered = users.filter(u => u.id !== id);
            if (filtered.length === users.length) return reject(mockError(404, 'User not found.'));
            saveMockUsers(filtered);
            return resolve(mockResponse(200, { message: 'Member deleted successfully.' }, config));
          }
        }

        // --- BOOKS CATALOG ---
        if (pathname.startsWith('/books')) {
          const books = getMockBooks();

          // GET /books
          if (method === 'GET') {
            const searchParam = searchParams.get('search');
            let result = books;
            if (searchParam) {
              const q = searchParam.toLowerCase();
              result = books.filter(b => 
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                b.isbn.toLowerCase().includes(q) ||
                (b.genre && b.genre.toLowerCase().includes(q))
              );
            }
            return resolve(mockResponse(200, result, config));
          }

          // POST /books
          if (method === 'POST') {
            const { title, author, isbn, publisher, publishedYear, genre, totalCopies } = body;
            const newBook = {
              id: 'b_' + Date.now(),
              title,
              author,
              isbn,
              publisher,
              publishedYear: parseInt(publishedYear) || new Date().getFullYear(),
              genre,
              totalCopies: parseInt(totalCopies) || 1,
              availableCopies: parseInt(totalCopies) || 1
            };
            books.push(newBook);
            saveMockBooks(books);
            return resolve(mockResponse(200, newBook, config));
          }

          // PUT /books/:id
          if (method === 'PUT') {
            const id = pathname.split('/')[2];
            const idx = books.findIndex(b => b.id === id);
            if (idx === -1) return reject(mockError(404, 'Book not found.'));
            
            const { title, author, isbn, publisher, publishedYear, genre, totalCopies } = body;
            const prevBook = books[idx];
            
            const totalDiff = totalCopies - prevBook.totalCopies;
            let newAvailable = prevBook.availableCopies + totalDiff;
            if (newAvailable < 0) newAvailable = 0;

            books[idx] = {
              ...prevBook,
              title,
              author,
              isbn,
              publisher,
              publishedYear: parseInt(publishedYear) || prevBook.publishedYear,
              genre,
              totalCopies: parseInt(totalCopies) || 1,
              availableCopies: newAvailable
            };
            saveMockBooks(books);
            return resolve(mockResponse(200, books[idx], config));
          }

          // DELETE /books/:id
          if (method === 'DELETE') {
            const id = pathname.split('/')[2];
            const filtered = books.filter(b => b.id !== id);
            if (filtered.length === books.length) return reject(mockError(404, 'Book not found.'));
            saveMockBooks(filtered);
            return resolve(mockResponse(200, { message: 'Book deleted successfully.' }, config));
          }
        }

        // --- LOANS AND BORROWING ---
        if (pathname.startsWith('/loans')) {
          const loans = getMockLoans();
          const books = getMockBooks();
          const users = getMockUsers();

          // POST /loans/borrow
          if (pathname === '/loans/borrow' && method === 'POST') {
            const { bookId, userId } = body;
            const book = books.find(b => b.id === bookId);
            if (!book) return reject(mockError(404, 'Book not found.'));
            if (book.availableCopies <= 0) {
              return reject(mockError(400, 'Book is currently out of stock.'));
            }

            const user = users.find(u => u.id === userId || u.username === userId);
            if (!user) return reject(mockError(404, 'User profile mismatch.'));

            const activeLoan = loans.find(l => l.bookId === bookId && l.username === user.username && l.status !== 'RETURNED');
            if (activeLoan) {
              return reject(mockError(400, 'You already have an active loan for this book.'));
            }

            book.availableCopies -= 1;
            saveMockBooks(books);

            const borrowDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(borrowDate.getDate() + 14);

            const newLoan = {
              id: 'l_' + Date.now(),
              bookId: book.id,
              bookTitle: book.title,
              bookIsbn: book.isbn,
              username: user.username,
              borrowDate: borrowDate.toISOString().split('T')[0],
              dueDate: dueDate.toISOString().split('T')[0],
              returnDate: null,
              status: 'BORROWED'
            };

            loans.push(newLoan);
            saveMockLoans(loans);
            return resolve(mockResponse(200, newLoan, config));
          }

          // POST /loans/return/:loanId
          if (pathname.startsWith('/loans/return') && method === 'POST') {
            const loanId = pathname.split('/').pop();
            const loan = loans.find(l => l.id === loanId);
            if (!loan) return reject(mockError(404, 'Loan transaction record not found.'));
            if (loan.status === 'RETURNED') {
              return reject(mockError(400, 'Book has already been returned.'));
            }

            loan.returnDate = new Date().toISOString().split('T')[0];
            loan.status = 'RETURNED';
            saveMockLoans(loans);

            const book = books.find(b => b.id === loan.bookId);
            if (book) {
              book.availableCopies += 1;
              saveMockBooks(books);
            }

            return resolve(mockResponse(200, { message: 'Book returned successfully.' }, config));
          }

          // GET /loans/my-loans
          if (pathname === '/loans/my-loans' && method === 'GET') {
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            const myLoans = loans.filter(l => l.username === localUser.username);
            return resolve(mockResponse(200, myLoans, config));
          }

          // GET /loans
          if (pathname === '/loans' && method === 'GET') {
            return resolve(mockResponse(200, loans, config));
          }
        }

        return reject(mockError(404, `Mock API route not found: ${method} ${pathname}`));

      } catch (err) {
        console.error('Mock Adapter Error:', err);
        return reject(mockError(500, err.message || 'Internal mock adapter error.'));
      }
    }, 200);
  });
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: useMock ? mockAdapter : undefined,
});

// Request Interceptor: Attach token if it exists in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Redirect on auth failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are not already on login, redirect
      if (!window.location.hash.includes('/login') && !window.location.pathname.includes('/login')) {
        window.location.hash = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
