import React from 'react';
import { Package, Shield, Layers, ShoppingBag, Terminal, UserCheck, ShieldAlert, User } from 'lucide-react';
import { useLog } from '../context/LogContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { logs, isConsoleOpen, setIsConsoleOpen } = useLog();
  const { user, role, setRole, logoutUser } = useAuth();

  const isAdmin = role === 'ADMIN';

  // Navigation Items according to Role
  const navItems = [
    { id: 'products', label: 'Products', service: 'product-service', icon: Package, show: true },
    { id: 'inventory', label: 'Inventory (Admin)', service: 'inventory-service', icon: Layers, show: isAdmin },
    { id: 'orders', label: isAdmin ? 'All Orders' : 'My Orders', service: 'order-service', icon: ShoppingBag, show: true },
    { id: 'auth', label: 'Auth & Profile', service: 'auth-service', icon: Shield, show: true },
  ].filter((item) => item.show);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">AmanY</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {isAdmin ? 'ADMIN PANEL' : 'CUSTOMER STORE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Gateway: localhost:8080</p>
            </div>
          </div>

          {/* Microservices Navigation */}
          <nav className="hidden md:flex space-x-1 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* Quick Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setRole('CUSTOMER')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                  !isAdmin
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to Customer Mode"
              >
                <User className="w-3 h-3" />
                Customer
              </button>
              <button
                onClick={() => setRole('ADMIN')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                  isAdmin
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to Admin Mode"
              >
                <ShieldAlert className="w-3 h-3 text-purple-300" />
                Admin
              </button>
            </div>

            {/* Live API Console Toggle Button */}
            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isConsoleOpen
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }`}
              title="Toggle Live Backend HTTP Console"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline font-mono">API Inspector</span>
              {logs.length > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-blue-700 bg-blue-100 rounded-full">
                  {logs.length}
                </span>
              )}
            </button>

            {/* User Profile Badge */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <button
                  onClick={logoutUser}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium underline underline-offset-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav items */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
