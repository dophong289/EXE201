import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Article API
export const articleApi = {
  getAll: (page = 0, size = 10) => 
    api.get(`/articles?page=${page}&size=${size}`),
  
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
}

// Category API
export const categoryApi = {
  getAll: () => 
    api.get('/categories'),
  
  getBySlug: (slug) => 
    api.get(`/categories/slug/${slug}`),
}

// Product API
export const productApi = {
  getAll: (page = 0, size = 12) => 
    api.get(`/products?page=${page}&size=${size}`),
  
  getByCategory: (category, page = 0, size = 12) => 
    api.get(`/products/category/${category}?page=${page}&size=${size}`),
  
  getBySlug: (slug) => 
    api.get(`/products/slug/${slug}`),
  
  getSale: () => 
    api.get('/products/sale'),
  
  search: (keyword, page = 0, size = 12) => 
    api.get(`/products/search?keyword=${keyword}&page=${page}&size=${size}`),
}

export default api

