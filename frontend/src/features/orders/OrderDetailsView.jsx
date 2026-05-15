/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang Chi tiết Đơn hàng (Order Details Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Hiển thị toàn bộ "lịch sử" và thông tin định danh của một đơn hàng cụ thể.
 *    - Cung cấp cái nhìn minh bạch về: Địa chỉ giao hàng, Hình thức thanh toán (COD/VNPAY), Trạng thái vận chuyển và Danh sách món đồ.
 *    - Tích hợp tính năng chuyên nghiệp: Xuất Hóa đơn PDF (In-browser Invoice Generation).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản lý Đơn hàng (Order Management Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - PDF Generation (Client-side): Sử dụng `html-to-image` để "chụp ảnh" giao diện và `jsPDF` để đóng gói thành tệp tài liệu PDF mà không cần Backend can thiệp.
 *    - Dynamic CSS Injection: Một thủ thuật nâng cao. Trước khi xuất PDF, mã nguồn tự động nhúng thêm các đoạn CSS tạm thời để ẩn đi các nút bấm (như nút "Quay lại") và tinh chỉnh layout sao cho đẹp nhất khi in ra giấy.
 *    - CORS Handling: Sử dụng `crossOrigin="anonymous"` và ảnh Placeholder an toàn để tránh lỗi bảo mật khi chuyển đổi hình ảnh từ Cloudinary sang Canvas.
 *    - Smart Path Switching: Sử dụng logic `user?.role === 'admin'` để quyết định xem nút "Quay lại" sẽ dẫn người dùng về trang Dashboard của Admin hay trang cá nhân của User.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Tham số `id` từ URL (ví dụ: `/order/67890`) và dữ liệu từ Global Store.
 *    - Output: Giao diện chi tiết trực quan và tệp PDF hóa đơn tải xuống.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `id`: Lấy từ `useParams()`, dùng để định danh đơn hàng cần truy vấn.
 *    - `orderDetails`: Chứa tất cả thông tin về đơn hàng từ API trả về.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `exportToPDF`: Hàm xử lý chuyển đổi HTML -> Image -> PDF với logic tính toán tỷ lệ (Scaling) để nội dung luôn nằm gọn trong 1 trang A4.
 *    - `formattedDate`: Biến đổi chuỗi thời gian khô khan thành định dạng tiếng Việt gần gũi.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: User click vào một đơn hàng bất kỳ trong danh sách.
 *    - Bước 2: Component nạp `id` từ URL và gọi API lấy dữ liệu chi tiết.
 *    - Bước 3: Render toàn bộ thông tin đơn hàng lên UI.
 *    - Bước 4 (Admin): Click "Xuất PDF" -> Hệ thống ẩn thanh cuộn -> Chụp ảnh giao diện -> Lưu PDF -> Hiện thông báo thành công.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> GET Request -> API `/api/v1/order/:id` -> MongoDB -> Trả về chi tiết Đơn hàng.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Color-coded Status: Sử dụng các class CSS động (Green cho Đã giao, Red cho Đã hủy) giúp người dùng nhận diện trạng thái chỉ trong 0.5 giây.
 *    - `isPaid`: Kiểm tra trạng thái thanh toán từ thuộc tính Database để hiển thị nhãn "Đã thanh toán" hoặc "Chưa thanh toán".
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Quá trình lấy thông tin đơn hàng và quá trình sinh tệp PDF là các tác vụ nặng chạy bất đồng bộ.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Biến `SAFE_PLACEHOLDER_IMAGE`: Đây là giải pháp dự phòng cực kỳ quan trọng. Nếu ảnh gốc sản phẩm bị lỗi hoặc bị chặn bởi chính sách bảo mật (CORS), Placeholder này sẽ xuất hiện để đảm bảo file PDF không bị lỗi.
 *    - Logic `element.style.overflow = 'visible'`: Nhớ rằng PDF không có thanh cuộn, nên ta phải ép nội dung giãn ra hết mức trước khi "chụp ảnh".
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetails } from '@/features/orders/orderSlice';
import '@/features/orders/styles/OrderDetails.css';
import formatVND from '@/shared/utils/formatCurrency.js';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
 
// Fallback image URL that supports CORS
const SAFE_PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&h=200&q=80";

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, error, orderDetails } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return <div className="text-center mt-10">Đang tải chi tiết đơn hàng...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Lỗi: {error}</div>;
  }

  if (!orderDetails || Object.keys(orderDetails).length === 0) {
    return <div className="text-center mt-10">Không tìm thấy đơn hàng</div>;
  }

  const formattedDate = new Date(orderDetails.createdAt).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const exportToPDF = async () => {
    const element = document.getElementById('order-details-content');
    if (!element) return;

    const toastId = toast.loading("Đang khởi tạo PDF Hóa đơn...");
    try {
        // --- Permanent Scrollbar Fix: Bơm mã CSS tạm thời ---
        const style = document.createElement('style');
        style.id = 'hide-scrollbar-style';
        style.innerHTML = `
            *::-webkit-scrollbar { display: none !important; }
            * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
            .overflow-x-auto { overflow: visible !important; }
            /* Hóa đơn Compact Premium Style */
            #order-details-content { 
                background-color: #ffffff !important; 
                color: #000000 !important;
                padding: 20px !important;
            }
            section { 
                border: 1px solid #e2e8f0 !important; 
                box-shadow: none !important;
                background-color: #ffffff !important;
                margin-bottom: 12px !important; /* Thu gọn giãn cách */
                padding: 12px 15px !important; /* Thu gọn padding */
            }
            h1 { 
                text-align: center !important; 
                text-transform: uppercase !important; 
                border-bottom: 1.5px solid #1e293b !important;
                padding-bottom: 8px !important;
                margin-bottom: 15px !important;
                font-size: 18px !important; /* Thu nhỏ tiêu đề */
            }
            h1::before {
                content: "HÓA ĐƠN BÁN HÀNG" !important;
                display: block !important;
                font-size: 22px !important;
                margin-bottom: 5px !important;
                color: #1e293b !important;
            }
            h2 { font-size: 14px !important; margin-bottom: 8px !important; padding-bottom: 4px !important; }
            .bg-slate-50, .bg-slate-100 { background-color: #ffffff !important; }
            /* Thu gọn ảnh sản phẩm */
            .h-16 { height: 2.5rem !important; width: 2.5rem !important; }
            table td, table th { padding: 8px 12px !important; font-size: 12px !important; }
        `;
        document.head.appendChild(style);

        const dataUrl = await toJpeg(element, { 
            quality: 0.98,
            backgroundColor: '#ffffff',
            pixelRatio: 2, 
            cacheBust: true,
            skipFonts: false,
            imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            filter: (node) => !node?.classList?.contains('no-print'),
            style: {
                fontFamily: 'sans-serif',
                margin: '0',
                padding: '20px',
                width: '1024px',
                maxWidth: 'none'
            }
        });

        document.head.removeChild(style);

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const pageHeightLimit = pdfHeight - margin * 2;
        const pageWidthLimit = pdfWidth - margin * 2;
        
        const imgProps = pdf.getImageProperties(dataUrl);
        
        // --- Smart Auto-Scaling to fit 1 Page ---
        // Tính toán tỷ lệ để hình ảnh luôn nằm vừa trong 1 trang A4
        const scale = Math.min(pageWidthLimit / imgProps.width, pageHeightLimit / imgProps.height);
        
        const finalWidth = imgProps.width * scale;
        const finalHeight = imgProps.height * scale;
        
        // Căn giữa hình ảnh theo chiều ngang
        const xOffset = (pdfWidth - finalWidth) / 2;
        
        pdf.addImage(dataUrl, 'JPEG', xOffset, margin, finalWidth, finalHeight);
        // ----------------------------------------
        
        const filename = `Hoa_Don_${orderDetails._id}.pdf`;
        pdf.save(filename);
        toast.update(toastId, { render: "Đã xuất Hoá đơn PDF thành công!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
        console.error(err);
        toast.update(toastId, { render: "Lỗi xuất PDF!", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <main id="order-details-content" className="container mx-auto px-4 py-8 max-w-5xl">
      {/* NavigationHeader */}
      <nav className="no-print mb-6 flex items-center justify-between">
        <Link className="flex items-center text-sm font-medium text-blue-600 hover-link-slide transition-colors" to={(user?.role_id?.name || user?.role) === 'admin' ? '/admin/orders' : '/orders/user'}>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Quay lại danh sách đơn hàng
        </Link>
        {user && (user?.role_id?.name || user?.role) === 'admin' && (
          <button className="inline-flex items-center px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover-btn-gradient transition-all shadow-sm" onClick={exportToPDF}>
            <span className="material-symbols-outlined mr-2">picture_as_pdf</span>
            Xuất PDF (Hóa đơn)
          </button>
        )}
      </nav>

      {/* OrderStatusCard */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm" data-purpose="order-status-banner">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Đơn hàng #{orderDetails._id}</h1>
            <p className="text-slate-500 text-sm mt-1">Ngày đặt: {formattedDate}</p>
          </div>
          <div className="flex items-center">
            {/* Status Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              orderDetails.orderStatus === 'Đã giao' ? 'bg-green-100 text-green-700' :
              orderDetails.orderStatus === 'Đang giao' ? 'bg-blue-100 text-blue-700' :
              orderDetails.orderStatus === 'Đã hủy' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              <span className={`w-2 h-2 mr-2 rounded-full ${
                orderDetails.orderStatus === 'Đã giao' ? 'bg-green-500' :
                orderDetails.orderStatus === 'Đang giao' ? 'bg-blue-500' :
                orderDetails.orderStatus === 'Đã hủy' ? 'bg-red-500' :
                'bg-yellow-500'
              }`}></span>
              {orderDetails.orderStatus}
            </span>
          </div>
        </div>

        {/* Cancellation Reason (Shopee Style) */}
        {orderDetails.orderStatus === 'Đã hủy' && orderDetails.cancellationReason && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <h4 className="text-sm font-bold text-red-800 flex items-center">
              <span className="material-symbols-outlined mr-2 text-lg">info</span>
              Lý do hủy đơn hàng:
            </h4>
            <p className="text-sm text-red-700 mt-1 italic">
              "{orderDetails.cancellationReason}"
            </p>
          </div>
        )}
      </section>

      {/* InfoGrid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Customer Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-purpose="customer-info">
          <h2 className="text-lg font-bold mb-4 border-b border-slate-100 pb-2">Thông tin khách hàng</h2>
          <div className="space-y-3">
            <div className="flex">
              <span className="w-32 text-slate-500 text-sm font-medium">Họ và tên:</span>
              <span className="text-sm font-semibold text-slate-800">{orderDetails.user?.name || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 text-sm font-medium">Số điện thoại:</span>
              <span className="text-sm font-semibold text-slate-800">{orderDetails.shippingInfo?.phoneNo || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 text-sm font-medium">Email:</span>
              <span className="text-sm font-semibold text-slate-800">{orderDetails.user?.email || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 text-sm font-medium">Địa chỉ:</span>
              <span className="text-sm font-semibold text-slate-800">
                {`${orderDetails.shippingInfo?.address}, ${orderDetails.shippingInfo?.ward}, ${orderDetails.shippingInfo?.district}, ${orderDetails.shippingInfo?.province}`}
              </span>
            </div>
          </div>
        </section>

        {/* Logistics Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-purpose="logistics-info">
          <h2 className="text-lg font-bold mb-4 border-b border-slate-100 pb-2">Phương thức &amp; Thanh toán</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hình thức thanh toán</h3>
              <div className="flex items-center p-3 border border-slate-100 rounded-lg bg-slate-50">
                <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {orderDetails.paymentInfo && orderDetails.paymentInfo.method === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Thẻ Tín Dụng / Ghi Nợ"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Trạng thái: {orderDetails.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Đơn vị vận chuyển</h3>
              <div className="flex items-center p-3 border border-slate-100 rounded-lg bg-slate-50">
                <svg className="h-6 w-6 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Giao hàng tiêu chuẩn</p>
                  <p className="text-xs text-slate-500">
                    Phí vận chuyển: {orderDetails.shippingPrice ? formatVND(orderDetails.shippingPrice) : 'Miễn phí'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* OrderItemsTable */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8" data-purpose="items-list">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold">Danh sách sản phẩm</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Đơn giá</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Số lượng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orderDetails.orderItems?.map((item) => (
                <tr key={item.product}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                        <img 
                          alt={item.name} 
                          className="h-full w-full object-cover object-center" 
                          // Nếu link là example.com (hỏng CORS), tự động đổi sang ảnh xịn chuẩn CORS
                          src={item.image && item.image.includes('example.com') ? SAFE_PLACEHOLDER_IMAGE : (item.image || SAFE_PLACEHOLDER_IMAGE)} 
                          crossOrigin="anonymous"
                          onError={(e) => { e.target.src = SAFE_PLACEHOLDER_IMAGE; }}
                        />
                      </div>
                      <div className="ml-4">
                        <Link to={`/product/${item.product}`} className="text-sm font-bold text-slate-800 hover-link-slide transition-colors">
                            {item.name}
                        </Link>
                        {(item.size || item.color) && (
                          <div className="flex gap-2 mt-1 text-xs text-slate-500 uppercase tracking-tight">
                            {item.size && <span>Size: <span className="font-semibold text-slate-700">{item.size}</span></span>}
                            {item.color && <span>Màu: <span className="font-semibold text-slate-700">{item.color}</span></span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">
                    {formatVND(item.price)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">{item.quantity}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                    {formatVND(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* OrderSummary */}
      <section className="flex justify-end" data-purpose="order-totals">
        <div className="w-full md:w-80 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Tổng cộng</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tạm tính</span>
              <span className="font-medium text-slate-800">{formatVND(orderDetails.itemPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Phí vận chuyển</span>
              <span className="font-medium text-slate-800">{formatVND(orderDetails.shippingPrice)}</span>
            </div>
            {orderDetails.taxPrice !== undefined && orderDetails.taxPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Thuế (Tax)</span>
                <span className="font-medium text-slate-800">{formatVND(orderDetails.taxPrice)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Tổng tiền</span>
              <span className="text-xl font-extrabold text-blue-600">
                {formatVND(orderDetails.totalPrice)}
              </span>
            </div>
          </div>
          {/* Action Button */}
          {user && (user?.role_id?.name || user?.role) === 'admin' && (
            <button className="no-print mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover-btn-gradient transition-colors shadow-md flex items-center justify-center" onClick={exportToPDF}>
              <span className="material-symbols-outlined mr-2">picture_as_pdf</span>
              Xuất PDF (Biên nhận)
            </button>
          )}
        </div>
      </section>

      
    </main>
  );
};

export default OrderDetails;
