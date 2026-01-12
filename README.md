# Gói Mây - Quà tặng văn hóa Việt Nam

**Gói Mây** là dự án thương mại điện tử về quà tặng văn hóa Việt Nam, kết hợp đặc sản địa phương và bao bì thủ công truyền thống, hướng đến trải nghiệm ý nghĩa – bền vững – mang bản sắc Việt.

## 🎋 Về dự án

Gói Mây ra đời từ tình yêu với những làng nghề truyền thống Việt Nam - nơi đôi bàn tay khéo léo của các nghệ nhân đã tạo nên những tác phẩm từ tre, mây, nan qua hàng trăm năm lịch sử.

Chúng tôi kết nối tinh hoa thủ công truyền thống với đặc sản vùng miền, tạo nên những set quà tặng độc đáo - nơi mỗi chiếc giỏ mây, hộp tre, túi cói đều mang trong mình câu chuyện của người thợ làng nghề.

## 🌟 Giá trị cốt lõi

- **Thủ công truyền thống**: Mỗi sản phẩm được làm thủ công bởi các nghệ nhân làng nghề
- **Bản sắc Việt Nam**: Kết hợp đặc sản địa phương với bao bì từ tre, mây, nan
- **Bền vững với môi trường**: Sử dụng 100% nguyên liệu tự nhiên, có thể tái chế
- **Trải nghiệm ý nghĩa**: Mỗi set quà là câu chuyện văn hóa, là tình cảm được gửi gắm

## 🛠️ Công nghệ

### Backend
- **Spring Boot 3.x**
- **Java 17**
- **H2 Database** (Development)
- **JPA/Hibernate**
- **RESTful API**

### Frontend
- **React 18**
- **Vite**
- **React Router DOM**
- **Framer Motion** (Animations)
- **CSS Modules**

## 📁 Cấu trúc dự án

```
EXE201/
├── backend/
│   ├── src/main/java/com/goimay/
│   │   ├── config/         # Cấu hình (CORS, DataInitializer)
│   │   ├── controller/     # REST Controllers
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── exception/      # Exception Handlers
│   │   ├── model/          # Entity classes
│   │   ├── repository/     # JPA Repositories
│   │   └── service/        # Business Logic
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── pages/          # Page Components
│   │   ├── services/       # API Services
│   │   └── styles/         # CSS Files
│   │       ├── components/
│   │       └── pages/
│   └── package.json
│
└── README.md
```

## 🚀 Hướng dẫn chạy

### Backend

```bash
cd backend
./mvnw clean compile spring-boot:run
```

Backend sẽ chạy tại: **http://localhost:8080**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

## 📡 API Endpoints

### Categories
- `GET /api/categories` - Lấy tất cả danh mục
- `GET /api/categories/{slug}` - Lấy danh mục theo slug

### Articles
- `GET /api/articles` - Lấy tất cả bài viết
- `GET /api/articles/{slug}` - Lấy bài viết theo slug
- `GET /api/articles/featured` - Lấy bài viết nổi bật
- `GET /api/articles/latest` - Lấy bài viết mới nhất
- `GET /api/articles/category/{categorySlug}` - Lấy bài viết theo danh mục

### Products
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/{slug}` - Lấy sản phẩm theo slug
- `GET /api/products/category/{category}` - Lấy sản phẩm theo danh mục

## 🏷️ Danh mục sản phẩm

- **Set quà Tết**: Bộ sưu tập quà Tết với giỏ mây thủ công
- **Đặc sản vùng miền**: Đặc sản các tỉnh thành kết hợp bao bì truyền thống
- **Thủ công mỹ nghệ**: Sản phẩm từ tre, mây, cói làm thủ công
- **Quà doanh nghiệp**: Set quà cao cấp cho doanh nghiệp

## 🏘️ Làng nghề hợp tác

- **Phú Vinh** (Chương Mỹ, Hà Nội) - Mây tre đan 400 năm
- **Kim Sơn** (Ninh Bình) - Nghề dệt cói truyền thống
- **Chương Mỹ** (Hà Nội) - Đồ gỗ mỹ nghệ
- Và nhiều làng nghề khác trên khắp Việt Nam

## 📞 Liên hệ

- **Email**: contact@goimay.vn
- **Hotline**: 1900 9300
- **Website**: [goimay.vn](https://goimay.vn)

---

© 2026 Gói Mây Vietnam. All rights reserved.
