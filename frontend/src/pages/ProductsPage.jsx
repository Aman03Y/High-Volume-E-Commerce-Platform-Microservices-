import React, { useState, useEffect, useMemo } from 'react';
import { Package, Plus, Search, Filter, Edit2, Trash2, ShoppingCart, Check, RefreshCw, AlertCircle, Image as ImageIcon, Star, Zap, ArrowUpDown, Tag, Sparkles, Eye, ShieldCheck } from 'lucide-react';
import { handleApiCall } from '../api/client';
import { useLog } from '../context/LogContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

export const ProductsPage = ({ onOrderCreated, onProductClick, onRequireAuth }) => {
  const { addLog } = useLog();
  const { isAdmin, isAuthenticated } = useAuth();
  const { addToCart, setIsCartOpen, setCheckoutStep, clearCart } = useCart();
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Form State for Admin Product creation
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Electronics',
    imageUrl: [''],
  });

  const fetchProducts = async () => {
    setLoading(true);
    const res = await handleApiCall('product-service', 'get', '/api/products', null, addLog);
    if (res.success && Array.isArray(res.data)) {
      setProducts(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreateModal = () => {
    if (!isAdmin) return;
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '50',
      category: 'Electronics',
      imageUrl: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    if (!isAdmin) return;
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price || '',
      stock: prod.stock || '',
      category: prod.category || 'Electronics',
      imageUrl: prod.imageUrl ? prod.imageUrl.split(',') : [''],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      imageUrl: formData.imageUrl.filter((url) => url.trim() !== '').join(','),
    };

    if (editingProduct) {
      const res = await handleApiCall('product-service', 'put', `/api/products/${editingProduct.id}`, payload, addLog);
      if (res.success) {
        addToast(`Product #${editingProduct.id} updated successfully`, 'success');
        setIsModalOpen(false);
        fetchProducts();
      }
    } else {
      const res = await handleApiCall('product-service', 'post', '/api/products', payload, addLog);
      if (res.success) {
        addToast(`Product "${formData.name}" added to store catalog`, 'success');
        setIsModalOpen(false);
        fetchProducts();
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (!isAdmin) return;
    if (!window.confirm(`Are you sure you want to delete "${name || id}"?`)) return;
    const res = await handleApiCall('product-service', 'delete', `/api/products/${id}`, null, addLog);
    if (res.success) {
      addToast(`Product deleted successfully`, 'info');
      fetchProducts();
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      addToast('Please login or signup to continue', 'info');
      return;
    }
    addToCart(product, 1);
    addToast(`Added "${product.name}" to cart`, 'success', 2500);
  };

  const handleInstantBuy = (product) => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      addToast('Please login or signup to continue', 'info');
      return;
    }
    clearCart();
    addToCart(product, 1);
    setCheckoutStep('address');
    setIsCartOpen(true);
  };

  // Filtered and Sorted products
  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'stock') {
      result.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    }

    return result;
  }, [products, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Catalog Section Header & Filters */}
      <div id="catalog-section" className="space-y-4 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <h2 className="text-4xl font-black text-black tracking-tighter uppercase">New Arrivals</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">{filteredProducts.length} Items</p>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={handleOpenCreateModal}
                className="p-2 text-white bg-black hover:bg-gray-800 rounded-none text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Add Product"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            )}
            <button
              onClick={fetchProducts}
              className="p-2 text-black bg-gray-100 hover:bg-gray-200 rounded-none text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Refresh Products"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Search, Filter Pills & Sort Bar */}
        <div className="py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-black text-black font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-transparent text-gray-500 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-transparent border-none text-xs font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Items</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">In Stock First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Loading Store Catalog</h3>
          <p className="text-xs text-slate-500 mt-1">Retrieving latest stock and pricing...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 mt-1">Try refining your search keyword or selected category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {filteredProducts.map((product) => {
            const stockCount = product.stock || 0;
            const isOutOfStock = stockCount <= 0;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col cursor-pointer"
                onClick={() => onProductClick && onProductClick(product)}
              >
                {/* Product Image */}
                <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden mb-4">
                  <img
                    src={(product.imageUrl && product.imageUrl.split(',')[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
                    }}
                  />
                </div>

                {/* Card Body */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-black text-sm tracking-tight leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-xs mt-1 capitalize">
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-black text-sm">
                        ₹{parseFloat(product.price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Admin Edit/Delete Actions (Only visible to Admin) */}
                  {isAdmin && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(product);
                        }}
                        className="p-1.5 text-gray-500 hover:text-black transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id, product.name);
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 bg-slate-100 h-64 md:h-auto relative">
              <img
                src={(quickViewProduct.imageUrl && quickViewProduct.imageUrl.split(',')[0]) || ''}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:w-1/2 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {quickViewProduct.category}
                  </span>
                  <button onClick={() => setQuickViewProduct(null)} className="text-slate-400 hover:text-slate-700 font-bold p-1">
                    ✕
                  </button>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{quickViewProduct.name}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{quickViewProduct.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    ₹{parseFloat(quickViewProduct.price || 0).toFixed(2)}
                  </div>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {quickViewProduct.stock} in stock
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    handleAddToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Create / Edit Modal */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingProduct ? `Edit Product #${editingProduct.id}` : 'Create New Product Record'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Noise-Canceling Headphones"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="199.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Peripherals">Peripherals</option>
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Computers">Computers</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Image URLs (Max 6)</label>
                    {formData.imageUrl.length < 6 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: [...formData.imageUrl, ''] })}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Image
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {formData.imageUrl.map((url, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`Image URL ${idx + 1}`}
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...formData.imageUrl];
                            newUrls[idx] = e.target.value;
                            setFormData({ ...formData, imageUrl: newUrls });
                          }}
                          className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        {formData.imageUrl.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newUrls = formData.imageUrl.filter((_, i) => i !== idx);
                              setFormData({ ...formData, imageUrl: newUrls });
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed features, specifications, and warranty details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md shadow-slate-900/10"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
