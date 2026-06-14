import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Users, History, LogOut, Library, Menu, X, Settings } from 'lucide-react';
import ConnectionSettings from './ConnectionSettings';
import { isMockEnabled } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  if (!userStr) return null;
  
  const user = JSON.parse(userStr);

  const handleLogout = () => {
    setIsOpen(false);
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
    <nav class="sticky top-0 z-50 glass-card px-6 py-4 flex flex-col shadow-lg backdrop-blur-md">
      <div class="flex items-center justify-between w-full">
        <Link to="/dashboard" onClick={() => setIsOpen(false)} class="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          <Library className="h-6 w-6 text-indigo-400" />
          <span>Library OS</span>
        </Link>

        {/* Hamburger Menu Toggle (Mobile Only) */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          class="md:hidden flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-slate-700/50"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Navigation Links (Desktop Menu) */}
        <div class="hidden md:flex items-center gap-4">
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>
          
          <Link to="/books" className={linkClass('/books')}>
            <BookOpen className="h-4 w-4" />
            <span>Books</span>
          </Link>

          <Link to="/loans" className={linkClass('/loans')}>
            <History className="h-4 w-4" />
            <span>{user.role === 'MEMBER' ? 'My Loans' : 'Loans'}</span>
          </Link>

          {(user.role === 'ADMIN' || user.role === 'LIBRARIAN') && (
            <Link to="/members" className={linkClass('/members')}>
              <Users className="h-4 w-4" />
              <span>Members</span>
            </Link>
          )}
        </div>

        {/* Profile Info and Logout (Desktop) */}
        <div class="hidden md:flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm font-semibold text-slate-200">{user.username}</p>
            <div className="flex items-center gap-1.5 justify-end">
              <span className={`w-1.5 h-1.5 rounded-full ${isMockEnabled() ? 'bg-indigo-400' : 'bg-emerald-400 animate-pulse'}`} title={isMockEnabled() ? 'Mock Database Mode' : 'Connected to Remote API'}></span>
              <p class="text-xs text-indigo-400 font-mono tracking-wider">{user.role}</p>
            </div>
          </div>

          <button 
            onClick={() => setShowSettings(true)}
            class="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/20 border border-transparent hover:border-indigo-500/30 transition-all duration-200"
            title="Database Connection Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          
          <button 
            onClick={handleLogout}
            class="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-500/30 transition-all duration-200"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Expandable Mobile Navigation Dropdown Menu */}
      {isOpen && (
        <div class="md:hidden mt-4 pt-4 border-t border-slate-800/80 flex flex-col gap-4 animate-fade-in">
          <div class="flex flex-col gap-2">
            <Link 
              to="/dashboard" 
              onClick={() => setIsOpen(false)} 
              className={linkClass('/dashboard')}
            >
              Dashboard
            </Link>
            
            <Link 
              to="/books" 
              onClick={() => setIsOpen(false)} 
              className={linkClass('/books')}
            >
              <BookOpen className="h-4 w-4" />
              <span>Books</span>
            </Link>

            <Link 
              to="/loans" 
              onClick={() => setIsOpen(false)} 
              className={linkClass('/loans')}
            >
              <History className="h-4 w-4" />
              <span>{user.role === 'MEMBER' ? 'My Loans' : 'Loans'}</span>
            </Link>

            {(user.role === 'ADMIN' || user.role === 'LIBRARIAN') && (
              <Link 
                to="/members" 
                onClick={() => setIsOpen(false)} 
                className={linkClass('/members')}
              >
                <Users className="h-4 w-4" />
                <span>Members</span>
              </Link>
            )}
          </div>

          <div class="flex items-center justify-between border-t border-slate-800/80 pt-4 px-2">
            <div class="text-left">
              <p class="text-sm font-semibold text-slate-200">{user.username}</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isMockEnabled() ? 'bg-indigo-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                <p class="text-xs text-indigo-400 font-mono tracking-wider">{user.role}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => { setIsOpen(false); setShowSettings(true); }}
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-indigo-400 bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all duration-200 text-xs font-semibold"
                title="Connection Settings"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>

              <button 
                onClick={handleLogout}
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-white bg-red-950/20 hover:bg-red-600/30 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 text-xs font-semibold"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConnectionSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </nav>
  );
};

export default Navbar;
