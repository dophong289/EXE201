# Gói Mây - Mỹ phẩm thuần chay Việt Nam

Đây là project website thương mại điện tử cho thương hiệu **Gói Mây** - Mỹ phẩm thuần chay Việt Nam, sử dụng **Spring Boot** (Backend) và **React** (Frontend).

## 📁 Cấu trúc Project

```
EXE201/
├── backend/                 # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/goimay/
│   │       │   ├── config/         # Configuration classes
│   │       │   ├── controller/     # REST Controllers
│   │       │   ├── dto/            # Data Transfer Objects
│   │       │   ├── exception/      # Exception handlers
│   │       │   ├── model/          # Entity models
│   │       │   ├── repository/     # JPA Repositories
│   │       │   ├── service/        # Business logic
│   │       │   └── GoimayApplication.java
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
│
├── frontend/                # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── styles/          # Global CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🛠️ Yêu cầu hệ thống

### Backend
- **Java 17** trở lên
- **Maven 3.6+**

### Frontend
- **Node.js 18+**
- **npm** hoặc **yarn**

## 🚀 Hướng dẫn cài đặt và chạy

### 1. Clone project
```bash
cd D:\EXE201
```

### 2. Chạy Backend (Spring Boot)

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies và build
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

Backend sẽ chạy tại: **http://localhost:8080**

**Hoặc** chạy bằng IDE:
- Mở project trong IntelliJ IDEA hoặc Eclipse
- Chạy file `CocoonApplication.java`

### 3. Chạy Frontend (React)

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

## 📡 API Endpoints

### Articles
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/articles` | Lấy tất cả bài viết (phân trang) |
| GET | `/api/articles/{id}` | Lấy bài viết theo ID |
| GET | `/api/articles/slug/{slug}` | Lấy bài viết theo slug |
| GET | `/api/articles/category/{categorySlug}` | Lấy bài viết theo danh mục |
| GET | `/api/articles/featured` | Lấy bài viết nổi bật |
| GET | `/api/articles/latest` | Lấy bài viết mới nhất |
| GET | `/api/articles/search?keyword=...` | Tìm kiếm bài viết |
| POST | `/api/articles` | Tạo bài viết mới |
| PUT | `/api/articles/{id}` | Cập nhật bài viết |
| DELETE | `/api/articles/{id}` | Xóa bài viết |

### Categories
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories` | Lấy tất cả danh mục |
| GET | `/api/categories/{id}` | Lấy danh mục theo ID |
| GET | `/api/categories/slug/{slug}` | Lấy danh mục theo slug |
| POST | `/api/categories` | Tạo danh mục mới |
| PUT | `/api/categories/{id}` | Cập nhật danh mục |
| DELETE | `/api/categories/{id}` | Xóa danh mục |

### Products
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Lấy tất cả sản phẩm (phân trang) |
| GET | `/api/products/{id}` | Lấy sản phẩm theo ID |
| GET | `/api/products/slug/{slug}` | Lấy sản phẩm theo slug |
| GET | `/api/products/category/{category}` | Lấy sản phẩm theo danh mục |
| GET | `/api/products/sale` | Lấy sản phẩm đang giảm giá |
| GET | `/api/products/search?keyword=...` | Tìm kiếm sản phẩm |
| POST | `/api/products` | Tạo sản phẩm mới |
| PUT | `/api/products/{id}` | Cập nhật sản phẩm |
| DELETE | `/api/products/{id}` | Xóa sản phẩm |

## 💾 Database

Project sử dụng **H2 Database** (in-memory) cho môi trường development. Database được tự động tạo và populate với sample data khi khởi động.

### H2 Console
Truy cập: **http://localhost:8080/h2-console**
- JDBC URL: `jdbc:h2:mem:cocoondb`
- Username: `sa`
- Password: (để trống)

### Chuyển sang MySQL (Production)
Cập nhật `application.properties`:

```properties
# MySQL Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/cocoon_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```

## 🎨 Tính năng

### Frontend
- ✅ Trang chủ với bài viết nổi bật
- ✅ Danh sách bài viết với filter theo danh mục
- ✅ Chi tiết bài viết
- ✅ Trang sản phẩm
- ✅ Trang giới thiệu
- ✅ Header & Footer responsive
- ✅ Search overlay
- ✅ Animations với Framer Motion
- ✅ Responsive design

### Backend
- ✅ REST API đầy đủ CRUD
- ✅ Pagination và sorting
- ✅ Tìm kiếm
- ✅ CORS configuration
- ✅ Exception handling
- ✅ Sample data initialization

## 🔧 Tech Stack

### Backend
- **Spring Boot 3.2.1**
- **Spring Data JPA**
- **H2 Database** (dev) / **MySQL** (prod)
- **Lombok**
- **Maven**

### Frontend
- **React 18**
- **React Router v6**
- **Axios**
- **Framer Motion**
- **Vite**

## 📱 Screenshots

Sau khi chạy cả Backend và Frontend, truy cập:
- **http://localhost:5173** - Trang chủ
- **http://localhost:5173/bai-viet** - Danh sách bài viết
- **http://localhost:5173/san-pham** - Sản phẩm
- **http://localhost:5173/ve-goi-may** - Về Gói Mây

## 🤝 Contributing

1. Fork project
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

**Note:** Đây là project **Gói Mây** - Mỹ phẩm thuần chay Việt Nam.
