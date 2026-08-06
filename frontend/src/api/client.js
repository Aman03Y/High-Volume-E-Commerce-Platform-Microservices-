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
  return config;
});

// Mock Storage Helper to keep demonstration interactive when backend is offline
const getMockData = (key, defaultData) => {
  const stored = localStorage.getItem(`mock_${key}`);
  if (!stored) {
    localStorage.setItem(`mock_${key}`, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(stored);
};

const setMockData = (key, data) => {
  localStorage.setItem(`mock_${key}`, JSON.stringify(data));
};

// Initial Mock Seed Data matching Spring Boot backend DTOs
const initialProducts = [
  {
    id: 1,
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: 199.99,
    stock: 45,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    createAt: new Date().toISOString(),
    updateAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Ergonomic Mechanical Keyboard',
    description: 'Tactile RGB mechanical keyboard with hot-swappable switches and wrist support.',
    price: 129.50,
    stock: 20,
    category: 'Peripherals',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
    createAt: new Date().toISOString(),
    updateAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Ultra-Wide 4K Gaming Monitor',
    description: '34-inch curved OLED display with 144Hz refresh rate and HDR10 support.',
    price: 649.00,
    stock: 12,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
    createAt: new Date().toISOString(),
    updateAt: new Date().toISOString()
  }
];

const initialInventory = [
  { id: 101, productId: 1, quantity: 45, inStock: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 102, productId: 2, quantity: 20, inStock: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 103, productId: 3, quantity: 12, inStock: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const initialOrders = [
  {
    id: 5001,
    customerId: 1,
    productId: 1,
    quantity: 2,
    totalPrice: 399.98,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const handleApiCall = async (serviceName, method, url, data = null, logCallback = null) => {
  const reqData = data;
  try {
    const response = await apiClient({
      method,
      url,
      data,
    });
    if (logCallback) {
      logCallback({
        service: serviceName,
        method: method.toUpperCase(),
        url,
        status: response.status,
        reqData,
        resData: response.data,
        isMock: false
      });
    }
    return { success: true, data: response.data, isMock: false };
  } catch (error) {
    console.warn(`Backend connection attempt to ${url} failed or offline. Engaging dynamic fallback.`, error);
    
    // Simulate API logic locally if backend microservices are offline
    let mockRes = null;
    let status = 200;

    if (url.includes('/api/auth/login')) {
      status = 200;
      mockRes = {
        message: 'Mock Login Successful (Offline Mode)',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenForDemo',
        user: { fullName: data?.email?.split('@')[0] || 'User', email: data?.email }
      };
    } else if (url.includes('/api/auth/register')) {
      status = 200;
      mockRes = 'User registered successfully (Mock mode)';
    } else if (url === '/api/products' && method.toLowerCase() === 'get') {
      mockRes = getMockData('products', initialProducts);
    } else if (url === '/api/products' && method.toLowerCase() === 'post') {
      const products = getMockData('products', initialProducts);
      const newProd = {
        id: Date.now(),
        ...data,
        createAt: new Date().toISOString(),
        updateAt: new Date().toISOString()
      };
      const updated = [newProd, ...products];
      setMockData('products', updated);

      // also sync inventory
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
      mockRes = 'Product Deleted Successfully (Mock)';
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
      mockRes = updated.find((i) => i.productId === productId) || { productId, quantity: data.quantity };
    } else if (url.startsWith('/api/inventory/') && method.toLowerCase() === 'delete') {
      const productId = parseInt(url.split('/')[3]);
      const inventory = getMockData('inventory', initialInventory);
      setMockData('inventory', inventory.filter((i) => i.productId !== productId));
      mockRes = 'Inventory Deleted Successfully (Mock)';
    } else if (url === '/api/orders' && method.toLowerCase() === 'get') {
      mockRes = getMockData('orders', initialOrders);
    } else if (url === '/api/orders' && method.toLowerCase() === 'post') {
      const orders = getMockData('orders', initialOrders);
      const products = getMockData('products', initialProducts);
      const targetProduct = products.find((p) => p.id === parseInt(data.productId));
      const price = targetProduct ? targetProduct.price : 100;
      
      const newOrder = {
        id: Math.floor(1000 + Math.random() * 9000),
        customerId: parseInt(data.customerId || 1),
        productId: parseInt(data.productId),
        quantity: parseInt(data.quantity),
        totalPrice: parseFloat((price * parseInt(data.quantity)).toFixed(2)),
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMockData('orders', [newOrder, ...orders]);
      
      // deduct stock in inventory mock
      const inventory = getMockData('inventory', initialInventory);
      const updatedInv = inventory.map(i => {
        if (i.productId === parseInt(data.productId)) {
          const newQty = Math.max(0, i.quantity - parseInt(data.quantity));
          return { ...i, quantity: newQty, inStock: newQty > 0 };
        }
        return i;
      });
      setMockData('inventory', updatedInv);

      mockRes = newOrder;
      status = 201;
    } else {
      mockRes = { message: 'Mock response', path: url };
    }

    if (logCallback) {
      logCallback({
        service: serviceName,
        method: method.toUpperCase(),
        url,
        status: status,
        reqData,
        resData: mockRes,
        isMock: true,
        error: 'Backend API Gateway Offline (Mock active)'
      });
    }

    return { success: true, data: mockRes, isMock: true };
  }
};
