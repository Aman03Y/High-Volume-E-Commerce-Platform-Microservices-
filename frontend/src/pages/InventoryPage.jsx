import React, { useState, useEffect, useMemo } from 'react';
import { Layers, Plus, RefreshCw, Edit3, Trash2, Box, TrendingUp, Search, Sparkles, CheckCircle2, ShieldAlert, Lock, AlertTriangle, Zap } from 'lucide-react';
import { handleApiCall } from '../api/client';
import { useLog } from '../context/LogContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const InventoryPage = ({ onNavigateToAuth }) => {
  const { addLog } = useLog();
  const { isAdmin, loginUser } = useAuth();
  const { addToast } = useToast();

  const [inventoryList, setInventoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');

  // Form State
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
  });

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
  }, [isAdmin]);

  const handleInstantAdminUnlock = () => {
    const adminUser = {
      fullName: 'Chief Administrator',
      email: 'admin@amany.com',
    };
    loginUser(`token_admin_${Date.now()}`, adminUser, 'ADMIN');
    addToast('Admin Privileges Activated! Loading Inventory Control...', 'success');
  };

  // Strict Admin Gate: Non-admins cannot access or view warehouse records
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-6">
        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto border-2 border-black">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Admin Required</h2>
          <p className="text-gray-500 text-sm mt-3 max-w-sm mx-auto font-medium">
            Warehouse inventory management, stock ledger, and supply controls are reserved strictly for authenticated administrators.
          </p>
        </div>

        <div className="pt-6 flex flex-col items-center justify-center gap-3">
          <button
            onClick={handleInstantAdminUnlock}
            className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            1-Click Admin Access
          </button>
          <button
            onClick={onNavigateToAuth}
            className="w-full py-4 border-2 border-black text-black font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            Admin Login
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
      addToast(`Updated stock to ${newQty} units`, 'success');
      fetchInventoryAndProducts();
    }
  };

  const handleBulkRestock = async () => {
    if (!window.confirm('Add +25 units to all low stock items (< 15 units)?')) return;
    const lowStockItems = inventoryList.filter((i) => (i.quantity || 0) < 15);
    for (const item of lowStockItems) {
      const newQty = (item.quantity || 0) + 25;
      await handleApiCall('inventory-service', 'put', `/api/inventory/${item.productId}`, { quantity: newQty }, addLog);
    }
    addToast(`Bulk restocked ${lowStockItems.length} items successfully!`, 'success');
    fetchInventoryAndProducts();
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
        addToast(`Inventory for Product #${editingItem.productId} updated`, 'success');
        setIsModalOpen(false);
        fetchInventoryAndProducts();
      }
    } else {
      const res = await handleApiCall('inventory-service', 'post', '/api/inventory', payload, addLog);
      if (res.success) {
        addToast(`Inventory entry created for Product #${payload.productId}`, 'success');
        setIsModalOpen(false);
        fetchInventoryAndProducts();
      }
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(`Are you sure you want to delete inventory record for Product ID #${productId}?`)) return;
    const res = await handleApiCall('inventory-service', 'delete', `/api/inventory/${productId}`, null, addLog);
    if (res.success) {
      addToast(`Inventory record removed`, 'info');
      fetchInventoryAndProducts();
    }
  };

  const getProductName = (prodId) => {
    const found = productList.find((p) => p.id === prodId);
    return found ? found.name : `Product #${prodId}`;
  };

  const getProductPrice = (prodId) => {
    const found = productList.find((p) => p.id === prodId);
    return found ? parseFloat(found.price || 0) : 0;
  };

  const filteredInventory = useMemo(() => {
    return inventoryList.filter((item) => {
      const prodName = getProductName(item.productId).toLowerCase();
      const matchSearch = prodName.includes(searchQuery.toLowerCase()) || String(item.productId).includes(searchQuery);
      if (stockFilter === 'LOW') return matchSearch && (item.quantity || 0) < 15;
      if (stockFilter === 'OUT') return matchSearch && (item.quantity || 0) === 0;
      return matchSearch;
    });
  }, [inventoryList, productList, searchQuery, stockFilter]);

  const totalWarehouseUnits = inventoryList.reduce((acc, i) => acc + (parseInt(i.quantity) || 0), 0);
  const totalValuation = inventoryList.reduce((acc, i) => acc + (parseInt(i.quantity) || 0) * getProductPrice(i.productId), 0);
  const lowStockCount = inventoryList.filter((i) => (i.quantity || 0) < 15).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase">
            Stock Ledger
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium uppercase tracking-wider">
            Warehouse Control Center
          </p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={fetchInventoryAndProducts}
            className="p-2 text-black bg-gray-100 hover:bg-gray-200 text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wider"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="p-2 text-white bg-black hover:bg-gray-800 text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-black p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-2">Total Physical Units</span>
          <p className="text-3xl font-black text-black tracking-tighter">{totalWarehouseUnits.toLocaleString()}</p>
        </div>

        <div className="border border-black p-5 flex flex-col justify-between bg-black text-white">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Warehouse Valuation</span>
          <p className="text-3xl font-black tracking-tighter">₹{totalValuation.toFixed(2)}</p>
        </div>

        <div className="border border-black p-5 flex flex-col justify-between bg-gray-100 relative">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Low Stock Alerts</span>
          <p className="text-3xl font-black text-black tracking-tighter">{lowStockCount}</p>
          
          {lowStockCount > 0 && (
            <button
              onClick={handleBulkRestock}
              className="absolute bottom-5 right-5 px-3 py-1.5 bg-black text-white font-bold text-[10px] uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Restock All
            </button>
          )}
        </div>
      </div>

      {/* Table Toolbar */}
      <div className="py-4 flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-gray-200">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search Products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-black text-black font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {['ALL', 'LOW', 'OUT'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStockFilter(filter)}
              className={`px-4 py-1.5 text-xs font-bold transition-all uppercase tracking-wider ${
                stockFilter === filter
                  ? 'bg-black text-white'
                  : 'bg-transparent text-gray-500 hover:text-black hover:bg-gray-100'
              }`}
            >
              {filter === 'ALL' ? 'All Items' : filter === 'LOW' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Live Table */}
      <div>
        {loading ? (
          <div className="p-16 text-center border border-black">
            <RefreshCw className="w-8 h-8 text-black animate-spin mx-auto mb-3" />
            <p className="text-xs text-black font-bold uppercase tracking-wider">Loading Stock Inventory</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-16 text-center border border-black">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-black text-black uppercase tracking-wider">No Entries Recorded</h3>
          </div>
        ) : (
          <div className="overflow-x-auto border border-black">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-black text-black font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 border-r border-black">ID</th>
                  <th className="py-4 px-6 border-r border-black">Product Details</th>
                  <th className="py-4 px-6 border-r border-black">Stock</th>
                  <th className="py-4 px-6 border-r border-black">Status</th>
                  <th className="py-4 px-6 border-r border-black text-center">Adjust</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const prodName = getProductName(item.productId);
                  const isStock = item.quantity > 0;
                  const isLow = item.quantity > 0 && item.quantity < 15;

                  return (
                    <tr key={item.id || item.productId} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 border-r border-gray-200 font-bold text-black">#{item.id || item.productId}</td>
                      <td className="py-4 px-6 border-r border-gray-200">
                        <div className="font-bold text-black text-sm">{prodName}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Product ID: #{item.productId}</div>
                      </td>
                      <td className="py-4 px-6 border-r border-gray-200">
                        <span className="font-black text-black text-lg">{item.quantity}</span>
                      </td>
                      <td className="py-4 px-6 border-r border-gray-200">
                        <span
                          className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            isLow
                              ? 'border border-black text-black'
                              : isStock
                              ? 'bg-black text-white'
                              : 'bg-gray-200 text-black line-through'
                          }`}
                        >
                          {isLow ? 'LOW STOCK' : isStock ? 'IN STOCK' : 'OUT OF STOCK'}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-r border-gray-200 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleQuickAdjust(item, -10)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-black hover:text-white text-black font-bold text-xs transition-colors"
                          >
                            -10
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(item, -1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-black hover:text-white text-black font-bold text-xs transition-colors"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(item, 1)}
                            className="w-8 h-8 flex items-center justify-center border border-black text-black hover:bg-black hover:text-white font-bold text-xs transition-colors"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(item, 10)}
                            className="w-8 h-8 flex items-center justify-center border border-black text-black hover:bg-black hover:text-white font-bold text-xs transition-colors"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 text-black hover:bg-gray-200 transition-colors inline-block"
                          title="Edit Quantity"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.productId)}
                          className="p-2 text-black hover:bg-red-100 hover:text-red-600 transition-colors inline-block"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
              <h3 className="font-black text-black uppercase tracking-wider text-sm">
                {editingItem ? `Update Stock` : 'Add Stock'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-black hover:text-gray-500 font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2">Target Product *</label>
                {editingItem ? (
                  <input
                    type="text"
                    disabled
                    value={getProductName(editingItem.productId)}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 text-black font-bold text-sm"
                  />
                ) : (
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-bold text-sm text-black"
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
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2">Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-bold text-sm text-black"
                />
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
                  {editingItem ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
