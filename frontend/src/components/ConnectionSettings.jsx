import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  isMockEnabled, 
  setMockEnabled, 
  getCustomApiUrl, 
  setCustomApiUrl, 
  getDefaultApiUrl 
} from '../services/api';
import { Database, Server, Wifi, X, ShieldAlert, CheckCircle, Loader } from 'lucide-react';

const ConnectionSettings = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState(isMockEnabled() ? 'mock' : 'api');
  const [url, setUrl] = useState(getCustomApiUrl() || getDefaultApiUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }

  // Reset states when modal is opened
  useEffect(() => {
    if (isOpen) {
      setMode(isMockEnabled() ? 'mock' : 'api');
      setUrl(getCustomApiUrl() || getDefaultApiUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Validate URL format
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error("URL must start with http:// or https://");
      }

      // Perform direct HTTP call without client-side mock adapter
      const response = await axios.get(`${url}/books`, { 
        timeout: 4000,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.status >= 200 && response.status < 300) {
        setTestResult({
          success: true,
          message: `Connection successful! Remote API server responded and found ${Array.isArray(response.data) ? response.data.length : 0} catalog books.`
        });
      } else {
        setTestResult({
          success: false,
          message: `Server responded with status code ${response.status}.`
        });
      }
    } catch (err) {
      console.error('Connection test error:', err);
      let errMsg = 'Could not connect to the remote backend server. Check for CORS configurations, URL typos, or network connectivity.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = `${err.message}. ${errMsg}`;
      }
      setTestResult({
        success: false,
        message: errMsg
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (mode === 'api' && !url.trim()) {
      alert("Please provide a valid backend API URL.");
      return;
    }
    
    // Save settings
    setMockEnabled(mode === 'mock');
    if (mode === 'api') {
      setCustomApiUrl(url.trim());
    } else {
      setCustomApiUrl(''); // Clear custom URL to revert to default if switching back to mock
    }

    // Close and reload to apply
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-800 my-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all duration-150"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-extrabold text-slate-100 mb-2 flex items-center gap-2">
          <Server className="h-6 w-6 text-indigo-400" />
          <span>Connection Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Configure how the frontend application connects to the library database.
        </p>

        <div className="space-y-6">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Database Connection Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mock Mode Card */}
              <button
                type="button"
                onClick={() => { setMode('mock'); setTestResult(null); }}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                  mode === 'mock' 
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-indigo-500/5' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Database className={`h-5 w-5 ${mode === 'mock' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="font-bold text-sm">Mock Database</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Uses client-side browser storage (localStorage). Fast, self-contained, and works offline, but does not persist across devices.
                </p>
              </button>

              {/* API Mode Card */}
              <button
                type="button"
                onClick={() => { setMode('api'); setTestResult(null); }}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                  mode === 'api' 
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-indigo-500/5' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className={`h-5 w-5 ${mode === 'api' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="font-bold text-sm">Remote API Server</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connects to a remote Spring Boot backend and real MySQL database. Enables data syncing across all devices.
                </p>
              </button>
            </div>
          </div>

          {/* API URL Config - Only shown if Mode is 'api' */}
          {mode === 'api' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Backend API Base URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setTestResult(null); }}
                    className="glass-input flex-1 px-4 py-2.5 rounded-xl font-mono text-sm"
                    placeholder="https://your-api-domain.com/api"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing || !url.trim()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0 text-sm disabled:opacity-50"
                  >
                    {testing ? (
                      <Loader className="h-4 w-4 animate-spin text-indigo-400" />
                    ) : (
                      <Wifi className="h-4 w-4 text-indigo-400" />
                    )}
                    <span>Test</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Must include protocol (http/https) and the <code>/api</code> suffix (e.g. <code>http://192.168.1.100:8080/api</code>).
                </span>
              </div>

              {/* Test Results Display */}
              {testResult && (
                <div className={`p-4 rounded-2xl border text-sm flex gap-3 ${
                  testResult.success 
                    ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200' 
                    : 'bg-red-950/25 border-red-500/30 text-red-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{testResult.success ? 'Success' : 'Connection Failed'}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{testResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold py-3 rounded-xl border border-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionSettings;
