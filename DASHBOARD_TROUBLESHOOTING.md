# Khắc phục sự cố Dashboard Admin

## Vấn đề: "Có thấy gì đâu"

Nếu dashboard không hiển thị dữ liệu, có thể do một số nguyên nhân sau:

## 1. Kiểm tra Backend Server

### Chạy Backend Server
```bash
cd backend
npm start
# hoặc
node src/server.js
```

### Kiểm tra API Endpoints
Truy cập các URL sau trong browser hoặc Postman:
- `http://localhost:5000/admin/dashboard/stats`
- `http://localhost:5000/admin/dashboard/revenue-chart`
- `http://localhost:5000/admin/dashboard/recent-orders`
- `http://localhost:5000/admin/dashboard/top-products`

## 2. Kiểm tra Database

### Kết nối MongoDB
Đảm bảo MongoDB đang chạy và có dữ liệu:
```bash
# Kiểm tra kết nối
mongo
use ecommerce
db.orders.count()
db.products.count()
db.users.count()
```

### Tạo dữ liệu mẫu
```bash
cd backend
node scripts/create-sample-orders.js
```

## 3. Kiểm tra Frontend

### Console Logs
Mở Developer Tools (F12) và kiểm tra Console:
- Tìm các log: `🔄 Đang tải dữ liệu dashboard...`
- Kiểm tra lỗi API: `❌ Stats API error:`
- Xem dữ liệu trả về: `✅ Stats API:`

### Network Tab
Kiểm tra các request API:
- Status code phải là 200
- Response phải có dữ liệu JSON

## 4. Các lỗi thường gặp

### Lỗi 404 - Not Found
```
GET http://localhost:5000/admin/dashboard/stats 404 (Not Found)
```
**Giải pháp**: Kiểm tra routes đã được thêm vào `backend/src/routes/index.js`

### Lỗi 500 - Internal Server Error
```
GET http://localhost:5000/admin/dashboard/stats 500 (Internal Server Error)
```
**Giải pháp**: Kiểm tra console backend để xem lỗi chi tiết

### Lỗi CORS
```
Access to fetch at 'http://localhost:5000/admin/dashboard/stats' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Giải pháp**: Kiểm tra cấu hình CORS trong backend

### Lỗi Authentication
```
GET http://localhost:5000/admin/dashboard/stats 401 (Unauthorized)
```
**Giải pháp**: Đảm bảo đã đăng nhập với tài khoản admin

## 5. Dashboard Fallback

Nếu API không hoạt động, dashboard sẽ hiển thị:
- ⚠️ Thông báo "Đang sử dụng dữ liệu mẫu"
- Dữ liệu mẫu với giá trị 0
- Giao diện vẫn hoạt động bình thường

## 6. Debug Steps

### Bước 1: Kiểm tra Backend
```bash
cd backend
node scripts/simple-dashboard-test.js
```

### Bước 2: Kiểm tra API trực tiếp
```bash
curl http://localhost:5000/admin/dashboard/stats
```

### Bước 3: Kiểm tra Frontend Console
- Mở Developer Tools
- Xem Console logs
- Kiểm tra Network requests

### Bước 4: Kiểm tra Database
```bash
mongo
use ecommerce
db.orders.find().limit(1)
```

## 7. Giải pháp nhanh

### Nếu không có dữ liệu:
1. Tạo dữ liệu mẫu: `node scripts/create-sample-orders.js`
2. Restart backend server
3. Refresh frontend

### Nếu API lỗi:
1. Kiểm tra console backend
2. Kiểm tra database connection
3. Kiểm tra routes configuration

### Nếu frontend lỗi:
1. Kiểm tra console frontend
2. Kiểm tra network requests
3. Kiểm tra authentication

## 8. Test Scripts

### Test Backend API
```bash
cd backend
node scripts/test-dashboard-api.js
```

### Test Database
```bash
cd backend
node scripts/simple-dashboard-test.js
```

### Test Frontend
- Mở browser console
- Kiểm tra logs khi load dashboard
- Xem network requests

## 9. Cấu trúc Dashboard

Dashboard bao gồm:
- **KPI Cards**: Tổng đơn hàng, Doanh thu, Sản phẩm, Khách hàng
- **Revenue Chart**: Biểu đồ doanh thu 7 ngày
- **Recent Orders**: Đơn hàng gần đây
- **Top Products**: Sản phẩm bán chạy
- **Order Status**: Trạng thái đơn hàng
- **Quick Actions**: Tác vụ nhanh

## 10. Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề:
1. Kiểm tra logs chi tiết
2. Chụp ảnh màn hình lỗi
3. Cung cấp thông tin:
   - Backend server status
   - Database connection
   - Frontend console errors
   - Network requests status

**Dashboard sẽ hiển thị dữ liệu mẫu nếu API không hoạt động, đảm bảo giao diện luôn có thể sử dụng được!** 🎉
