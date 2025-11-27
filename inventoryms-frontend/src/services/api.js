import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:2025/api';
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Create axios instancess
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// User API
export const userAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  searchUsers: (search, params) => api.get('/admin/users/search', { 
    params: { search, ...params } 
  }),
};

// Category API
export const categoryAPI = {
  getAllCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  searchCategories: (search, params) => api.get('/categories/search', { 
    params: { search, ...params } 
  }),
  getRootCategories: () => api.get('/categories/root'),
  getSubCategories: (parentId) => api.get(`/categories/${parentId}/subcategories`),
};

// Product API
export const productAPI = {
  getAllProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  searchProducts: (params) => api.get('/products/search', { params }),
  getProductsByCategory: (categoryId, params) => api.get(`/products/category/${categoryId}`, { params }),
  updateStock: (id, stockData) => api.put(`/manager/products/${id}/stock`, stockData),
  getLowStockProducts: () => api.get('/manager/products/low-stock'),
  getOutOfStockProducts: () => api.get('/manager/products/out-of-stock'),
  getTopSellingProducts: () => api.get('/products/top-selling'),
  getRecentlyAddedProducts: () => api.get('/products/recent'),
};

// Order API
export const orderAPI = {
  getAllOrders: (params) => api.get('/sales/orders', { params }),
  getOrderById: (id) => api.get(`/sales/orders/${id}`),
  createOrder: (orderData) => api.post('/sales/orders', orderData),
  updateOrderStatus: (id, statusData) => api.put(`/sales/orders/${id}/status`, statusData),
  cancelOrder: (id, reason) => api.put(`/sales/orders/${id}/cancel`, { reason }),
  searchOrders: (search, params) => api.get('/sales/orders/search', { 
    params: { search, ...params } 
  }),
  getOrdersByDateRange: (startDate, endDate, params) => api.get('/sales/orders/date-range', { 
    params: { startDate, endDate, ...params } 
  }),
  getOrdersByStatus: (status, params) => api.get(`/sales/orders/status/${status}`, { params }),
  getRecentOrders: () => api.get('/sales/orders/recent'),
};

// Dashboard API
export const dashboardAPI = {
  getInventoryDashboard: () => api.get('/manager/dashboard/inventory'),
  getSalesDashboard: (period) => api.get('/sales/dashboard', { params: { period } }),
  getLowStockAlerts: () => api.get('/manager/alerts/low-stock'),
  getSalesAnalytics: (startDate, endDate) => api.get('/sales/analytics', { 
    params: { startDate, endDate } 
  }),
};

// Health API
export const healthAPI = {
  getHealth: () => api.get('/health'),
  getDatabaseHealth: () => api.get('/health/db'),
};

export default api;
