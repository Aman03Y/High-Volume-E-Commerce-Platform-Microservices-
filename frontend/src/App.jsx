import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LogProvider } from './context/LogContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { AuthPage } from './pages/AuthPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ShieldCheck, Truck, Clock, Headphones, Lock } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
      return 'admin-auth';
    }
    return 'products';
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-black selection:bg-black selection:text-white">
      
      {/* Header Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {activeTab === 'products' && (
          <ProductsPage 
            onOrderCreated={() => setActiveTab('orders')} 
            onProductClick={(product) => {
              setSelectedProduct(product);
              setActiveTab('product-detail');
            }}
            onRequireAuth={() => setActiveTab('auth')}
          />
        )}
        {activeTab === 'product-detail' && selectedProduct && (
          <ProductDetailPage 
            product={selectedProduct} 
            onBack={() => {
              setSelectedProduct(null);
              setActiveTab('products');
            }} 
            onRequireAuth={() => setActiveTab('auth')}
          />
        )}
        {activeTab === 'inventory' && (
          <InventoryPage onNavigateToAuth={() => setActiveTab('auth')} />
        )}
        {activeTab === 'orders' && <OrdersPage />}
        {activeTab === 'auth' && (
          <AuthPage onAuthSuccess={(target) => setActiveTab(target || 'products')} isAdminMode={false} />
        )}
        {activeTab === 'admin-auth' && (
          <AuthPage onAuthSuccess={(target) => setActiveTab(target || 'inventory')} isAdminMode={true} />
        )}
      </main>

      {/* Shopping Cart Drawer */}
      <CartDrawer onOrderCompleted={() => setActiveTab('orders')} />

      {/* Features Value Prop Bar */}
      <section className="bg-white border-y border-gray-200 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-black text-sm uppercase">Express Delivery</h4>
              <p className="text-xs text-gray-500 mt-0.5">Free shipping on orders over ₹100</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-black text-sm uppercase">Authentic & Covered</h4>
              <p className="text-xs text-gray-500 mt-0.5">1-year comprehensive warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-black text-sm uppercase">Real-Time Inventory</h4>
              <p className="text-xs text-gray-500 mt-0.5">Instant stock sync & confirmation</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-black text-sm uppercase">24/7 Support</h4>
              <p className="text-xs text-gray-500 mt-0.5">Dedicated customer care assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Production E-Commerce Footer */}
      <footer className="bg-black text-gray-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-white text-xl uppercase tracking-tighter">AmanY</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Premium high-performance electronics, computer peripherals, audio equipment, and workspace gear.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Quick Navigation</h5>
              <ul className="space-y-2 font-medium">
                <li>
                  <button onClick={() => setActiveTab('products')} className="hover:text-white transition-colors">
                    Store Catalog
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('orders')} className="hover:text-white transition-colors">
                    Order Tracking & Invoices
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('auth')} className="hover:text-white transition-colors">
                    Customer Account
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Customer Service</h5>
              <ul className="space-y-2 font-medium">
                <li><span className="hover:text-white cursor-pointer">Shipping & Returns</span></li>
                <li><span className="hover:text-white cursor-pointer">Warranty Policy</span></li>
                <li><span className="hover:text-white cursor-pointer">Privacy & Terms</span></li>
                <li><span className="hover:text-white cursor-pointer">Help Center</span></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Store Administration</h5>
              <p className="text-gray-400 mb-3 text-[11px]">
                Authorized managers and warehouse administrators can sign in to manage stock and catalog listings.
              </p>
              <button
                onClick={() => setActiveTab('auth')}
                className="px-4 py-2 bg-white text-black hover:bg-gray-200 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                Admin Login
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 AmanY E-Commerce Platform. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Secure 256-Bit SSL Encryption</span>
              <span>•</span>
              <span>PCI-DSS Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LogProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </LogProvider>
      </CartProvider>
    </AuthProvider>
  );
}
