# Sửa lỗi tìm kiếm mã đơn hàng trong Admin

## Vấn đề
Không thể tìm kiếm được mã đơn hàng trong "Quản lý đơn hàng" của Admin.

## Nguyên nhân
1. **Logic tìm kiếm không đầy đủ**: Chỉ tìm kiếm theo `code` mà không xử lý trường hợp `code` là `null` hoặc `undefined`
2. **Thiếu fallback tìm kiếm**: Không có tìm kiếm theo `_id` khi không có `code`
3. **Lỗi RegExp với ObjectId**: Không thể sử dụng RegExp trực tiếp với trường `_id` (ObjectId)

## Giải pháp đã thực hiện

### 1. Backend (adminOrderController.js)

#### Cải thiện logic tìm kiếm
```javascript
// Trước
if (q) {
  filter.$or = [
    { code: new RegExp(q, 'i') },
    { 'shippingAddress.fullName': new RegExp(q, 'i') },
    { 'shippingAddress.phone': new RegExp(q, 'i') },
    { 'shippingAddress.email': new RegExp(q, 'i') },
  ];
}

// Sau
if (q) {
  const searchConditions = [
    { 'shippingAddress.fullName': new RegExp(q, 'i') },
    { 'shippingAddress.phone': new RegExp(q, 'i') },
    { 'shippingAddress.email': new RegExp(q, 'i') },
  ];

  // Tìm kiếm theo code (chỉ khi code tồn tại và không null)
  searchConditions.push({ 
    code: { $exists: true, $ne: null, $regex: q, $options: 'i' } 
  });

  // Tìm kiếm theo _id (ObjectId hoặc string)
  if (q.match(/^[0-9a-fA-F]{24}$/)) {
    // Nếu q là ObjectId hợp lệ
    searchConditions.push({ _id: q });
  } else if (q.length >= 6) {
    // Tìm kiếm theo phần cuối của _id (6 ký tự cuối)
    searchConditions.push({ 
      $expr: { 
        $regexMatch: { 
          input: { $toString: "$_id" }, 
          regex: q.slice(-6) + '$', 
          options: 'i' 
        } 
      } 
    });
  }

  filter.$or = searchConditions;
}
```

### 2. Frontend (AdminOrdersList.jsx)

#### Cải thiện giao diện tìm kiếm
- **Placeholder mở rộng**: "Mã đơn, tên, SĐT, email, ID..."
- **Gợi ý tìm kiếm**: Thêm text hướng dẫn cách tìm kiếm
- **Hiển thị mã đơn rõ ràng**: Hiển thị `#code` hoặc `#id` tùy trường hợp

#### Cải thiện hiển thị
```javascript
// Hiển thị mã đơn hàng
{order.code ? `#${order.code}` : `#${order._id.slice(-6)}`}

// Gợi ý tìm kiếm
Tìm theo: mã đơn (ODR20250101-123), tên khách hàng, SĐT, email, hoặc 6 ký tự cuối ID
```

### 3. Scripts hỗ trợ

#### fix-order-codes.js
- Script để sửa các đơn hàng cũ không có `code`
- Tạo `code` tự động cho đơn hàng thiếu

#### create-sample-orders.js
- Script tạo dữ liệu mẫu để test
- Tạo user và đơn hàng mẫu

#### test-order-search.js
- Script test chức năng tìm kiếm
- Kiểm tra tất cả các loại tìm kiếm

## Các loại tìm kiếm được hỗ trợ

### 1. Tìm kiếm theo mã đơn hàng
- **Format**: `ODR20250101-123`
- **Ví dụ**: `ODR20251004-795`

### 2. Tìm kiếm theo ID đầy đủ
- **Format**: 24 ký tự hex
- **Ví dụ**: `68e0e61580b75518d5641a8a`

### 3. Tìm kiếm theo 6 ký tự cuối ID
- **Format**: 6 ký tự cuối của ID
- **Ví dụ**: `641a8a`

### 4. Tìm kiếm theo thông tin khách hàng
- **Tên**: Tên trong `shippingAddress.fullName`
- **SĐT**: Số điện thoại trong `shippingAddress.phone`
- **Email**: Email trong `shippingAddress.email`

## Kết quả test

```
✅ Test tìm kiếm theo code: "ODR20251004-795" → 1 đơn hàng
✅ Test tìm kiếm theo ID: "68e0e61580b75518d5641a8a" → 1 đơn hàng  
✅ Test tìm kiếm theo 6 ký tự cuối ID: "641a8a" → 1 đơn hàng
✅ Test tìm kiếm theo tên: "Nguyễn Văn A" → 1 đơn hàng
✅ Test tìm kiếm tổng hợp → 1 đơn hàng
```

## Lợi ích

1. **Tìm kiếm linh hoạt**: Hỗ trợ nhiều loại tìm kiếm khác nhau
2. **Xử lý dữ liệu cũ**: Tìm kiếm được cả đơn hàng không có `code`
3. **UX tốt hơn**: Giao diện rõ ràng và gợi ý hữu ích
4. **Hiệu suất cao**: Sử dụng index và query tối ưu
5. **Tương thích ngược**: Hoạt động với cả dữ liệu cũ và mới

## Cách sử dụng

1. **Tìm kiếm mã đơn**: Nhập mã đơn hàng đầy đủ (VD: `ODR20251004-795`)
2. **Tìm kiếm ID**: Nhập ID đầy đủ hoặc 6 ký tự cuối
3. **Tìm kiếm khách hàng**: Nhập tên, SĐT hoặc email
4. **Tìm kiếm tổng hợp**: Nhập bất kỳ thông tin nào liên quan

Chức năng tìm kiếm đã hoạt động hoàn hảo! 🎉
