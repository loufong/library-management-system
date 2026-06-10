import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Loans from './pages/Loans';
import Members from './pages/Members';

function App() {
  const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/register';

  return (
    <Router>
      <div class="min-h-screen bg-slate-950 flex flex-col">
        {/* Navbar only loads if the user is authenticated */}
        <Navbar />
        
        <main class="flex-1 flex flex-col">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Core Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/books" element={
              <ProtectedRoute>
                <Books />
              </ProtectedRoute>
            } />
            <Route path="/loans" element={
              <ProtectedRoute>
                <Loans />
              </ProtectedRoute>
            } />
            <Route path="/members" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}>
                <Members />
              </ProtectedRoute>
            } />

            {/* Default fallback redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
