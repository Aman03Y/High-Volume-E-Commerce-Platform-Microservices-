import React, { useState } from 'react';
import { Package, ShoppingBag, Layers, ShoppingCart, User, LogOut, ShieldCheck, ChevronDown, Menu, X, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, isAdmin, isAuthenticated, logoutUser } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'products', label: 'Store Catalog', icon: Package, show: true },
    { id: 'orders', label: isAdmin ? 'Manage Orders' : 'My Orders', icon: ShoppingBag, show: true },
    { id: 'inventory', label: 'Inventory (Admin)', icon: Layers, show: isAdmin },
  ].filter((item) => item.show);

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top Notification Announcement Bar */}
      <div className="bg-black text-white text-[11px] py-2 px-4 text-center font-bold tracking-widest uppercase flex items-center justify-center gap-2">
        <span>Free Shipping & 30-Day Returns</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavClick('products')}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-black tracking-tighter text-2xl uppercase">AmanY</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider ${
                    isActive
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 text-black transition-colors font-bold text-xs uppercase"
              title="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white font-mono text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* User Account / Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-xs"
                >
                  <div
                    className={`w-7 h-7 rounded-full text-white font-black flex items-center justify-center text-xs bg-black`}
                  >
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                      {user.fullName || 'User'}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 capitalize">
                      {isAdmin ? 'Store Admin' : 'Customer'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in text-xs font-medium">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user.fullName || 'User Account'}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                      <span
                        className={`inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                          isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isAdmin ? 'Administrator' : 'Customer Account'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        handleNavClick('orders');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      {isAdmin ? 'Manage All Orders' : 'My Orders & Invoices'}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          handleNavClick('inventory');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-bold"
                      >
                        <Layers className="w-4 h-4 text-purple-500" />
                        Inventory Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        logoutUser();
                        setIsUserMenuOpen(false);
                        setActiveTab('products');
                      }}
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-black hover:bg-gray-800 rounded-none transition-colors uppercase tracking-wider"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-1 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
