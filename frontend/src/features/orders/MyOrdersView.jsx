/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang Lịch sử Đơn hàng (My Orders Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là trung tâm quản lý mọi giao dịch đã thực hiện của người dùng.
 *    - Cung cấp cái nhìn tổng quan về trạng thái của các đơn hàng: Đang chờ, Đang giao, Đã nhận hay Đã hủy.
 *    - Cho phép tìm kiếm nhanh đơn hàng cũ và kích hoạt quy trình Đánh giá sản phẩm (Feedback/Review).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Sau mua hàng & Quản lý Tài khoản (Post-purchase & Account Management Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `useMemo` for Client-side Filtering: Kỹ thuật lọc dữ liệu cực nhanh ngay tại trình duyệt. Thay vì mỗi lần đổi Tab hay gõ tìm kiếm lại phải gọi API, hệ thống sử dụng `useMemo` để tính toán lại danh sách hiển thị dựa trên mảng `orders` có sẵn trong Redux.
 *    - Status Normalization: Một hàm helper (`normalizeStatus`) thông minh giúp "làm sạch" dữ liệu trạng thái từ backend (có thể là tiếng Việt, tiếng Anh, viết hoa/thường) về một bộ mã chuẩn để điều khiển logic UI.
 *    - Nested List Rendering: Kỹ thuật "Vòng lặp trong vòng lặp". Duyệt qua từng Đơn hàng, rồi trong mỗi đơn lại duyệt qua từng Sản phẩm con để hiển thị hình ảnh và tên.
 *    - Component Composition: Kết hợp `AccountSidebar` (Thanh điều hướng tài khoản) và `ReviewComment` (Modal đánh giá) để tạo nên một trang Dashboard hoàn chỉnh.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Mảng dữ liệu `orders` từ Redux Store.
 *    - Output: Giao diện quản lý đơn hàng tương tác cao, cho phép lọc, tìm kiếm và đánh giá.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `currentTab`: Lưu trữ trạng thái bộ lọc hiện tại (ví dụ: đang xem các đơn "Đang giao").
 *    - `searchQuery`: Lưu nội dung người dùng gõ vào ô tìm kiếm.
 *    - `reviewProduct`: State đặc biệt lưu thông tin sản phẩm mà người dùng muốn đánh giá. Khi biến này có giá trị, Modal đánh giá sẽ tự động bật lên.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `getStatusConfig`: Một "tự điển" nhỏ giúp ánh xạ trạng thái sang màu sắc CSS và văn bản hiển thị tương ứng.
 *    - `formatDate`: Format lại thời gian sang định dạng `DD/MM/YYYY HH:mm` cho người Việt dễ đọc.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: `useEffect` kích hoạt ngay khi vào trang để lấy toàn bộ đơn hàng của User từ Server.
 *    - Bước 2: Dữ liệu đổ về Redux -> `filteredOrders` (useMemo) tự động tính toán lại danh sách ban đầu.
 *    - Bước 3: User click Tab hoặc Search -> `filteredOrders` tiếp tục "lọc" dữ liệu theo ý muốn người dùng.
 *    - Bước 4: User nhấn "Đánh giá" -> `reviewProduct` được gán giá trị -> Modal đánh giá hiện lên.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> GET Request -> API `/api/v1/orders/me` -> MongoDB -> Trả về mảng Orders.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Loading State: Hiển thị Spinner xoay khi đang đợi API trả về kết quả.
 *    - Empty State: Hiển thị hình minh họa "Chưa có đơn hàng" nếu mảng sau khi lọc bị rỗng.
 *    - Action Guard: Chỉ những đơn hàng có trạng thái "Hoàn thành" mới được hiển thị nút "Đánh giá".
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Hàm `dispatch(getMyOrders())` thực hiện lấy dữ liệu từ Server.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý hàm `normalizeStatus`: Nếu backend thêm trạng thái mới, bạn PHẢI cập nhật hàm này đầu tiên để giao diện không bị lỗi hiển thị.
 *    - `order._id?.slice(-8)`: Đây là thủ thuật UI để hiển thị mã đơn hàng ngắn gọn, dễ nhớ cho khách hàng.
 */
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders, cancelOrder, removeSuccess, removeErrors } from "@/features/orders/orderSlice";
import { Link } from "react-router-dom";
import { formatVND } from "@/shared/utils/formatCurrency";
import { toast } from "react-toastify";

import PageTitle from "@/shared/components/PageTitle";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import AccountSidebar from "@/features/user/components/AccountSidebar";
import ReviewComment from "@/features/orders/components/ReviewComment";
import CancelOrderModal from "@/features/orders/components/CancelOrderModal";
import "@/features/orders/styles/MyOrders.css";
import "@/features/user/styles/AccountShared.css";

// Status tabs
const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ thanh toán" },
  { id: "shipping", label: "Đang Giao" },
  { id: "delivered", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

// Normalize status
const normalizeStatus = (status) => {
  if (!status) return "pending";
  const s = status.toLowerCase().trim();

  if (s.includes("chờ") || s.includes("cho xu ly") || s.includes("pending") || s === "chờ xử lý") {
    return "pending";
  }
  if (s.includes("đang giao") || s.includes("dang giao") || s.includes("shipping")) {
    return "shipping";
  }
  if (s.includes("đã giao") || s.includes("da giao") || s.includes("delivered") || s.includes("hoàn thành")) {
    return "delivered";
  }
  if (s.includes("đã hủy") || s.includes("da huy") || s.includes("cancelled")) {
    return "cancelled";
  }

  return "pending";
};

function MyOrders() {
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewOrderId, setReviewOrderId] = useState(null);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCancelOrderId, setSelectedCancelOrderId] = useState(null);

  const { orders = [], loading, error, cancelSuccess } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(removeErrors());
    }

    if (cancelSuccess) {
      toast.success("Hủy đơn hàng thành công!");
      setIsCancelModalOpen(false);
      setSelectedCancelOrderId(null);
      dispatch(removeSuccess());
      dispatch(getMyOrders()); // Load lại danh sách đơn hàng mới nhất
    }
  }, [dispatch, error, cancelSuccess]);

  const handleCancelOrder = (id) => {
    setSelectedCancelOrderId(id);
    setIsCancelModalOpen(true);
  };

  const confirmCancelOrder = (reason) => {
    if (selectedCancelOrderId) {
      dispatch(cancelOrder({ id: selectedCancelOrderId, reason }));
    }
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (currentTab !== "all") {
      result = result.filter((order) => normalizeStatus(order.orderStatus) === currentTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          (order.orderCode && order.orderCode.toLowerCase().includes(query)) ||
          order._id?.toLowerCase().includes(query) ||
          order.orderItems?.some((item) => item.name?.toLowerCase().includes(query))
      );
    }

    return result;
  }, [orders, currentTab, searchQuery]);


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    const normalized = normalizeStatus(status);
    const configs = {
      pending: { className: "status-pending", text: "CHỜ XỬ LÝ", statusText: "" },
      shipping: { className: "status-shipping", text: "ĐANG GIAO", statusText: "Đang trên đường giao đến bạn" },
      delivered: { className: "status-delivered", text: "HOÀN THÀNH", statusText: "Giao hàng thành công" },
      cancelled: { className: "status-cancelled", text: "ĐÃ HỦY", statusText: "Đơn hàng đã bị hủy" },
    };
    return configs[normalized] || { className: "", text: status, statusText: "" };
  };

  const getItemImage = (item) =>
    item?.image || item?.images?.[0]?.url || item?.images?.[0] || "";

  return (
    <>
      <PageTitle title="Đơn hàng của tôi" />
      <Navbar />

      <div className="account-container">
        <div className="account-content">

          <AccountSidebar />

          {/* Main Content */}
          <main className="account-main">
            
            {/* HERO HEADER - ĐỒNG BỘ GIAO DIỆN */}
            <div className="account-hero">
                <div className="hero-content">
                    <span className="hero-badge">Lịch sử mua hàng</span>
                    <h1 className="hero-title">
                        Đơn hàng <br />
                        <span className="hero-title-highlight">Của tôi</span>
                    </h1>
                    <p className="hero-desc">
                        Kiểm tra trạng thái các đơn hàng đã đặt. Theo dõi quá trình vận chuyển và quản lý các đơn hàng của bạn một cách dễ dàng.
                    </p>
                </div>
                <div className="hero-stats">
                    <p className="hero-stats-label">Tổng số đơn hàng</p>
                    <div className="hero-stats-number">
                        <span className="number">{orders.length}</span>
                        <span className="unit">đơn</span>
                    </div>
                </div>
                <div className="hero-decoration-1"></div>
                <div className="hero-decoration-2"></div>
            </div>

            {/* Header with search & tabs */}
            <div className="account-card" style={{padding: '24px'}}>
              <div className="orders-header-top" style={{marginBottom: '24px'}}>
                <div className="orders-search-wrapper">
                  <span className="search-icon-box">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm kiếm theo ID đơn hàng hoặc Tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Tab Bar Duy trì logic cũ nhưng bọc trong account-tabs */}
              <div className="account-tab-group" style={{marginBottom: 0}}>
                <div className="account-tabs">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      className={`account-tab ${currentTab === tab.id ? "active" : ""}`}
                      onClick={() => setCurrentTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="orders-error">⚠️ {typeof error === 'string' ? error : 'Có lỗi xảy ra'}</div>
            )}

            {/* Scrollable Body */}
            <div className="orders-body">
              {loading ? (
                <div className="orders-loading">
                  <div className="spinner"></div>
                  <p>Đang tải đơn hàng...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                /* Empty State */
                <div className="orders-empty">
                  <div className="empty-icon-circle">
                    <svg className="empty-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="empty-title">
                    {searchQuery ? "Không tìm thấy đơn hàng phù hợp" : "Chưa có đơn hàng nào"}
                  </h3>
                  <p className="empty-desc">
                    {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Hãy mua sắm để có đơn hàng đầu tiên!"}
                  </p>
                  {!searchQuery && (
                    <Link to="/products" className="btn-shop-now">Mua sắm ngay</Link>
                  )}
                </div>
              ) : (
                /* Orders List */
                <div className="orders-list">
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.orderStatus);
                    const normalized = normalizeStatus(order.orderStatus);

                    return (
                      <div className="order-card" key={order._id}>
                        {/* Order Header */}
                        <div className="order-card-header">
                          <div className="order-header-left">
                            <span className="shop-name">{user?.name || "Sách Ơi"}</span>
                            <span className="header-divider">|</span>
                            <span className={`status-badge ${statusConfig.className}`}>
                              {statusConfig.text}
                            </span>
                          </div>
                          <span className="order-id">
                            {order.orderCode ? `Mã: ${order.orderCode}` : `ID: #${order._id?.slice(-8).toUpperCase()}`}
                          </span>
                        </div>

                        {/* Product List */}
                        <div className="order-products">
                          {order.orderItems?.map((item, idx) => (
                            <div className="product-item" key={idx}>
                              <img
                                src={getItemImage(item)}
                                alt={item.name}
                                className="product-image"
                                onError={(e) => {
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f1f5f9' width='80' height='80' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3E📦%3C/text%3E%3C/svg%3E";
                                }}
                              />
                              <div className="product-info">
                                <h3 className="product-name">{item.name}</h3>
                                <p className="product-meta">Số lượng: {item.quantity}</p>
                                <p className="product-price-inline">{formatVND(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="order-card-footer">
                          <div className="footer-date">
                            Đặt hàng ngày <span className="date-value">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="footer-actions-row">
                            <div className="total-block">
                              <span className="total-label">Tổng tiền</span>
                              <span className="total-price">{formatVND(order.totalPrice)}</span>
                            </div>
                            <div className="action-buttons">
                              {normalized === "pending" && (
                                <button
                                  className="btn-cancel-order"
                                  onClick={() => handleCancelOrder(order._id)}
                                  disabled={loading}
                                >
                                  Hủy Đơn
                                </button>
                              )}
                              <Link to={`/order/${order._id}`} className="btn-detail">Xem Chi Tiết</Link>
                              {normalized === "delivered" && (
                                <>
                                  <button
                                    className="btn-review"
                                    onClick={() => {
                                      const firstItem = order.orderItems?.[0];
                                      if (firstItem) {
                                        setReviewProduct({
                                          _id: firstItem.productId || firstItem.product || firstItem._id,
                                          name: firstItem.name,
                                          images: firstItem.images || (firstItem.image ? [{ url: firstItem.image }] : []),
                                          category: firstItem.category || "",
                                        });
                                        setReviewOrderId(order._id);
                                      }
                                    }}
                                  >
                                    Đánh giá
                                  </button>
                                  <button className="btn-rebuy">Mua lại</button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>

        </div>
      </div>

      <Footer />

      {/* Review Modal */}
      <ReviewComment
        isOpen={!!reviewProduct}
        product={reviewProduct}
        orderId={reviewOrderId}
        onClose={() => {
          setReviewProduct(null);
          setReviewOrderId(null);
        }}
        onSuccess={() => {
          dispatch(getMyOrders());
        }}
      />

      {/* Cancellation Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedCancelOrderId(null);
        }}
        onConfirm={confirmCancelOrder}
        orderId={selectedCancelOrderId}
      />
    </>
  );
}

export default MyOrders;
