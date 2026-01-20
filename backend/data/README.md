# Thư mục Data

Thư mục này chứa các file dữ liệu được export từ database để đồng bộ giữa các máy.

## Các file dữ liệu:

### 1. site-settings.json
Chứa tất cả các cài đặt của website (site settings) được admin thay đổi.

### 2. all-data.json
Chứa **TẤT CẢ** dữ liệu của website bao gồm:
- Site Settings (cài đặt website)
- Categories (danh mục bài viết)
- Product Categories (danh mục sản phẩm)
- Articles (bài viết)
- Products (sản phẩm kèm hình ảnh)

## Cách sử dụng:

### Khi admin thay đổi dữ liệu trên web:

1. **Thay đổi Site Settings (ảnh, text):**
   - Sau khi thay đổi xong, vào trang Admin → Site Settings
   - Click nút "🔄 Đồng bộ Site Settings" 
   - File `site-settings.json` sẽ được cập nhật

2. **Thay đổi Sản phẩm, Bài viết, Danh mục:**
   - Sau khi thay đổi xong, vào trang Admin → Site Settings
   - Click nút "🚀 Đồng bộ TẤT CẢ vào Code"
   - File `all-data.json` sẽ được cập nhật với tất cả dữ liệu

### Khi chạy trên máy khác:

- Khi backend khởi động, hệ thống sẽ tự động import dữ liệu từ các file này vào database
- Nếu database đã có dữ liệu, hệ thống sẽ bỏ qua import để tránh ghi đè

### Commit vào Git:

Sau khi export, hãy commit các file sau vào git:
- `backend/data/site-settings.json` (nếu chỉ thay đổi site settings)
- `backend/data/all-data.json` (nếu thay đổi sản phẩm/bài viết/danh mục)
- `backend/uploads/` (tất cả ảnh đã upload)

## Lưu ý:

- Các file này sẽ được tự động tạo khi bạn export dữ liệu lần đầu
- Luôn commit các file này sau khi thay đổi để đồng bộ với team
- **Quan trọng:** Khi thay đổi sản phẩm, bài viết hoặc danh mục, hãy dùng nút "Đồng bộ TẤT CẢ" để export cả ảnh và dữ liệu
