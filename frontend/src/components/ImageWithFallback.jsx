import { useState, useEffect } from 'react'

/**
 * Component hiển thị ảnh với khả năng fallback
 * Khi ảnh chính không load được (Cloudinary down/logout), sẽ hiển thị ảnh placeholder
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
    setImgSrc(src)
    setIsError(false)
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
      {...props}
    />
  )
}

export default ImageWithFallback
