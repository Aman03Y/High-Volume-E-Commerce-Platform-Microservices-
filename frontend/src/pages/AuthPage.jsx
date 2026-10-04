import React, { useState } from 'react';
import { Key, Mail, User, Lock, CheckCircle2, UserCheck, ShieldAlert, Zap, LogOut } from 'lucide-react';
import { handleApiCall } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLog } from '../context/LogContext';
import { useToast } from '../components/Toast';

export const AuthPage = ({ onAuthSuccess, isAdminMode = false }) => {
  const { user, isAdmin, isAuthenticated, loginUser, logoutUser } = useAuth();
  const { addLog } = useLog();
  const { addToast } = useToast();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isAdminMode) {
        // Admin Login Logic
        const payload = { email: email || 'admin@amany.com', password: password || 'admin123' };
        const res = await handleApiCall('auth-service', 'post', '/api/auth/login', payload, addLog);
        
        if (res.success && res.data) {
          const jwtToken = res.data.token || `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(payload.email)}.adminToken`;
          const userObj = res.data.user || { fullName: 'Store Administrator', email: payload.email };
          loginUser(jwtToken, userObj, 'ADMIN');
          addToast('Administrator privileges granted.', 'success');
          if (onAuthSuccess) onAuthSuccess('inventory');
        }
      } else {
        // Customer Logic (Login or Register)
        if (isRegisterMode) {
          const payload = { fullName, email, password };
          const res = await handleApiCall('auth-service', 'post', '/api/auth/register', payload, addLog);
          if (res.success) {
            addToast('Account created successfully! Please sign in.', 'success');
            setIsRegisterMode(false);
          }
        } else {
          const payload = { email, password };
          const res = await handleApiCall('auth-service', 'post', '/api/auth/login', payload, addLog);
          if (res.success && res.data) {
            const jwtToken = res.data.token || `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(email)}.custToken`;
            const userObj = res.data.user || { fullName: fullName || email.split('@')[0], email };
            loginUser(jwtToken, userObj, 'CUSTOMER');
            addToast(`Welcome back, ${userObj.fullName}!`, 'success');
            if (onAuthSuccess) onAuthSuccess('products');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAdminLogin = () => {
    const adminUser = { fullName: 'Chief Administrator', email: 'admin@amany.com' };
    loginUser(`token_admin_${Date.now()}`, adminUser, 'ADMIN');
    addToast('Logged in as Store Administrator!', 'success');
    if (onAuthSuccess) onAuthSuccess('inventory');
  };

  return (
    <div className="max-w-md mx-auto py-16 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-black tracking-tighter uppercase mb-3">
          {isAdminMode ? 'Admin Portal' : isAuthenticated ? 'My Account' : (isRegisterMode ? 'Create Account' : 'Sign In')}
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          {isAdminMode 
            ? 'Authorized personnel only.'
            : isAuthenticated
              ? 'Manage your account session and settings.'
              : 'Join AmanY to shop premium electronics.'}
        </p>
      </div>

      {isAuthenticated ? (
        <div className="space-y-6">
          <div className="p-8 border-2 border-black flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-black text-white font-black text-2xl flex items-center justify-center rounded-full">
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-bold text-black text-xl uppercase tracking-tight">{user.fullName || 'User'}</h3>
              <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            </div>
            <div className="inline-block mt-2 px-3 py-1 bg-gray-100 text-black text-xs font-bold uppercase tracking-wider">
              {isAdmin ? 'Store Administrator' : 'Verified Customer'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isAdmin && (
              <button
                onClick={() => onAuthSuccess && onAuthSuccess('inventory')}
                className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider transition-colors hover:bg-gray-800 flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                Go to Inventory
              </button>
            )}
            <button
              onClick={logoutUser}
              className="w-full py-4 bg-white text-black border-2 border-black font-bold uppercase tracking-wider transition-colors hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {isAdminMode && (
            <div className="p-4 bg-gray-100 border-l-4 border-black mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-xs text-black uppercase tracking-wider block">Quick Access</span>
                  <span className="text-xs text-gray-600 font-medium mt-1 block">Instant login as Chief Admin</span>
                </div>
                <button
                  type="button"
                  onClick={handleDirectAdminLogin}
                  className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  1-Click Sign In
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isAdminMode && isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-medium text-sm text-black"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                placeholder={isAdminMode ? "admin@amany.com" : "customer@amany.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-medium text-sm text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-medium text-sm text-black"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAdminMode ? 'Sign In as Admin' : (isRegisterMode ? 'Create Account' : 'Sign In')}
              </button>
            </div>

            {!isAdminMode && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs text-gray-500 hover:text-black font-bold uppercase tracking-wider transition-colors"
                >
                  {isRegisterMode
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
