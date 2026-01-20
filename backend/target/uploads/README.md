# Thư mục Uploads

Thư mục này chứa tất cả các file ảnh được upload lên website thông qua admin panel.

## Lưu ý:

- **Tất cả ảnh được lưu trong thư mục này** để có thể commit vào git và đồng bộ giữa các máy
- Khi bạn upload ảnh mới qua admin panel, ảnh sẽ được lưu vào đây
- **Hãy commit thư mục này vào git** để đảm bảo ảnh không bị mất khi chạy trên máy khác

## Cách hoạt động:

1. Admin upload ảnh qua web → Ảnh được lưu vào `backend/uploads/`
2. Commit thư mục `uploads/` vào git
3. Khi chạy trên máy khác, ảnh sẽ có sẵn trong thư mục này
