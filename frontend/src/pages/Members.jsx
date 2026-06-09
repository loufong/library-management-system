import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Plus, Edit2, Trash2, AlertCircle, CheckCircle, Shield } from 'lucide-react';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'MEMBER',
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthorized = currentUser.role === 'ADMIN' || currentUser.role === 'LIBRARIAN';

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/members');
      setMembers(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch library members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchMembers();
    }
  }, [isAuthorized]);

  const handleOpenAddModal = () => {
    setSelectedMember(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'MEMBER',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      username: member.username,
      email: member.email,
      password: '', // Leave blank to avoid changing password unless written
      role: member.role,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (selectedMember) {
        // Edit member
        await api.put(`/members/${selectedMember.id}`, formData);
        setSuccess(`Member "${formData.username}" updated successfully!`);
      } else {
        // Create member
        await api.post('/members', formData);
        setSuccess(`Member "${formData.username}" added successfully!`);
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save member details.');
    }
  };

  const handleDeleteMember = async (memberId, username) => {
    if (username === currentUser.username) {
      setError('You cannot delete your own account!');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete member account "${username}"?`)) return;

    try {
      setError('');
      setSuccess('');
      await api.delete(`/members/${memberId}`);
      setSuccess(`Account "${username}" deleted successfully.`);
      fetchMembers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete member.');
    }
  };

  if (!isAuthorized) {
    return (
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="glass-card p-8 rounded-3xl text-center max-w-md border border-red-500/20">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 class="text-xl font-bold text-slate-100">Access Denied</h2>
          <p class="text-sm text-slate-400 mt-2">You do not have administrative permissions required to view the library directories.</p>
        </div>
      </div>
    );
  }

  return (
    <div class="flex-1 p-8 max-w-7xl mx-auto w-full">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="h-8 w-8 text-indigo-400" />
            <span>Library Members Directory</span>
          </h1>
          <p class="text-slate-400 mt-2">Manage library accounts, librarians, and admin credentials.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Account</span>
        </button>
      </div>

      {/* Messages */}
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
      ) : (
        <div class="glass-card rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider">
                  <th class="py-4 px-6">Username</th>
                  <th class="py-4 px-6">Email Address</th>
                  <th class="py-4 px-6">System Role</th>
                  <th class="py-4 px-6">Joined Date</th>
                  <th class="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50 text-sm text-slate-300">
                {members.map((member) => (
                  <tr key={member.id} class="hover:bg-slate-900/30 transition-colors">
                    <td class="py-4 px-6 font-semibold text-slate-100">{member.username}</td>
                    <td class="py-4 px-6 font-mono text-xs">{member.email}</td>
                    <td class="py-4 px-6">
                      <span class={`px-2 py-1 text-xs font-bold font-mono tracking-wider rounded border ${
                        member.role === 'ADMIN' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : member.role === 'LIBRARIAN' 
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td class="py-4 px-6 font-mono text-xs text-slate-400">
                      {member.createdAt ? member.createdAt.split('T')[0] : 'N/A'}
                    </td>
                    <td class="py-4 px-6 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        class="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-1.5 px-3 rounded-lg text-xs border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteMember(member.id, member.username)}
                        disabled={member.username === currentUser.username}
                        class="bg-red-950/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-red-950/20 disabled:hover:text-red-400 disabled:hover:border-red-500/20"
                        title="Delete Member Account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div class="glass-card w-full max-w-md rounded-3xl p-8 shadow-2xl relative border border-slate-800">
            <h2 class="text-2xl font-extrabold text-slate-100 mb-6">
              {selectedMember ? 'Edit Member Account' : 'Register New Account'}
            </h2>

            <form onSubmit={handleFormSubmit} class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleFormChange}
                  class="glass-input w-full px-4 py-2.5 rounded-xl"
                  placeholder="e.g. member_john"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleFormChange}
                  class="glass-input w-full px-4 py-2.5 rounded-xl"
                  placeholder="e.g. john@library.com"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {selectedMember ? 'Password (leave blank to keep unchanged)' : 'Password'}
                </label>
                <input
                  type="password"
                  name="password"
                  required={!selectedMember}
                  value={formData.password}
                  onChange={handleFormChange}
                  class="glass-input w-full px-4 py-2.5 rounded-xl"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role Permissions</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  class="glass-input w-full px-4 py-2.5 rounded-xl appearance-none bg-slate-900"
                >
                  <option value="MEMBER">Member</option>
                  <option value="LIBRARIAN">Librarian</option>
                  <option value="ADMIN">Administrator</option>
                </select>
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
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
