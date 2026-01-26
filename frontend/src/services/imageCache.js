/**
 * Image Cache Service - Cache ảnh URLs và base64 để hiển thị khi offline
 * Giúp ảnh vẫn hiển thị khi backend sleep hoặc network offline
 */

const IMAGE_CACHE_PREFIX = 'goimay_image_'
const IMAGE_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 ngày

/**
 * Tạo cache key từ image URL
 */
const getImageCacheKey = (imageUrl) => {
  if (!imageUrl) return null
  // Tạo hash đơn giản từ URL
  let hash = 0
  for (let i = 0; i < imageUrl.length; i++) {
    const char = imageUrl.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `${IMAGE_CACHE_PREFIX}${Math.abs(hash)}`
}

/**
 * Convert image URL thành base64 (nếu cần)
 * Lưu ý: Chỉ cache ảnh nhỏ để tránh làm đầy localStorage
 */
const imageToBase64 = (imageUrl, maxSize = 500) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Resize nếu quá lớn
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width
            width = maxSize
          } else {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8)
        resolve(base64)
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageUrl
  })
}

/**
 * Lưu image URL vào cache
 * @param {string} imageUrl - URL của ảnh
 * @param {string} base64Data - Base64 data (optional, sẽ tự convert nếu không có)
 */
export const cacheImage = async (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return
  
  try {
    const key = getImageCacheKey(imageUrl)
    if (!key) return
    
    // Kiểm tra xem đã cache chưa
    const existing = localStorage.getItem(key)
    if (existing) {
      const cached = JSON.parse(existing)
      const age = Date.now() - cached.timestamp
      if (age < IMAGE_CACHE_TTL) {
        return // Đã cache rồi và còn hạn
      }
    }
    
    // Chỉ cache ảnh từ Cloudinary hoặc external URLs
    if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary') || imageUrl.startsWith('http')) {
      // Lưu URL vào cache (không cần convert base64 vì Cloudinary vẫn accessible)
      const cacheData = {
        url: imageUrl,
        timestamp: Date.now(),
        ttl: IMAGE_CACHE_TTL
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    }
  } catch (error) {
    console.warn('Image cache error:', error)
  }
}

/**
 * Lấy image URL từ cache
 * @param {string} imageUrl - URL gốc của ảnh
 * @returns {string|null} - Cached URL hoặc null
 */
export const getCachedImage = (imageUrl) => {
  if (!imageUrl) return null
  
  try {
    const key = getImageCacheKey(imageUrl)
    if (!key) return null
    
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const cacheData = JSON.parse(cached)
    const age = Date.now() - cacheData.timestamp
    
    // Kiểm tra TTL
    if (age > cacheData.ttl) {
      localStorage.removeItem(key)
      return null
    }
    
    return cacheData.url || imageUrl
  } catch (error) {
    console.warn('Get cached image error:', error)
    return null
  }
}

/**
 * Cache nhiều images cùng lúc
 * @param {string[]} imageUrls - Mảng các image URLs
 */
export const cacheImages = async (imageUrls) => {
  if (!Array.isArray(imageUrls)) return
  
  const promises = imageUrls
    .filter(url => url && typeof url === 'string')
    .map(url => cacheImage(url))
  
  await Promise.allSettled(promises)
}

/**
 * Xóa image cache cụ thể
 * @param {string} imageUrl - URL của ảnh cần xóa cache
 */
export const removeImageCache = (imageUrl) => {
  try {
    const key = getImageCacheKey(imageUrl)
    if (key) {
      localStorage.removeItem(key)
    }
  } catch (error) {
    console.warn('Remove image cache error:', error)
  }
}

/**
 * Xóa tất cả image cache
 */
export const clearAllImageCache = () => {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(IMAGE_CACHE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Clear image cache error:', error)
  }
}

/**
 * Dọn dẹp image cache cũ
 */
export const clearOldImageCache = () => {
  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()
    
    keys.forEach(key => {
      if (key.startsWith(IMAGE_CACHE_PREFIX)) {
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
          localStorage.removeItem(key)
        }
      }
    })
  } catch (error) {
    console.warn('Clear old image cache error:', error)
  }
}

// Tự động dọn dẹp khi import
if (typeof window !== 'undefined') {
  clearOldImageCache()
  setInterval(clearOldImageCache, 24 * 60 * 60 * 1000) // Mỗi ngày
}
