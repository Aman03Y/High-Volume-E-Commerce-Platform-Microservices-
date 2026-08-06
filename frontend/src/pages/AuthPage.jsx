import React, { useState } from 'react';
import { Shield, Key, Mail, User, Lock, Check, LogOut, UserCheck, ShieldAlert } from 'lucide-react';
import { handleApiCall } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLog } from '../context/LogContext';

export const AuthPage = () => {
  const { token, user, role, setRole, loginUser, logoutUser } = useAuth();
  const { addLog } = useLog();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('CUSTOMER'); // 'CUSTOMER' | 'ADMIN'

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('customer@amany.com');
  const [password, setPassword] = useState('password123');

  const [profileResult, setProfileResult] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleQuickPreset = (presetRole) => {
    setSelectedRole(presetRole);
    if (presetRole === 'ADMIN') {
      setEmail('admin@amany.com');
      setPassword('admin123');
    } else {
      setEmail('customer@amany.com');
      setPassword('password123');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const payload = { fullName, email, password };
    const res = await handleApiCall('auth-service', 'post', '/api/auth/register', payload, addLog);
    if (res.success) {
      showNotification('Customer Registration request sent to auth-service!');
      setMode('login');
      setSelectedRole('CUSTOMER');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const payload = { email, password };
    const res = await handleApiCall('auth-service', 'post', '/api/auth/login', payload, addLog);

    if (res.success && res.data) {
      const jwtToken = res.data.token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demoToken';
      const userObj = res.data.user || {
        fullName: fullName || (email.includes('admin') ? 'Administrator' : 'Customer Account'),
        email,
      };
      loginUser(jwtToken, userObj, selectedRole);
      showNotification(`Logged in successfully as ${selectedRole}!`);
    }
  };

  const handleTestCustomerProfile = async () => {
    const res = await handleApiCall('auth-service', 'get', '/api/customer/profile', null, addLog);
    if (res.success) {
      setProfileResult(typeof res.data === 'string' ? res.data : JSON.stringify(res.data));
    }
  };

  const handleTestAdminDashboard = async () => {
    const res = await handleApiCall('auth-service', 'get', '/api/admin/dashboard', null, addLog);
    if (res.success) {
      setProfileResult(typeof res.data === 'string' ? res.data : JSON.stringify(res.data));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              MICROSERVICE: auth-service
            </span>
            <span className="text-xs text-slate-500 font-mono">Route: /api/auth</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Authentication & Role Management
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Handles customer registration, admin authentication, JWT tokens, and role-based permissions via API Gateway (Port 8080).
          </p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          {notification.msg}
        </div>
      )}

      {/* Grid Layout: Active User Token Panel vs Auth Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: JWT Token & Session State */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Active Auth & Role State
              </h3>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}
              >
                ROLE: {role}
              </span>
            </div>

            {user ? (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-sm ${
                      role === 'ADMIN' ? 'bg-purple-700' : 'bg-blue-600'
                    }`}
                  >
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      {user.fullName || 'Authenticated Account'}
                      {role === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />}
                    </h4>
                    <p className="text-slate-500 text-[11px] font-mono">{user.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1 font-mono">
                    BEARER JWT TOKEN (AUTOSAVED IN STORAGE)
                  </label>
                  <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg border border-slate-800 break-all whitespace-pre-wrap max-h-28 overflow-y-auto">
                    {token}
                  </pre>
                </div>

                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 block">TEST ROLE ENDPOINTS:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleTestCustomerProfile}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors text-left font-mono"
                    >
                      GET /api/customer/profile
                    </button>
                    <button
                      onClick={handleTestAdminDashboard}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs font-semibold transition-colors text-left font-mono"
                    >
                      GET /api/admin/dashboard
                    </button>
                  </div>
                </div>

                {profileResult && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono text-blue-900">
                    <span className="font-bold block text-[10px] text-blue-700">RESPONSE DATA:</span>
                    {profileResult}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 text-center py-8">
                <Lock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No active session.</p>
                <p className="text-[11px] text-slate-400 mt-1">Sign in as Admin or Customer on the right.</p>
              </div>
            )}
          </div>

          {user && (
            <button
              onClick={logoutUser}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout & Revoke Session
            </button>
          )}
        </div>

        {/* Right Card: Register & Login Forms */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 mb-4">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Account Login
            </button>
            <button
              onClick={() => {
                setMode('register');
                setSelectedRole('CUSTOMER');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Customer Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Role Selection Preset Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Login Account Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('CUSTOMER')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedRole === 'CUSTOMER'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Customer View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('ADMIN')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedRole === 'ADMIN'
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                    Admin Panel
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-2.5 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 ${
                    selectedRole === 'ADMIN' ? 'bg-purple-900 hover:bg-purple-800' : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  Login as {selectedRole} (POST /api/auth/login)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 font-medium">
                New sign ups are automatically created with <span className="font-bold">CUSTOMER</span> privileges.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Customer Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="customer@amany.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  Register Customer (POST /api/auth/register)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
