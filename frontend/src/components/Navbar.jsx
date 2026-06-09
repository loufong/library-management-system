import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Users, History, LogOut, Library } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  
  if (!userStr) return null;
  
  const user = JSON.parse(userStr);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => 
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
      isActive(path) 
        ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-200' 
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
    }`;

  return (
    <nav class="sticky top-0 z-50 glass-card px-6 py-4 flex items-center justify-between shadow-lg backdrop-blur-md">
      <Link to="/dashboard" class="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        <Library className="h-6 w-6 text-indigo-400" />
        <span>Library OS</span>
      </Link>

      <div class="flex items-center gap-4">
        <Link to="/dashboard" className={linkClass('/dashboard')}>
          Dashboard
        </Link>
        
        <Link to="/books" className={linkClass('/books')}>
          <BookOpen className="h-4 w-4" />
          <span>Books</span>
        </Link>

        {/* View Loans: Admin & Librarian can view all; Members see their loan history */}
        <Link to="/loans" className={linkClass('/loans')}>
          <History className="h-4 w-4" />
          <span>{user.role === 'MEMBER' ? 'My Loans' : 'Loans'}</span>
        </Link>

        {/* View Members list: Restricted to Admin/Librarian */}
        {(user.role === 'ADMIN' || user.role === 'LIBRARIAN') && (
          <Link to="/members" className={linkClass('/members')}>
            <Users className="h-4 w-4" />
            <span>Members</span>
          </Link>
        )}
      </div>

      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-sm font-semibold text-slate-200">{user.username}</p>
          <p class="text-xs text-indigo-400 font-mono tracking-wider">{user.role}</p>
        </div>
        
        <button 
          onClick={handleLogout}
          class="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-500/30 transition-all duration-200"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
