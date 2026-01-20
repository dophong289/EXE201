import axios from 'axios'

// Production: set Vercel env var VITE_API_URL = https://<your-backend-domain>
// Dev: if VITE_API_URL is not set, we fall back to relative "/api" (Vite proxy handles it)
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const API_BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api` : '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  checkAuth: () => api.get('/auth/check'),
}

// User API
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.post('/user/change-password', data),
}

// Favorite API
export const favoriteApi = {
  getAll: () => api.get('/favorites'),
  getIds: () => api.get('/favorites/ids'),
  toggle: (productId) => api.post(`/favorites/toggle/${productId}`),
  check: (productId) => api.get(`/favorites/check/${productId}`),
  count: () => api.get('/favorites/count'),
}

// Order API (User)
export const orderApi = {
  create: (data) => api.post('/orders', data),
  myOrders: () => api.get('/orders/my'),
  myOrderById: (orderId) => api.get(`/orders/my/${orderId}`),
  markReceived: (orderId) => api.put(`/orders/my/${orderId}/received`),
}

// Order API (Admin)
export const adminOrderApi = {
  getAll: () => api.get('/admin/orders'),
  confirm: (orderId) => api.put(`/admin/orders/${orderId}/confirm`),
  cancel: (orderId) => api.put(`/admin/orders/${orderId}/cancel`),
}

// Upload API
export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  getImageUrl: (filename) => `${API_BASE_URL}/upload/images/${filename}`,
}

// Article API
export const articleApi = {
  getAll: (page = 0, size = 10) => 
    api.get(`/articles?page=${page}&size=${size}`),
  
  getById: (id) =>
    api.get(`/articles/${id}`),
  
  getByCategory: (categorySlug, page = 0, size = 10) => 
    api.get(`/articles/category/${categorySlug}?page=${page}&size=${size}`),
  
  getBySlug: (slug) => 
    api.get(`/articles/slug/${slug}`),
  
  getFeatured: () => 
    api.get('/articles/featured'),
  
  getLatest: (limit = 5) => 
    api.get(`/articles/latest?limit=${limit}`),
  
  search: (keyword, page = 0, size = 10) => 
    api.get(`/articles/search?keyword=${keyword}&page=${page}&size=${size}`),
  
  // Admin APIs
  create: (data) =>
    api.post('/articles', data),
  
  update: (id, data) =>
    api.put(`/articles/${id}`, data),
  
  delete: (id) =>
    api.delete(`/articles/${id}`),
}

// Category API (Article categories)
export const categoryApi = {
  getAll: () => 
    api.get('/categories'),
  
  getById: (id) =>
    api.get(`/categories/${id}`),
  
  getBySlug: (slug) => 
    api.get(`/categories/slug/${slug}`),
  
  // Admin APIs
  create: (data) =>
    api.post('/categories', data),
  
  update: (id, data) =>
    api.put(`/categories/${id}`, data),
  
  delete: (id) =>
    api.delete(`/categories/${id}`),
}

// Product Category API
export const productCategoryApi = {
  getAll: () => 
    api.get('/product-categories'),
  
  getActive: () =>
    api.get('/product-categories/active'),
  
  getById: (id) =>
    api.get(`/product-categories/${id}`),
  
  getBySlug: (slug) => 
    api.get(`/product-categories/slug/${slug}`),
  
  // Admin APIs
  create: (data) =>
    api.post('/product-categories', data),
  
  update: (id, data) =>
    api.put(`/product-categories/${id}`, data),
  
  delete: (id) =>
    api.delete(`/product-categories/${id}`),
}

// Site Settings API
export const siteSettingApi = {
  getAll: () => 
    api.get('/site-settings'),
  
  getMap: () =>
    api.get('/site-settings/map'),
  
  getByCategory: (category) =>
    api.get(`/site-settings/category/${category}`),
  
  getMapByCategory: (category) =>
    api.get(`/site-settings/category/${category}/map`),
  
  getByKey: (key) =>
    api.get(`/site-settings/key/${key}`),
  
  save: (data) =>
    api.post('/site-settings', data),
  
  saveAll: (settings) =>
    api.post('/site-settings/bulk', settings),
  
  saveBulk: (category, settings) =>
    api.post(`/site-settings/bulk/${category}`, settings),
  
  initDefaults: () =>
    api.post('/site-settings/init'),
  
  syncToCode: () =>
    api.post('/site-settings/admin/sync'),
  
  syncAllToCode: () =>
    api.post('/site-settings/admin/sync-all'),
  
  delete: (id) =>
    api.delete(`/site-settings/${id}`),
}

// Product API
export const productApi = {
  getAll: (page = 0, size = 12) => 
    api.get(`/products?page=${page}&size=${size}`),
  
  getById: (id) =>
    api.get(`/products/${id}`),
  
  getByCategory: (category, page = 0, size = 12) => 
    api.get(`/products/category/${category}?page=${page}&size=${size}`),
  
  getBySlug: (slug) => 
    api.get(`/products/slug/${slug}`),
  
  getSale: () => 
    api.get('/products/sale'),
  
  search: (keyword, category = null, page = 0, size = 12) => {
    const params = new URLSearchParams({
      keyword: keyword ?? '',
      page: String(page),
      size: String(size),
    })
    if (category) params.set('category', category)
    return api.get(`/products/search?${params.toString()}`)
  },
  
  // Admin APIs
  create: (data) =>
    api.post('/products', data),
  
  update: (id, data) =>
    api.put(`/products/${id}`, data),
  
  delete: (id) =>
    api.delete(`/products/${id}`),
}

export default api

