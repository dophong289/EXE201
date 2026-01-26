/**
 * Cache Service - Lưu trữ data vào localStorage với TTL (Time To Live)
 * Giúp data và ảnh vẫn hiển thị khi component bị unmount/remount hoặc khi render sleep
 */

const CACHE_PREFIX = 'goimay_cache_'
const DEFAULT_TTL = 5 * 60 * 1000 // 5 phút mặc định
const OFFLINE_TTL = 24 * 60 * 60 * 1000 // 24 giờ cho offline support

/**
 * Lấy cache key từ URL và params
 */
const getCacheKey = (url, params = {}) => {
  const paramsStr = JSON.stringify(params)
  return `${CACHE_PREFIX}${url}_${paramsStr}`
}

/**
 * Lưu data vào cache
 * @param {string} url - API endpoint
 * @param {any} data - Data cần cache
 * @param {number} ttl - Time to live (milliseconds), mặc định 5 phút
 * @param {object} params - Query params để tạo unique key
 */
export const setCache = (url, data, ttl = DEFAULT_TTL, params = {}) => {
  try {
    const key = getCacheKey(url, params)
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    }
    localStorage.setItem(key, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('Cache set error:', error)
    // Nếu localStorage đầy, xóa cache cũ nhất
    clearOldCache()
  }
}

/**
 * Lấy data từ cache
 * @param {string} url - API endpoint
 * @param {object} params - Query params
 * @param {boolean} allowExpired - Cho phép trả về cache đã hết hạn nếu không có network (offline mode)
 * @returns {any|null} - Data hoặc null nếu không có hoặc đã hết hạn
 */
export const getCache = (url, params = {}, allowExpired = true) => {
  try {
    const key = getCacheKey(url, params)
    const cached = localStorage.getItem(key)
    
    if (!cached) return null
    
    const cacheData = JSON.parse(cached)
    const now = Date.now()
    const age = now - cacheData.timestamp
    
    // Kiểm tra xem cache còn hạn không
    if (age > cacheData.ttl) {
      // Nếu cho phép expired và đang offline, vẫn trả về cache cũ
      if (allowExpired && !navigator.onLine) {
        console.log('Offline mode: using expired cache for', url)
        return cacheData.data
      }
      localStorage.removeItem(key)
      return null
    }
    
    return cacheData.data
  } catch (error) {
    console.warn('Cache get error:', error)
    return null
  }
}

/**
 * Xóa cache cụ thể
 * @param {string} url - API endpoint
 * @param {object} params - Query params
 */
export const removeCache = (url, params = {}) => {
  try {
    const key = getCacheKey(url, params)
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Cache remove error:', error)
  }
}

/**
 * Xóa tất cả cache
 */
export const clearAllCache = () => {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Clear cache error:', error)
  }
}

/**
 * Xóa cache cũ (đã hết hạn)
 */
export const clearOldCache = () => {
  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const cacheData = JSON.parse(cached)
            const age = now - cacheData.timestamp
            if (age > cacheData.ttl) {
              localStorage.removeItem(key)
            }
          }
        } catch (e) {
          // Nếu parse lỗi, xóa luôn
          localStorage.removeItem(key)
        }
      }
    })
  } catch (error) {
    console.warn('Clear old cache error:', error)
  }
}

/**
 * Lấy tất cả cache keys (để debug)
 */
export const getAllCacheKeys = () => {
  try {
    const keys = Object.keys(localStorage)
    return keys.filter(key => key.startsWith(CACHE_PREFIX))
  } catch (error) {
    return []
  }
}

/**
 * Lưu cache với TTL dài hơn cho offline support
 * @param {string} url - API endpoint
 * @param {any} data - Data cần cache
 * @param {object} params - Query params
 */
export const setOfflineCache = (url, data, params = {}) => {
  setCache(url, data, OFFLINE_TTL, params)
}

/**
 * Kiểm tra xem có network không
 */
export const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine
}

// Tự động dọn dẹp cache cũ khi import module này
if (typeof window !== 'undefined') {
  clearOldCache()
  
  // Dọn dẹp cache cũ mỗi 10 phút
  setInterval(clearOldCache, 10 * 60 * 1000)
  
  // Lắng nghe sự kiện online/offline
  window.addEventListener('online', () => {
    console.log('Network is back online')
  })
  
  window.addEventListener('offline', () => {
    console.log('Network is offline - using cached data')
  })
}
