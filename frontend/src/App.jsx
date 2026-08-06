import React, { useState } from 'react';
import { LogProvider } from './context/LogContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ApiConsole } from './components/ApiConsole';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { AuthPage } from './pages/AuthPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Header Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && (
          <ProductsPage onOrderCreated={() => setActiveTab('orders')} />
        )}
        {activeTab === 'inventory' && <InventoryPage />}
        {activeTab === 'orders' && <OrdersPage />}
        {activeTab === 'auth' && <AuthPage />}
      </main>

      {/* Slide-out Live API Inspector Console */}
      <ApiConsole />

      {/* Sleek Minimalist Footer showcasing Microservice Routes */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">AmanY E-Commerce Platform</span>
            <span className="text-slate-400">|</span>
            <span>API Gateway Target: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">http://localhost:8080</code></span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
              auth-service :8081
            </span>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
              product-service :8082
            </span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200">
              inventory-service :8083
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              order-service :8084
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LogProvider>
        <AppContent />
      </LogProvider>
    </AuthProvider>
  );
}
