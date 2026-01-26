import { useState, useEffect } from 'react'
import { cacheImage, getCachedImage } from '../services/imageCache'

/**
 * Component hiển thị ảnh với khả năng fallback
 * Khi ảnh chính không load được (Cloudinary down/logout), sẽ hiển thị ảnh placeholder
 * Tự động cache ảnh đã load thành công để hiển thị khi offline
 */
function ImageWithFallback({ 
  src, 
  alt, 
  fallbackSrc = '/Logo-Gói-Mây.png',
  className = '',
  style = {},
  onLoad,
  onError: customOnError,
  ...props 
}) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isError, setIsError] = useState(false)

  // Cập nhật imgSrc khi src prop thay đổi
  useEffect(() => {
    if (src) {
      // Kiểm tra cache trước
      const cachedUrl = getCachedImage(src)
      if (cachedUrl) {
        setImgSrc(cachedUrl)
      } else {
        setImgSrc(src)
      }
      setIsError(false)
    }
  }, [src])

  const handleError = (e) => {
    if (!isError && imgSrc !== fallbackSrc) {
      setIsError(true)
      setImgSrc(fallbackSrc)
      console.warn(`Failed to load image: ${src}, using fallback: ${fallbackSrc}`)
    }
    
    if (customOnError) {
      customOnError(e)
    }
  }

  const handleLoad = (e) => {
    // Cache ảnh đã load thành công
    if (src && src !== fallbackSrc) {
      cacheImage(src).catch(() => {
        // Ignore cache errors
      })
    }
    
    if (onLoad) {
      onLoad(e)
    }
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}

export default ImageWithFallback
