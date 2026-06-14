import axios from 'axios';

// Dynamically determine the base URL to support both local development and external/production deployment.
// If the app is run locally in dev mode (usually on port 5173), we default to the local backend port 8080.
// If the app is deployed (served via Nginx on port 80/443 or custom domains), we use the relative path '/api'
// so that requests are routed via the reverse proxy/ingress of the host serving the application.
const getBaseUrl = () => {
  const customUrl = localStorage.getItem('custom_api_url');
  if (customUrl) {
    return customUrl;
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined' && window.location) {
    // If the frontend is served on the Vite local dev server (default port 5173), point to local backend
    if (window.location.port === '5173') {
      return 'http://localhost:8080/api';
    }
    // Otherwise, use relative path '/api' on the current host (works for Docker Compose, K8s Ingress, etc.)
    return '/api';
  }
  
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getBaseUrl();

// Detect if we should use the localStorage mock adapter (e.g. running on GitHub Pages)
const isGitHubPages = typeof window !== 'undefined' && window.location && window.location.hostname.endsWith('github.io');
const useMockSetting = localStorage.getItem('use_mock_api');
const useMock = useMockSetting !== null ? (useMockSetting === 'true') : isGitHubPages;

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
  // Force reset if the old schema or new books are missing
  if (books && (!books.includes('fileType') || !books.includes('b5') || !books.includes('b6') || !books.includes('b7') || !books.includes('b8') || !books.includes('b9') || !books.includes('b10'))) {
    books = null;
  }
  if (!books) {
    const defaultBooks = [
      { 
        id: 'b1', 
        title: 'Clean Code', 
        author: 'Robert C. Martin', 
        isbn: '9780132350884', 
        publisher: 'Prentice Hall', 
        publishedYear: 2008, 
        genre: 'Technology', 
        totalCopies: 5, 
        availableCopies: 5,
        fileType: 'TEXT',
        fileUrl: '',
        fileContent: 'Clean Code: Preface\n\nClean code is code that has been written by someone who cares. It is elegant, simple, and direct. In this book, we will explore methods for styling, structuring, and writing clean, maintainable software.\n\n---PAGE---\nClean Code: Chapter 1 - Meaningful Names\n\nUse intention-revealing names. The name of a variable, function, or class should answer all the big questions. It should tell you why it exists, what it does, and how it is used. If a name requires a comment, then the name does not reveal its intent.\n\n---PAGE---\nClean Code: Chapter 2 - Functions\n\nThe first rule of functions is that they should be small. The second rule of functions is that they should be smaller than that. Functions should do one thing. They should do it well. They should do it only.'
      },
      { 
        id: 'b2', 
        title: 'The Hobbit', 
        author: 'J.R.R. Tolkien', 
        isbn: '9780007487289', 
        publisher: 'George Allen & Unwin', 
        publishedYear: 1937, 
        genre: 'Fantasy', 
        totalCopies: 3, 
        availableCopies: 3,
        fileType: 'TEXT',
        fileUrl: '',
        fileContent: 'The Hobbit: Chapter 1 - An Unexpected Party\n\nIn a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.\n\n---PAGE---\nThe Hobbit: An Unexpected Party (Cont.)\n\nThe door opened on to a tube-shaped hall like a tunnel: a very comfortable tunnel without smoke, with panelled walls, and floors tiled and carpeted, provided with polished chairs, and lots and lots of pegs for hats and coats - the hobbit was fond of visitors.\n\n---PAGE---\nThe Hobbit: Chapter 2 - Roast Mutton\n\nBilbo Baggins was standing in the doorway after breakfast, feeling very happy and comfortable. Suddenly Gandalf came by, Gandalf! If you had only heard a quarter of what I have heard about him, you would be prepared for any sort of remarkable story.'
      },
      { 
        id: 'b3', 
        title: 'Introduction to Algorithms', 
        author: 'Thomas H. Cormen', 
        isbn: '9780262033848', 
        publisher: 'MIT Press', 
        publishedYear: 2009, 
        genre: 'Education', 
        totalCopies: 2, 
        availableCopies: 2,
        fileType: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileContent: ''
      },
      { 
        id: 'b4', 
        title: 'Design Patterns', 
        author: 'Erich Gamma', 
        isbn: '9780201633610', 
        publisher: 'Addison-Wesley', 
        publishedYear: 1994, 
        genre: 'Technology', 
        totalCopies: 4, 
        availableCopies: 4,
        fileType: 'TEXT',
        fileUrl: '',
        fileContent: 'Design Patterns: Introduction\n\nDesign patterns are typical solutions to common problems in software design. Each pattern is like a blueprint that you can customize to solve a particular design problem in your code.\n\n---PAGE---\nDesign Patterns: Creational - Singleton Pattern\n\nSingleton is a creational design pattern that lets you ensure that a class has only one instance, while providing a global access point to this instance. It is useful for sharing database connections or configuration managers.\n\n---PAGE---\nDesign Patterns: Behavioral - Observer Pattern\n\nObserver is a behavioral design pattern that lets you define a subscription mechanism to notify multiple objects about any events that happen to the object they are observing.'
      },
      {
        id: 'b5',
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt',
        isbn: '9780135957059',
        publisher: 'Addison-Wesley',
        publishedYear: 1999,
        genre: 'Technology',
        totalCopies: 3,
        availableCopies: 3,
        fileType: 'TEXT',
        fileUrl: '',
        fileContent: 'The Pragmatic Programmer: Chapter 1 - Pragmatic Philosophy\n\nProvide options, don\'t make lame excuses. Don\'t say it can\'t be done; explain what can be done to salvage the situation. Be a catalyst for change. Participate in your project\'s architecture and design.\n\n---PAGE---\nThe Pragmatic Programmer: Chapter 2 - A Pragmatic Approach\n\nGood design is easier to change than bad design. Keep your code Orthogonal. Orthogonality means that changes in one part of the system do not affect others. Avoid duplication: DRY (Don\'t Repeat Yourself).'
      },
      {
        id: 'b6',
        title: 'Frankenstein',
        author: 'Mary Shelley',
        isbn: '9780141439471',
        publisher: 'Penguin Classics',
        publishedYear: 1818,
        genre: 'Classic Fiction',
        totalCopies: 4,
        availableCopies: 4,
        fileType: 'TEXT',
        fileUrl: '',
        fileContent: 'Frankenstein: Chapter 1\n\nI am by birth a Genevese, and my family is one of the most distinguished of that republic. My ancestors had been for many years counsellors and syndics, and my father had filled several public situations with honour and reputation.\n\n---PAGE---\nFrankenstein: Chapter 2\n\nWe witnessed a most violent and terrible thunderstorm. It advanced from behind the mountains of Jura, and the thunder burst at once with frightful loudness from various quarters of the heaven. I remained watching its progress with curiosity and delight.'
      },
      {
        id: 'b7',
        title: 'Alice in Wonderland',
        author: 'Lewis Carroll',
        isbn: '9780199558292',
        publisher: 'Oxford University Press',
        publishedYear: 1865,
        genre: 'Classic Fiction',
        totalCopies: 5,
        availableCopies: 5,
        fileType: 'TEXT',
        fileUrl: '',
        fileContent: 'Alice\'s Adventures in Wonderland: Chapter 1 - Down the Rabbit-Hole\n\nAlice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, \'and what is the use of a book,\' thought Alice \'without pictures or conversations?\'\n\n---PAGE---\nAlice\'s Adventures in Wonderland: Down the Rabbit-Hole (Cont.)\n\nSo she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.'
      },
      {
        id: 'b8',
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        isbn: '9780596517748',
        publisher: 'O\'Reilly Media',
        publishedYear: 2008,
        genre: 'Technology',
        totalCopies: 3,
        availableCopies: 3,
        fileType: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileContent: ''
      },
      {
        id: 'b9',
        title: 'Eloquent JavaScript',
        author: 'Marijn Haverbeke',
        isbn: '9781593279509',
        publisher: 'No Starch Press',
        publishedYear: 2018,
        genre: 'Technology',
        totalCopies: 4,
        availableCopies: 4,
        fileType: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileContent: ''
      },
      {
        id: 'b10',
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '9780553380163',
        publisher: 'Bantam Books',
        publishedYear: 1998,
        genre: 'Science',
        totalCopies: 3,
        availableCopies: 3,
        fileType: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileContent: ''
      }
    ];
    localStorage.setItem('mock_books', JSON.stringify(defaultBooks));
    return defaultBooks;
  }
  return JSON.parse(books);
};

// In-memory store for large base64 file uploads to prevent localStorage QuotaExceededError
const inMemoryFiles = {};

const saveMockBooks = (books) => {
  // To prevent QuotaExceededError in localStorage, extract and store large fileContents in-memory
  const sanitizedBooks = books.map(book => {
    if (book.fileContent && book.fileContent.startsWith('data:') && book.fileContent.length > 51200) { // > 50KB
      inMemoryFiles[book.id] = book.fileContent;
      return {
        ...book,
        fileContent: '', // Clear the content from localStorage
        // Ensure there is a fallback URL so the reader still works if refreshed
        fileUrl: book.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      };
    }
    return book;
  });

  try {
    localStorage.setItem('mock_books', JSON.stringify(sanitizedBooks));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    // If it still fails, try removing fileContent from ALL books to recover
    const minimalBooks = sanitizedBooks.map(book => ({
      ...book,
      fileContent: ''
    }));
    try {
      localStorage.setItem('mock_books', JSON.stringify(minimalBooks));
    } catch (err) {
      console.error('Critical: Failed to save even minimal books database to localStorage:', err);
    }
  }
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
          const { email, password } = body;
          const users = getMockUsers();
          const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
          if (!user) {
            return reject(mockError(400, 'Invalid email or password. Please try again.'));
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

            // Merge in-memory files back for books
            result = result.map(b => ({
              ...b,
              fileContent: inMemoryFiles[b.id] || b.fileContent || ''
            }));
            
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (localUser.role === 'MEMBER') {
              const loans = getMockLoans();
              const activeLoanBookIds = new Set(
                loans
                  .filter(l => l.username === localUser.username && l.status !== 'RETURNED')
                  .map(l => l.bookId)
              );
              result = result.map(b => {
                if (!activeLoanBookIds.has(b.id)) {
                  return {
                    ...b,
                    fileUrl: '',
                    fileContent: ''
                  };
                }
                return b;
              });
            }
            
            return resolve(mockResponse(200, result, config));
          }

          // POST /books
          if (method === 'POST') {
            const { title, author, isbn, publisher, publishedYear, genre, totalCopies, fileUrl, fileType, fileContent } = body;
            const newBook = {
              id: 'b_' + Date.now(),
              title,
              author,
              isbn,
              publisher,
              publishedYear: parseInt(publishedYear) || new Date().getFullYear(),
              genre,
              totalCopies: parseInt(totalCopies) || 1,
              availableCopies: parseInt(totalCopies) || 1,
              fileUrl: fileUrl || '',
              fileType: fileType || 'NONE',
              fileContent: fileContent || ''
            };
            books.push(newBook);
            saveMockBooks(books);

            // Re-merge fileContent from inMemoryFiles to return the complete object to client
            const responseBook = {
              ...newBook,
              fileContent: inMemoryFiles[newBook.id] || newBook.fileContent || ''
            };
            return resolve(mockResponse(200, responseBook, config));
          }

          // PUT /books/:id
          if (method === 'PUT') {
            const id = pathname.split('/')[2];
            const idx = books.findIndex(b => b.id === id);
            if (idx === -1) return reject(mockError(404, 'Book not found.'));
            
            const { title, author, isbn, publisher, publishedYear, genre, totalCopies, fileUrl, fileType, fileContent } = body;
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
              availableCopies: newAvailable,
              fileUrl: fileUrl !== undefined ? fileUrl : prevBook.fileUrl,
              fileType: fileType !== undefined ? fileType : prevBook.fileType,
              fileContent: fileContent !== undefined ? fileContent : prevBook.fileContent
            };
            saveMockBooks(books);

            // Re-merge fileContent from inMemoryFiles to return the complete object to client
            const responseBook = {
              ...books[idx],
              fileContent: inMemoryFiles[books[idx].id] || books[idx].fileContent || ''
            };
            return resolve(mockResponse(200, responseBook, config));
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

            const activeLoan = loans.find(l => l.username === user.username && l.status !== 'RETURNED');
            if (activeLoan) {
              return reject(mockError(400, 'You must return your currently borrowed book before borrowing a new one.'));
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

export const isMockEnabled = () => {
  const isGitHubPages = typeof window !== 'undefined' && window.location && window.location.hostname.endsWith('github.io');
  const useMockSetting = localStorage.getItem('use_mock_api');
  return useMockSetting !== null ? (useMockSetting === 'true') : isGitHubPages;
};

export const setMockEnabled = (enabled) => {
  localStorage.setItem('use_mock_api', enabled ? 'true' : 'false');
};

export const getCustomApiUrl = () => {
  return localStorage.getItem('custom_api_url') || '';
};

export const setCustomApiUrl = (url) => {
  if (url) {
    localStorage.setItem('custom_api_url', url);
  } else {
    localStorage.removeItem('custom_api_url');
  }
};

export const getDefaultApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.port === '5173') {
      return 'http://localhost:8080/api';
    }
    return window.location.origin + '/api';
  }
  return 'http://localhost:8080/api';
};

export default api;
