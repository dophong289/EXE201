# Hướng Dẫn: Giải Pháp Fallback Ảnh Khi Cloudinary Gặp Sự Cố

## 🎯 Vấn Đề
Khi Cloudinary bị tắt hoặc đăng xuất, tất cả ảnh trên website sẽ không hiển thị được, gây trải nghiệm người dùng kém.

## ✅ Giải Pháp
Đã tạo component `ImageWithFallback` để tự động hiển thị ảnh dự phòng khi ảnh chính không load được.

## 📁 Component: ImageWithFallback

### Vị trí
```
frontend/src/components/ImageWithFallback.jsx
```

### Cách hoạt động
1. Khi ảnh chính không load được (Cloudinary down/logout), component tự động chuyển sang ảnh fallback
2. Ảnh fallback mặc định là logo của website (`/Logo-Gói-Mây.png`)
3. Có thể tùy chỉnh ảnh fallback cho từng component

### Cách sử dụng

#### 1. Sử dụng cơ bản (fallback mặc định)
```jsx
import ImageWithFallback from '../components/ImageWithFallback'

<ImageWithFallback 
  src={resolveMediaUrl(product.thumbnail)} 
  alt={product.name} 
/>
```

#### 2. Tùy chỉnh ảnh fallback
```jsx
<ImageWithFallback 
  src={resolveMediaUrl(article.thumbnail)} 
  alt={article.title}
  fallbackSrc="https://images.unsplash.com/photo-xxx?w=600"
/>
```

#### 3. Với className và style
```jsx
<ImageWithFallback 
  src={imageUrl}
  alt="Product"
  className="product-image"
  style={{ width: '100%' }}
/>
```

#### 4. Với custom onError handler
```jsx
<ImageWithFallback 
  src={imageUrl}
  alt="Product"
  onError={(e) => {
    console.log('Image failed to load')
    e.target.style.display = 'none'
  }}
/>
```

## 📝 Props

| Prop | Type | Required | Mặc định | Mô tả |
|------|------|----------|----------|-------|
| `src` | string | ✅ | - | URL của ảnh chính |
| `alt` | string | ✅ | - | Text thay thế cho ảnh |
| `fallbackSrc` | string | ❌ | `/Logo-Gói-Mây.png` | URL của ảnh dự phòng |
| `className` | string | ❌ | `''` | CSS class |
| `style` | object | ❌ | `{}` | Inline styles |
| `onLoad` | function | ❌ | - | Callback khi ảnh load thành công |
| `onError` | function | ❌ | - | Callback khi ảnh load thất bại |

## 🔧 Các File Đã Được Cập Nhật

### Components
- ✅ `ArticleCard.jsx`
- ✅ `Header.jsx`

### Pages (User)
- ✅ `ProductsPage.jsx`
- ✅ `ProductDetailPage.jsx`
- ✅ `ArticleDetailPage.jsx`
- ✅ `CartPage.jsx`
- ✅ `AboutPage.jsx`
- ✅ `LoginPage.jsx`
- ✅ `RegisterPage.jsx`

### Pages (Admin)
- ✅ `AdminArticlesPage.jsx`
- ✅ `AdminProductsPage.jsx`
- ✅ `AdminSiteSettingsPage.jsx`

## 🎨 Tùy Chỉnh

### Thay đổi ảnh fallback mặc định
Mở file `ImageWithFallback.jsx` và sửa giá trị mặc định:

```jsx
function ImageWithFallback({ 
  src, 
  alt, 
  fallbackSrc = '/your-custom-placeholder.png', // Thay đổi ở đây
  // ...
}) {
  // ...
}
```

### Thêm loading spinner
Bạn có thể mở rộng component để hiển thị loading spinner:

```jsx
const [loading, setLoading] = useState(true)

const handleLoad = (e) => {
  setLoading(false)
  if (onLoad) onLoad(e)
}

return (
  <>
    {loading && <div className="spinner">Loading...</div>}
    <img
      src={imgSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      style={{ display: loading ? 'none' : 'block' }}
    />
  </>
)
```

## 🧪 Test

### Test khi Cloudinary hoạt động bình thường
1. Mở website
2. Tất cả ảnh sẽ hiển thị từ Cloudinary như bình thường

### Test khi Cloudinary gặp sự cố
1. Mở DevTools > Network tab
2. Thêm rule block domain `*.cloudinary.com`
3. Reload trang
4. Tất cả ảnh sẽ tự động chuyển sang hiển thị ảnh fallback (logo)

## 💡 Lưu Ý

1. **Hiệu năng**: Component sử dụng state để quản lý việc chuyển đổi ảnh, không ảnh hưởng đến performance
2. **SEO**: Alt text vẫn được giữ nguyên cho SEO
3. **Accessibility**: Tất cả props accessibility của `<img>` đều được hỗ trợ
4. **Console Warning**: Khi ảnh lỗi, sẽ có warning trong console để dễ debug

## 🚀 Tương Lai

### Có thể mở rộng thêm:
- Lazy loading ảnh
- Progressive image loading (blur-up)
- Retry mechanism (thử load lại ảnh nếu lỗi)
- Cache ảnh với Service Worker
- Multiple fallback images (fallback chain)

## 📚 Tài Liệu Tham Khảo
- [React Image Loading Best Practices](https://web.dev/articles/optimize-cls#images-without-dimensions)
- [Handling Image Load Errors](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/error_event)
