import React, { useState, useEffect } from 'react';
import { Layers, Plus, RefreshCw, Edit3, Trash2, Check, AlertCircle, Box, ShieldAlert, Lock, ArrowRight } from 'lucide-react';
import { handleApiCall } from '../api/client';
import { useLog } from '../context/LogContext';
import { useAuth } from '../context/AuthContext';

export const InventoryPage = () => {
  const { addLog } = useLog();
  const { role, setRole } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [inventoryList, setInventoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
  });

  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchInventoryAndProducts = async () => {
    if (!isAdmin) return;
    setLoading(true);
    const [invRes, prodRes] = await Promise.all([
      handleApiCall('inventory-service', 'get', '/api/inventory', null, addLog),
      handleApiCall('product-service', 'get', '/api/products', null, addLog),
    ]);

    if (invRes.success && Array.isArray(invRes.data)) {
      setInventoryList(invRes.data);
    }
    if (prodRes.success && Array.isArray(prodRes.data)) {
      setProductList(prodRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventoryAndProducts();
  }, [role]);

  // Customer Access Restriction View
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto border border-purple-200 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Access Required</h2>
          <p className="text-slate-500 text-xs mt-2 max-w-md mx-auto leading-relaxed">
            The Inventory Microservice (<code className="font-mono text-purple-700 bg-purple-50 px-1 rounded">inventory-service</code>) is reserved for administrator management. Customers cannot modify or inspect raw warehouse stock.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setRole('ADMIN')}
            className="px-4 py-2.5 bg-purple-900 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            Switch to Admin Mode
          </button>
        </div>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      productId: productList.length > 0 ? productList[0].id : '1',
      quantity: '50',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      productId: item.productId,
      quantity: item.quantity,
    });
    setIsModalOpen(true);
  };

  const handleQuickAdjust = async (item, delta) => {
    const newQty = Math.max(0, parseInt(item.quantity || 0) + delta);
    const res = await handleApiCall(
      'inventory-service',
      'put',
      `/api/inventory/${item.productId}`,
      { quantity: newQty },
      addLog
    );
    if (res.success) {
      showNotification(`Updated Product #${item.productId} stock to ${newQty}`);
      fetchInventoryAndProducts();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      productId: parseInt(formData.productId),
      quantity: parseInt(formData.quantity),
    };

    if (editingItem) {
      const res = await handleApiCall(
        'inventory-service',
        'put',
        `/api/inventory/${editingItem.productId}`,
        payload,
        addLog
      );
      if (res.success) {
        showNotification('Inventory item updated successfully via inventory-service');
        setIsModalOpen(false);
        fetchInventoryAndProducts();
      }
    } else {
      const res = await handleApiCall('inventory-service', 'post', '/api/inventory', payload, addLog);
      if (res.success) {
        showNotification('Inventory entry created via inventory-service');
        setIsModalOpen(false);
        fetchInventoryAndProducts();
      }
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(`Are you sure you want to delete inventory record for Product ID #${productId}?`)) return;
    const res = await handleApiCall('inventory-service', 'delete', `/api/inventory/${productId}`, null, addLog);
    if (res.success) {
      showNotification('Inventory record deleted via inventory-service', 'info');
      fetchInventoryAndProducts();
    }
  };

  const getProductName = (prodId) => {
    const found = productList.find((p) => p.id === prodId);
    return found ? found.name : `Product ID #${prodId}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              MICROSERVICE: inventory-service
            </span>
            <span className="text-xs text-slate-500 font-mono">Route: /api/inventory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Stock & Inventory Management (Admin Only)
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Monitors real-time stock levels, replenishment, and inventory reserves via API Gateway (Port 8080).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInventoryAndProducts}
            className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Inventory Record
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

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Inventory Entries</span>
            <Box className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{inventoryList.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">In-Stock Items</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {inventoryList.filter((i) => i.quantity > 0 || i.inStock).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Low Stock Alerts (&lt; 15)</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {inventoryList.filter((i) => (i.quantity || 0) < 15).length}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm">Inventory Live Ledger</h3>
          <span className="text-xs text-slate-500 font-mono">PUT /api/inventory/{'{productId}'}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading inventory data...</p>
          </div>
        ) : inventoryList.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No inventory entries</h3>
            <p className="text-xs text-slate-500 mt-1">Add an inventory entry for your products.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
                  <th className="py-3 px-6">Entry ID</th>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Quantity</th>
                  <th className="py-3 px-6">Stock Status</th>
                  <th className="py-3 px-6">Quick Adjust</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryList.map((item) => {
                  const prodName = getProductName(item.productId);
                  const isStock = item.quantity > 0;

                  return (
                    <tr key={item.id || item.productId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-700">#{item.id || item.productId}</td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{prodName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">Product ID: {item.productId}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-slate-900 text-sm">{item.quantity}</span> units
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isStock ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {isStock ? 'IN STOCK' : 'OUT OF STOCK'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickAdjust(item, -5)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-bold text-[11px]"
                            title="Subtract 5 units"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(item, -1)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-bold text-[11px]"
                            title="Subtract 1 unit"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(item, 1)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-mono font-bold text-[11px]"
                            title="Add 1 unit"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(item, 10)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-mono font-bold text-[11px]"
                            title="Add 10 units"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                          title="Edit Quantity"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.productId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form for Add/Edit Inventory */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingItem ? `Update Stock for Product #${editingItem.productId}` : 'Add Inventory Entry'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Product *</label>
                {editingItem ? (
                  <input
                    type="text"
                    disabled
                    value={getProductName(editingItem.productId)}
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-bold"
                  />
                ) : (
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    {productList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (ID: #{p.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="50"
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
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs"
                >
                  {editingItem ? 'Update Stock' : 'Create Inventory Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
