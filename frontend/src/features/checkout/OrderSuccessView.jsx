/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Thông báo Đặt hàng Thành công (Order Success Popup/Modal).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "điểm kết thúc" huy hoàng của luồng mua hàng, tạo cảm giác an tâm và thỏa mãn cho khách hàng sau khi tiêu tiền.
 *    - Xác nhận chính xác Đơn hàng đã được ghi nhận trong hệ thống bằng cách hiển thị mã đơn hàng (ID).
 *    - Điều hướng người dùng về trang "Lịch sử đơn hàng" để họ tiếp tục theo dõi trạng thái vận chuyển.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Thanh toán & Đặt hàng (Checkout Flow) - Giai đoạn Hoàn tất (Completion Phase).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Modal/Overlay Pattern: Sử dụng một lớp "Backdrop" mờ để khóa tương tác với trang chính, buộc người dùng tập trung vào thông điệp thành công.
 *    - Backdrop Click Closure: Một kỹ thuật UX tinh tế, cho phép đóng Modal bằng cách click vào vùng trống xung quanh hộp thông báo (thông qua kiểm tra `e.target.className`).
 *    - String Manipulation: Sử dụng hàm `.slice(-6)` để chỉ hiển thị 6 ký tự cuối của mã ID đơn hàng. Điều này giúp mã trông gọn gàng, bí ẩn và "pro" hơn so với một dãy ID dài dằng dặc của MongoDB.
 *    - Component Reuse: Được thiết kế để có thể hiển thị từ nhiều trang khác nhau (như từ trang Checkout chính hoặc trang Kết quả thanh toán Online).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: `orderId` (Mã đơn hàng từ Backend) và hàm `onClose` (Hành động khi đóng popup).
 *    - Output: Giao diện chúc mừng trực quan và hành động điều hướng trang.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Props `orderId`: Chìa khóa để người dùng đối chiếu đơn hàng sau này.
 *    - Props `onClose`: Liên kết ngược lại với Parent Component để thông báo rằng "Tôi đã xong nhiệm vụ hiển thị".
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `goToOrders`: Hàm "2 trong 1", vừa dọn dẹp Popup vừa đưa người dùng tới nơi quản lý đơn hàng.
 *    - `handleBackdropClick`: Logic ngăn chặn sự kiện "nổi bọt" (Event Bubbling) để việc đóng Modal diễn ra chính xác.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Sau khi API đặt hàng thành công, Component cha gán ID và bật Popup này lên.
 *    - Bước 2: Popup render đè lên màn hình với hiệu ứng icon Checkmark.
 *    - Bước 3: Người dùng đọc thông báo và mã đơn hàng.
 *    - Bước 4: Nhấn "Đi tới đơn hàng" -> Popup biến mất -> Trang lịch sử đơn hàng hiện ra.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - File này không trực tiếp gọi API, nó chỉ tiêu thụ kết quả (Response) từ các bước trước đó.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Fallback UI: Nếu lỡ mã `orderId` bị trống (lỗi hi hữu), nó sẽ hiển thị dòng chữ "Xem tại trang Đơn hàng" thay vì để trống ngoác, giúp giữ vững sự chuyên nghiệp.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có xử lý bất đồng bộ trực tiếp bên trong file.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - CSS Class `os-backdrop` và `os-popup`: Cần chú ý độ phân cấp `z-index` để đảm bảo Popup luôn nằm trên cùng của website, kể cả trên Navbar hay Footer.
 *    - Tính nhất quán: Tiêu đề và thông điệp được quản lý qua `defaultConfig`, dễ dàng cho việc quốc tế hóa (I18n) sau này.
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import "@/features/checkout/styles/OrderSuccess.css";

const defaultConfig = {
  success_title: "Đặt hàng thành công",
  success_message:
    "Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất!",
  button_text: "Đi tới trang Đơn đặt hàng",
};

/**
 * OrderSuccess - Popup xác nhận đặt hàng thành công
 * 
 * @param {string} orderId - Mã đơn hàng từ server
 * @param {function} onClose - Callback khi đóng popup
 */
function OrderSuccess({ orderId, onClose }) {
  const navigate = useNavigate();

  const goToOrders = () => {
    if (onClose) {
      onClose(); // Đóng popup
    }
    navigate("/orders/user");
  };

  const handleBackdropClick = (e) => {
    // Chỉ đóng khi click vào backdrop, không phải popup content
    if (e.target.className === 'os-backdrop') {
      if (onClose) onClose();
    }
  };

  return (
    <div className="os-backdrop" onClick={handleBackdropClick}>
      <div className="os-popup">
        <button
          className="os-close hover-icon-btn"
          type="button"
          aria-label="Đóng"
          onClick={onClose}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="os-checkwrap">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            className="os-checkicon"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="os-title">{defaultConfig.success_title}</h1>

        <p className="os-message">{defaultConfig.success_message}</p>

        <p className="os-orderid">
          Mã đơn hàng: <strong>{orderId ? `#${orderId.slice(-6)}` : "Xem tại trang Đơn hàng"}</strong>
        </p>

        <button className="os-btn hover-btn-gradient" type="button" onClick={goToOrders}>
          {defaultConfig.button_text}
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;
