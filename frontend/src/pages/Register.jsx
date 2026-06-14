import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Library, Lock, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { username, email, password, role });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please check your inputs and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden">
      {/* Background glow effects */}
      <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>

      <div class="w-full max-w-md z-10">
        <div class="flex flex-col items-center mb-8">
          <div class="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-4 shadow-inner glow-indigo">
            <Library className="h-10 w-10 text-indigo-400" />
          </div>
          <h2 class="text-3xl font-extrabold text-slate-100 tracking-tight">Create Account</h2>
          <p class="text-sm text-slate-400 mt-2">Join the library management portal</p>
        </div>

        <div class="glass-card p-8 rounded-3xl shadow-2xl relative animate-fade-in">


          {error && (
            <div class="mb-6 flex items-start gap-3 p-4 bg-red-950/20 border border-red-500/30 text-red-200 rounded-xl text-sm animate-pulse">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div class="mb-6 flex items-start gap-3 p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 rounded-xl text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Registration successful! Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} class="space-y-5">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  class="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="john_doe"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  class="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  class="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>



          <p class="mt-5 text-center text-sm text-slate-400">
            Already have an account? {''}
            <Link to="/login" class="text-indigo-400 hover:text-indigo-300 font-semibold underline decoration-indigo-500/50 hover:decoration-indigo-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>


    </div>
  );
};

export default Register;
