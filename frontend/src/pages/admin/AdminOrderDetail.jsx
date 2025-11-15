// frontend/src/pages/admin/AdminOrderDetail.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminFetchOrder, adminUpdateOrder, adminCancelOrder } from '../../services/adminOrders';

const NEXT_STEPS = ['confirmed','processing','shipped','delivered'];
const ALL_STATUS = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', color: 'yellow', icon: '⏳' },
  confirmed: { label: 'Đã xác nhận', color: 'blue', icon: '✅' },
  processing: { label: 'Đang xử lý', color: 'purple', icon: '🔄' },
  shipped: { label: 'Đã gửi', color: 'indigo', icon: '📦' },
  delivered: { label: 'Đã giao', color: 'green', icon: '🎉' },
  cancelled: { label: 'Đã hủy', color: 'red', icon: '❌' },
  refunded: { label: 'Hoàn tiền', color: 'orange', icon: '💰' },
};

// Component StatusBadge
const StatusBadge = ({ status, paid }) => {
  const config = STATUS_CONFIG[status] || { label: status, color: 'gray', icon: '❓' };
  
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-sm font-medium ${colorClasses[config.color]}`}>
        <span className="mr-2">{config.icon}</span>
        {config.label}
      </div>
      <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
        paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
      }`}>
        {paid ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
      </div>
    </div>
  );
};

// Component OrderTimeline
const OrderTimeline = ({ order }) => {
  const timeline = [
    { key: 'placedAt', label: 'Đặt hàng', icon: '🛒', status: 'completed' },
    { key: 'confirmedAt', label: 'Xác nhận', icon: '✅', status: order.confirmedAt ? 'completed' : 'pending' },
    { key: 'shippedAt', label: 'Gửi hàng', icon: '📦', status: order.shippedAt ? 'completed' : 'pending' },
    { key: 'deliveredAt', label: 'Giao hàng', icon: '🎉', status: order.deliveredAt ? 'completed' : 'pending' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Tiến trình đơn hàng</h3>
      <div className="space-y-2">
        {timeline.map((item, index) => (
          <div key={item.key} className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              item.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {item.status === 'completed' ? item.icon : '⏳'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                item.status === 'completed' ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {item.label}
              </p>
              {order[item.key] && (
                <p className="text-xs text-gray-500">
                  {new Date(order[item.key]).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [o, setO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const ord = await adminFetchOrder(id);
      setO(ord);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const updateStatus = async (status) => {
    setBusy(true);
    try {
      const ord = await adminUpdateOrder(id, { status });
      setO(ord);
    } finally {
      setBusy(false);
    }
  };
  const togglePaid = async () => {
    setBusy(true);
    try {
      const ord = await adminUpdateOrder(id, { paid: !o.paid });
      setO(ord);
    } finally {
      setBusy(false);
    }
  };
  const cancel = async () => {
    if (!confirm('Xác nhận hủy đơn này?')) return;
    setBusy(true);
    try {
      const ord = await adminCancelOrder(id);
      setO(ord);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }
  
  if (!o) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
        <p className="text-gray-500">Đơn hàng này có thể đã bị xóa hoặc không tồn tại.</p>
      </div>
    );
  }

  const canAdvance = NEXT_STEPS.includes(o.status) ? NEXT_STEPS.slice(NEXT_STEPS.indexOf(o.status) + 1)[0] : 'confirmed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            ← Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{o.code || o._id.slice(-6)}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Đặt lúc: {o.placedAt ? new Date(o.placedAt).toLocaleString('vi-VN') : new Date(o.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
        <StatusBadge status={o.status} paid={o.paid} />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm đã đặt</h2>
            <div className="space-y-8">
              {o.items.map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-3xl shadow-lg overflow-hidden">
                  {/* Product Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-700">Sản phẩm #{idx + 1}</h3>
                      <div className="text-sm text-gray-500">Đã đặt</div>
                    </div>
                  </div>

                  {/* Product Content */}
                  <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column - Product Image & Basic Info */}
                      <div className="space-y-6">
                        {/* Product Image */}
                        <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                          {item.productId?.images?.[0]?.url ? (
                            <img 
                              src={item.productId.images[0].url} 
                              alt={item.productId.images[0].alt || item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-6xl">📦</span>
                            </div>
                          )}
                        </div>

                        {/* Product Name & Brand */}
                        <div className="space-y-3">
                          <h4 className="text-2xl font-bold text-gray-900 leading-tight">
                            {item.name}
                          </h4>
                          

                        </div>
                      </div>

                      {/* Right Column - Product Details & Pricing */}
                      <div className="space-y-6">
                        {/* Product Specifications */}
                        <div className="space-y-4">
                          <h5 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Thông số sản phẩm đã đặt
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Size */}
                            {item.size && (
                              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">S</span>
                                  </div>
                                  <div>
                                    <div className="text-sm text-blue-600 font-medium">Kích thước đã đặt</div>
                                    <div className="text-lg font-bold text-blue-800">{item.size}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Color */}
                            {item.color && (
                              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">C</span>
                                  </div>
                                  <div>
                                    <div className="text-sm text-green-600 font-medium">Màu sắc đã đặt</div>
                                    <div className="text-lg font-bold text-green-800">{item.color}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity & Pricing */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                          <div className="space-y-4">
                            {/* Quantity */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Số lượng đã đặt:</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">Q</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">{Number(item.qty || 0)}</span>
                              </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Đơn giá:</span>
                                <span className="text-lg font-semibold text-gray-900">
                                  {Number(item.price || 0).toLocaleString()}₫
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Số lượng:</span>
                                <span className="text-lg font-semibold text-gray-900">{Number(item.qty || 0)}</span>
                              </div>
                              
                              <div className="flex items-center justify-between pt-3 border-t-2 border-gray-300">
                                <span className="text-lg font-bold text-gray-900">Thành tiền:</span>
                                <span className="text-2xl font-bold text-blue-600">
                                  {(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString()}₫
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Product Info */}
                        {item.productId?.categories?.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-600">Danh mục:</span>
                            <div className="flex flex-wrap gap-2">
                              {item.productId.categories.map((category, catIdx) => (
                                <span key={catIdx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Product Status */}
                        {item.productId?.status && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">Trạng thái sản phẩm:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              item.productId.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : item.productId.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.productId.status === 'active' ? 'Đang bán' : 
                               item.productId.status === 'draft' ? 'Bản nháp' : 'Ngừng bán'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="text-gray-900">{Number(o.subtotal || 0).toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="text-gray-900">{Number(o.shippingFee || 0).toLocaleString()}₫</span>
                </div>
                {o.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="text-red-600">-{Number(o.discount || 0).toLocaleString()}₫</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Tổng thanh toán</span>
                  <span className="text-gray-900">{Number(o.total || 0).toLocaleString()}₫</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <OrderTimeline order={o} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
            <div className="space-y-4">
              {/* Customer Avatar & Basic Info */}
              {o.userId && (
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                  <div className="flex-shrink-0">
                    {o.userId.avatarUrl ? (
                      <img 
                        src={o.userId.avatarUrl} 
                        alt="Avatar" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-lg">👤</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {o.userId.name || 'Khách hàng'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Thành viên từ: {new Date(o.userId.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        o.userId.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {o.userId.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                      {o.userId.role === 'admin' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Họ tên</label>
                  <p className="text-sm text-gray-900">
                    {o.shippingAddress?.fullName || o.userId?.name || '—'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                  <p className="text-sm text-gray-900">
                    {o.shippingAddress?.phone || o.userId?.phone || '—'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-900">
                    {o.shippingAddress?.email || o.userId?.email || '—'}
                  </p>
                </div>

                {/* Additional User Info */}
                {o.userId && (
                  <>
                    {o.userId.dob && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Ngày sinh</label>
                        <p className="text-sm text-gray-900">
                          {new Date(o.userId.dob).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    )}
                    
                    {o.userId.gender && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Giới tính</label>
                        <p className="text-sm text-gray-900">
                          {o.userId.gender === 'male' ? 'Nam' : 
                           o.userId.gender === 'female' ? 'Nữ' : 'Khác'}
                        </p>
                      </div>
                    )}
                    
                    {o.userId.address && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Địa chỉ thường trú</label>
                        <p className="text-sm text-gray-900">{o.userId.address}</p>
                      </div>
                    )}
                  </>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Địa chỉ giao hàng</label>
                  <p className="text-sm text-gray-900">
                    {[
                      o.shippingAddress?.line1,
                      o.shippingAddress?.line2,
                      o.shippingAddress?.ward,
                      o.shippingAddress?.district,
                      o.shippingAddress?.city
                    ].filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác</h2>
            <div className="space-y-3">
              {/* Payment Status */}
              <button 
                disabled={busy} 
                onClick={togglePaid}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  o.paid 
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {o.paid ? 'Đánh dấu CHƯA THU' : 'Đánh dấu ĐÃ THU'}
              </button>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cập nhật trạng thái</label>
                <select
                  disabled={busy}
                  value={o.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {ALL_STATUS.map(s => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s]?.label || s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Actions */}
              {!['delivered','cancelled','refunded'].includes(o.status) && (
                <button 
                  disabled={busy} 
                  onClick={() => updateStatus(canAdvance)}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Tiến tới: {STATUS_CONFIG[canAdvance]?.label || canAdvance}
                </button>
              )}

              {/* Cancel Order */}
              {['pending','confirmed','processing','shipped'].includes(o.status) && (
                <button 
                  disabled={busy} 
                  onClick={cancel}
                  className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết đơn hàng</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng</span>
                <span className="text-gray-900 font-mono">#{o.code || o._id.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức thanh toán</span>
                <span className="text-gray-900">{o.paymentMethod || 'COD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ghi chú</span>
                <span className="text-gray-900">{o.note || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
