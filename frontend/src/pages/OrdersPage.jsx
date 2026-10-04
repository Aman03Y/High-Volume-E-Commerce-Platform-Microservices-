import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Plus, RefreshCw, CheckCircle2, Clock, Truck, XCircle, Trash2, ShoppingCart, DollarSign, TrendingUp, Search, Filter, FileText, ArrowRight, PackageCheck, User } from 'lucide-react';
import { handleApiCall } from '../api/client';
import { useLog } from '../context/LogContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { AdminStatusUpdater } from '../components/AdminStatusUpdater';

export const OrdersPage = () => {
  const { addLog } = useLog();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Form State for manual order placement
  const [formData, setFormData] = useState({
    customerId: '101',
    productId: '',
    quantity: '1',
    name: '',
    address: '',
    phone: '',
    paymentMethod: 'cod',
  });

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
      customerId: user ? '101' : '101',
      productId: productList.length > 0 ? productList[0].id : '1',
      quantity: '1',
      name: '',
      address: '',
      phone: '',
      paymentMethod: 'cod',
    });
    setIsModalOpen(true);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const productIdInt = parseInt(formData.productId);
    const quantityInt = parseInt(formData.quantity);
    
    const product = productList.find(p => p.id === productIdInt);
    const price = product ? parseFloat(product.price || 0) : 0;
    
    const payload = {
      customerId: parseInt(formData.customerId),
      productId: productIdInt,
      quantity: quantityInt,
      totalPrice: price * quantityInt,
      name: formData.name,
      address: formData.address,
      phoneNumber: formData.phone,
      paymentMethod: formData.paymentMethod,
    };

    const res = await handleApiCall('order-service', 'post', '/api/orders', payload, addLog);
    if (res.success) {
      addToast(`Order placed successfully!`, 'success');
      setIsModalOpen(false);
      fetchOrdersAndProducts();
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!isAdmin) {
      addToast('Only Administrators can cancel or delete existing order records', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to cancel / delete Order #${id}?`)) return;
    const res = await handleApiCall('order-service', 'delete', `/api/orders/${id}`, null, addLog);
    if (res.success) {
      addToast(`Order #${id} deleted`, 'info');
      fetchOrdersAndProducts();
    }
  };

  const getProductName = (prodId) => {
    const found = productList.find((p) => p.id === prodId);
    return found ? found.name : `Product #${prodId}`;
  };

  const renderStatusBadge = (status) => {
    const s = String(status || 'CONFIRMED').toUpperCase();
    if (s === 'CONFIRMED' || s === 'DELIVERED' || s === 'COMPLETED') {
      return (
        <span className="inline-block px-2 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider">
          {s}
        </span>
      );
    }
    if (s === 'SHIPPED' || s === 'PROCESSING') {
      return (
        <span className="inline-block px-2 py-1 bg-gray-200 text-black text-[10px] font-bold uppercase tracking-wider">
          {s}
        </span>
      );
    }
    if (s === 'PENDING') {
      return (
        <span className="inline-block px-2 py-1 border border-black text-black text-[10px] font-bold uppercase tracking-wider">
          {s}
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-1 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider line-through">
        {s}
      </span>
    );
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const prodName = getProductName(order.productId).toLowerCase();
      const matchSearch =
        String(order.id).includes(searchQuery) ||
        String(order.customerId).includes(searchQuery) ||
        prodName.includes(searchQuery.toLowerCase());
      if (statusFilter === 'ALL') return matchSearch;
      return matchSearch && String(order.status).toUpperCase() === statusFilter;
    });
  }, [orders, productList, searchQuery, statusFilter]);

  const totalGrossRevenue = orders.reduce((acc, o) => acc + (parseFloat(o.totalPrice) || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalGrossRevenue / orders.length : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase">
            {isAdmin ? 'All Orders' : 'My Orders'}
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {isAdmin ? 'Fulfillment Ledger' : 'Purchase History'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={fetchOrdersAndProducts}
            className="p-2 text-black bg-gray-100 hover:bg-gray-200 text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wider"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleOpenModal}
            className="p-2 text-white bg-black hover:bg-gray-800 text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Place Order</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-black p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-2">
            {isAdmin ? 'Total Orders' : 'My Orders'}
          </span>
          <p className="text-3xl font-black text-black tracking-tighter">{orders.length}</p>
        </div>

        <div className="border border-black p-5 flex flex-col justify-between bg-black text-white">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Total Volume</span>
          <p className="text-3xl font-black tracking-tighter">₹{totalGrossRevenue.toFixed(2)}</p>
        </div>

        <div className="border border-black p-5 flex flex-col justify-between bg-gray-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Average Value</span>
          <p className="text-3xl font-black text-black tracking-tighter">₹{avgOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="py-4 flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-gray-200">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search Orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-black text-black font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto overflow-x-auto">
          {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider ${
                statusFilter === st
                  ? 'bg-black text-white'
                  : 'bg-transparent text-gray-500 hover:text-black hover:bg-gray-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div>
        {loading ? (
          <div className="p-16 text-center border border-black">
            <RefreshCw className="w-8 h-8 text-black animate-spin mx-auto mb-3" />
            <p className="text-xs text-black font-bold uppercase tracking-wider">Loading Orders</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center border border-black">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-black text-black uppercase tracking-wider">No Orders Found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto border border-black">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-black text-black font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 border-r border-black">ID</th>
                  <th className="py-4 px-6 border-r border-black">Customer</th>
                  <th className="py-4 px-6 border-r border-black">Product</th>
                  <th className="py-4 px-6 border-r border-black text-center">Qty</th>
                  <th className="py-4 px-6 border-r border-black text-right">Total</th>
                  <th className="py-4 px-6 border-r border-black text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 border-r border-gray-200 font-bold text-black">#{order.id}</td>
                    <td className="py-4 px-6 border-r border-gray-200">
                      <div className="font-bold text-black">Cust #{order.customerId}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 border-r border-gray-200">
                      <div className="font-bold text-black">{getProductName(order.productId)}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Item #{order.productId}</div>
                    </td>
                    <td className="py-4 px-6 border-r border-gray-200 text-center font-bold text-black">{order.quantity}x</td>
                    <td className="py-4 px-6 border-r border-gray-200 text-right">
                      <span className="font-black text-black text-sm">
                        ₹{parseFloat(order.totalPrice || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6 border-r border-gray-200 text-center">
                      {isAdmin ? (
                        <AdminStatusUpdater order={order} onStatusUpdated={fetchOrdersAndProducts} />
                      ) : (
                        renderStatusBadge(order.status)
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className="p-2 text-black hover:bg-gray-200 transition-colors inline-block"
                        title="View Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-black hover:bg-red-100 hover:text-red-600 transition-colors inline-block"
                          title="Cancel Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Invoice Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-black text-white">
              <h3 className="font-black uppercase tracking-wider text-sm">Invoice #{selectedOrderDetails.id}</h3>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-gray-400 hover:text-white font-bold p-1">
                ✕
              </button>
            </div>

            <div className="p-8 space-y-6 text-sm">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <div>
                  <span className="text-gray-500 text-[10px] font-bold block uppercase tracking-wider mb-1">Status</span>
                  <div>{renderStatusBadge(selectedOrderDetails.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-[10px] font-bold block uppercase tracking-wider mb-1">Date</span>
                  <span className="font-bold text-black">
                    {new Date(selectedOrderDetails.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 font-medium text-black">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer ID</span>
                  <span className="font-bold">Cust-{selectedOrderDetails.customerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-bold">{selectedOrderDetails.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-bold">{selectedOrderDetails.phoneNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address</span>
                  <span className="font-bold text-right max-w-[200px]">{selectedOrderDetails.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Product</span>
                  <span className="font-bold text-right max-w-[200px]">{getProductName(selectedOrderDetails.productId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity</span>
                  <span className="font-bold">{selectedOrderDetails.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-bold uppercase">{selectedOrderDetails.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <span className={`font-bold uppercase ${selectedOrderDetails.paymentStatus === 'Payment Successful' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedOrderDetails.paymentStatus || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t-2 border-black text-base font-black uppercase">
                  <span>Total Paid</span>
                  <span>₹{parseFloat(selectedOrderDetails.totalPrice || 0).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  addToast('Invoice saved', 'info');
                  setSelectedOrderDetails(null);
                }}
                className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors mt-6"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Place Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
              <h3 className="font-black text-black uppercase tracking-wider text-sm">Place Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-black hover:text-gray-500 font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2">Customer ID *</label>
                <input
                  type="number"
                  required
                  placeholder="101"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-bold text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2">Product *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-bold text-sm text-black"
                >
                  {productList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{parseFloat(p.price || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-bold text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-bold text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-bold text-sm text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-bold text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2">Payment</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-bold text-sm text-black"
                  >
                    <option value="cod">COD</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-black text-black font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors text-xs"
                >
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
