import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.metadata = { startTime: performance.now() };
  return config;
});

// Mock Storage Helper to keep demonstration interactive & fast when backend is offline
const getMockData = (key, defaultData) => {
  try {
    const stored = localStorage.getItem(`mock_${key}`);
    if (!stored) {
      localStorage.setItem(`mock_${key}`, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(stored);
  } catch {
    return defaultData;
  }
};

const setMockData = (key, data) => {
  try {
    localStorage.setItem(`mock_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to set mock data in localStorage', e);
  }
};

// Initial Mock Seed Data matching Spring Boot backend DTOs
export const initialProducts = [
  {
    id: 1,
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, high-fidelity sound, and 30-hour battery life.',
    price: 199.99,
    stock: 45,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    rating: 4.8,
    reviewsCount: 128,
    createAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updateAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Ergonomic Mechanical Keyboard',
    description: 'Tactile RGB mechanical keyboard with hot-swappable switches, PBT keycaps, and magnetic wrist support.',
    price: 129.50,
    stock: 24,
    category: 'Peripherals',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
    rating: 4.9,
    reviewsCount: 94,
    createAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updateAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Ultra-Wide 4K Gaming Monitor',
    description: '34-inch curved OLED display with 144Hz refresh rate, 1ms latency, and HDR10 true-black color spectrum.',
    price: 649.00,
    stock: 12,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
    rating: 4.7,
    reviewsCount: 56,
    createAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updateAt: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Wireless Ergonomic Vertical Mouse',
    description: 'Dual Bluetooth & 2.4GHz wireless mouse engineered for natural wrist posture and zero repetitive strain.',
    price: 49.99,
    stock: 80,
    category: 'Peripherals',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80',
    rating: 4.6,
    reviewsCount: 88,
    createAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updateAt: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Studio Condenser USB Microphone',
    description: 'Broadcast-grade cardioid microphone with internal pop filter and zero-latency headphone monitoring.',
    price: 89.00,
    stock: 35,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
    rating: 4.9,
    reviewsCount: 210,
    createAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updateAt: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Anodized Aluminum Laptop Stand',
    description: 'Foldable ergonomic riser crafted from aerospace-grade aluminum with integrated cable management groove.',
    price: 39.99,
    stock: 60,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
    rating: 4.5,
    reviewsCount: 42,
    createAt: new Date().toISOString(),
    updateAt: new Date().toISOString()
  }
];

export const initialInventory = [
  { id: 101, productId: 1, quantity: 45, inStock: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 102, productId: 2, quantity: 24, inStock: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 103, productId: 3, quantity: 12, inStock: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 104, productId: 4, quantity: 80, inStock: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 105, productId: 5, quantity: 35, inStock: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 106, productId: 6, quantity: 60, inStock: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const initialOrders = [
  {
    id: 5001,
    customerId: 101,
    productId: 1,
    quantity: 2,
    totalPrice: 399.98,
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 5002,
    customerId: 102,
    productId: 2,
    quantity: 1,
    totalPrice: 129.50,
    status: 'PROCESSING',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 5003,
    customerId: 103,
    productId: 3,
    quantity: 1,
    totalPrice: 649.00,
    status: 'SHIPPED',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

export const handleApiCall = async (serviceName, method, url, data = null, logCallback = null) => {
  const reqData = data;
  const startTime = performance.now();

  try {
    const response = await apiClient({
      method,
      url,
      data,
    });
    const duration = Math.round(performance.now() - startTime);

    if (logCallback) {
      logCallback({
        service: serviceName,
        method: method.toUpperCase(),
        url,
        status: response.status,
        latencyMs: duration,
        reqData,
        resData: response.data,
        isMock: false
      });
    }
    return { success: true, data: response.data, isMock: false, latencyMs: duration };
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    // Dynamic ultra-fast replica fallback simulation
    let mockRes = null;
    let status = 200;

    if (url.includes('/api/auth/login')) {
      status = 200;
      mockRes = {
        message: 'Login Successful (JWT Session Initialized)',
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(data?.email || 'user')}.signatureMock`,
        user: {
          fullName: data?.email?.split('@')[0]?.toUpperCase() || 'User Account',
          email: data?.email || 'customer@amany.com'
        }
      };
    } else if (url.includes('/api/auth/register')) {
      status = 200;
      mockRes = { message: 'Customer registered successfully in auth-service database' };
    } else if (url.includes('/api/customer/profile')) {
      status = 200;
      mockRes = { role: 'CUSTOMER', status: 'ACTIVE', tier: 'Gold Tier', ordersCount: 14 };
    } else if (url.includes('/api/admin/dashboard')) {
      status = 200;
      mockRes = { role: 'ADMIN', totalServices: 5, healthStatus: 'OPTIMAL', activeClusters: 3 };
    } else if (url === '/api/products' && method.toLowerCase() === 'get') {
      mockRes = getMockData('products', initialProducts);
    } else if (url === '/api/products' && method.toLowerCase() === 'post') {
      const products = getMockData('products', initialProducts);
      const newProd = {
        id: Date.now(),
        ...data,
        rating: 5.0,
        reviewsCount: 1,
        createAt: new Date().toISOString(),
        updateAt: new Date().toISOString()
      };
      const updated = [newProd, ...products];
      setMockData('products', updated);

      // sync inventory
      const inventory = getMockData('inventory', initialInventory);
      const newInv = {
        id: Date.now() + 1,
        productId: newProd.id,
        quantity: parseInt(data.stock || 0),
        inStock: parseInt(data.stock || 0) > 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMockData('inventory', [newInv, ...inventory]);

      mockRes = newProd;
      status = 201;
    } else if (url.startsWith('/api/products/') && method.toLowerCase() === 'put') {
      const id = parseInt(url.split('/')[3]);
      const products = getMockData('products', initialProducts);
      const updated = products.map((p) => (p.id === id ? { ...p, ...data, updateAt: new Date().toISOString() } : p));
      setMockData('products', updated);
      mockRes = updated.find((p) => p.id === id) || { id, ...data };
    } else if (url.startsWith('/api/products/') && method.toLowerCase() === 'delete') {
      const id = parseInt(url.split('/')[3]);
      const products = getMockData('products', initialProducts);
      setMockData('products', products.filter((p) => p.id !== id));
      mockRes = { message: 'Product Deleted Successfully' };
    } else if (url === '/api/inventory' && method.toLowerCase() === 'get') {
      mockRes = getMockData('inventory', initialInventory);
    } else if (url === '/api/inventory' && method.toLowerCase() === 'post') {
      const inventory = getMockData('inventory', initialInventory);
      const newInv = {
        id: Date.now(),
        productId: parseInt(data.productId),
        quantity: parseInt(data.quantity),
        inStock: parseInt(data.quantity) > 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMockData('inventory', [newInv, ...inventory]);
      mockRes = newInv;
      status = 201;
    } else if (url.startsWith('/api/inventory/') && method.toLowerCase() === 'put') {
      const productId = parseInt(url.split('/')[3]);
      const inventory = getMockData('inventory', initialInventory);
      const updated = inventory.map((i) =>
        i.productId === productId
          ? { ...i, quantity: parseInt(data.quantity), inStock: parseInt(data.quantity) > 0, updatedAt: new Date().toISOString() }
          : i
      );
      setMockData('inventory', updated);

      // also sync product stock count
      const products = getMockData('products', initialProducts);
      const updatedProds = products.map((p) => (p.id === productId ? { ...p, stock: parseInt(data.quantity) } : p));
      setMockData('products', updatedProds);

      mockRes = updated.find((i) => i.productId === productId) || { productId, quantity: data.quantity };
    } else if (url.startsWith('/api/inventory/') && method.toLowerCase() === 'delete') {
      const productId = parseInt(url.split('/')[3]);
      const inventory = getMockData('inventory', initialInventory);
      setMockData('inventory', inventory.filter((i) => i.productId !== productId));
      mockRes = { message: 'Inventory Deleted Successfully' };
    } else if (url === '/api/orders' && method.toLowerCase() === 'get') {
      mockRes = getMockData('orders', initialOrders);
    } else if (url === '/api/orders' && method.toLowerCase() === 'post') {
      const orders = getMockData('orders', initialOrders);
      const products = getMockData('products', initialProducts);
      const targetProduct = products.find((p) => p.id === parseInt(data.productId));
      const price = targetProduct ? targetProduct.price : 99.99;
      
      const newOrder = {
        id: Math.floor(5000 + Math.random() * 4999),
        customerId: parseInt(data.customerId || 101),
        productId: parseInt(data.productId),
        quantity: parseInt(data.quantity || 1),
        totalPrice: parseFloat((price * parseInt(data.quantity || 1)).toFixed(2)),
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMockData('orders', [newOrder, ...orders]);
      
      // deduct stock in inventory mock
      const inventory = getMockData('inventory', initialInventory);
      const updatedInv = inventory.map(i => {
        if (i.productId === parseInt(data.productId)) {
          const newQty = Math.max(0, i.quantity - parseInt(data.quantity || 1));
          return { ...i, quantity: newQty, inStock: newQty > 0 };
        }
        return i;
      });
      setMockData('inventory', updatedInv);

      // deduct stock in products mock
      const updatedProds = products.map(p => {
        if (p.id === parseInt(data.productId)) {
          const newQty = Math.max(0, (p.stock || 0) - parseInt(data.quantity || 1));
          return { ...p, stock: newQty };
        }
        return p;
      });
      setMockData('products', updatedProds);

      mockRes = newOrder;
      status = 201;
    } else if (url.startsWith('/api/orders/') && method.toLowerCase() === 'delete') {
      const orderId = parseInt(url.split('/')[3]);
      const orders = getMockData('orders', initialOrders);
      setMockData('orders', orders.filter((o) => o.id !== orderId));
      mockRes = { message: 'Order Deleted Successfully' };
    } else {
      mockRes = { message: 'Mock response OK', path: url };
    }

    if (logCallback) {
      logCallback({
        service: serviceName,
        method: method.toUpperCase(),
        url,
        status: status,
        latencyMs: duration,
        reqData,
        resData: mockRes,
        isMock: true,
        error: 'Backend Gateway Offline (Autonomous Replica engaged)'
      });
    }

    return { success: true, data: mockRes, isMock: true, latencyMs: duration };
  }
};

// Check backend service live availability and measure ping
export const checkGatewayHealth = async () => {
  const start = performance.now();
  try {
    await apiClient.get('/api/products', { timeout: 2000 });
    return { online: true, latencyMs: Math.round(performance.now() - start) };
  } catch (err) {
    if (err.response) {
      return { online: true, latencyMs: Math.round(performance.now() - start) };
    }
    return { online: false, latencyMs: null };
  }
};
