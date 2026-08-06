import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, RefreshCw, CheckCircle2, Clock, Truck, XCircle, Trash2, Check, AlertCircle, ShoppingCart } from 'lucide-react';
import { handleApiCall } from '../api/client';
import { useLog } from '../context/LogContext';

export const OrdersPage = () => {
  const { addLog } = useLog();
  const [orders, setOrders] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerId: '101',
    productId: '',
    quantity: '1',
  });

  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchOrdersAndProducts = async () => {
    setLoading(true);
    const [orderRes, prodRes] = await Promise.all([
      handleApiCall('order-service', 'get', '/api/orders', null, addLog),
      handleApiCall('product-service', 'get', '/api/products', null, addLog),
    ]);

    if (orderRes.success && Array.isArray(orderRes.data)) {
      setOrders(orderRes.data);
    }
    if (prodRes.success && Array.isArray(prodRes.data)) {
      setProductList(prodRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrdersAndProducts();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      customerId: '101',
      productId: productList.length > 0 ? productList[0].id : '1',
      quantity: '1',
    });
    setIsModalOpen(true);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const payload = {
      customerId: parseInt(formData.customerId),
      productId: parseInt(formData.productId),
      quantity: parseInt(formData.quantity),
    };

    const res = await handleApiCall('order-service', 'post', '/api/orders', payload, addLog);
    if (res.success) {
      showNotification('Order placed successfully via order-service');
      setIsModalOpen(false);
      fetchOrdersAndProducts();
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Order #${id}?`)) return;
    const res = await handleApiCall('order-service', 'delete', `/api/orders/${id}`, null, addLog);
    if (res.success) {
      showNotification(`Order #${id} deleted via order-service`, 'info');
      fetchOrdersAndProducts();
    }
  };

  const getProductName = (prodId) => {
    const found = productList.find((p) => p.id === prodId);
    return found ? found.name : `Product ID #${prodId}`;
  };

  const renderStatusBadge = (status) => {
    const s = String(status || 'CONFIRMED').toUpperCase();
    if (s === 'CONFIRMED' || s === 'DELIVERED' || s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          {s}
        </span>
      );
    }
    if (s === 'SHIPPED' || s === 'PROCESSING') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Truck className="w-3 h-3 text-blue-500" />
          {s}
        </span>
      );
    }
    if (s === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-500" />
          PENDING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3 h-3 text-rose-500" />
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              MICROSERVICE: order-service
            </span>
            <span className="text-xs text-slate-500 font-mono">Route: /api/orders</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">Customer Order Dispatch</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Handles high-volume purchase transactions, order processing, and total price calculation via API Gateway (Port 8080).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrdersAndProducts}
            className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Place New Order
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-lg border text-xs font-medium flex items-center gap-2 animate-fade-in ${
            notification.type === 'info'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <Check className="w-4 h-4" />
          {notification.msg}
        </div>
      )}

      {/* Order List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm">Active Orders ({orders.length})</h3>
          <span className="text-xs text-slate-500 font-mono">POST & GET /api/orders</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading orders from order-service...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No orders recorded yet</h3>
            <p className="text-xs text-slate-500 mt-1">Place an order from the products page or click Place New Order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
                  <th className="py-3 px-6">Order ID</th>
                  <th className="py-3 px-6">Customer ID</th>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Qty</th>
                  <th className="py-3 px-6">Total Price</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">#{order.id}</td>
                    <td className="py-4 px-6 font-mono text-slate-600">Cust-{order.customerId}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{getProductName(order.productId)}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Prod ID: #{order.productId}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">{order.quantity}x</td>
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-slate-900 text-sm">
                        ₹{parseFloat(order.totalPrice || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">{renderStatusBadge(order.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Place Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-base">Place Order via order-service</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer ID *</label>
                <input
                  type="number"
                  required
                  placeholder="101"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {productList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{parseFloat(p.price || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
