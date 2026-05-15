/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang Xử lý Thanh toán Độc lập (Standalone Payment Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp giao diện thanh toán tinh gọn, tập trung hoàn toàn vào việc thực thi lệnh (Action).
 *    - Cho phép người dùng chọn nhanh giữa "Thanh toán khi nhận hàng (COD)" và "Thanh toán điện tử (VNPAY)".
 *    - Đóng vai trò là "chốt chặn cuối cùng" để dọn dẹp giỏ hàng (LocalStorage/Session) sau khi đặt hàng thành công.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Thanh toán & Đặt hàng (Checkout Flow) - Giai đoạn Thực thi.
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `useMemo`: Một kỹ thuật tối ưu quan trọng. Nó tính toán lại các con số tài chính (Giá hàng, Thuế, Ship) và ghi nhớ kết quả, chỉ tính lại khi Giỏ hàng thay đổi, giúp UI mượt mà hơn.
 *    - Direct API Integration: Sử dụng Axios gọi trực tiếp đến Backend thay vì thông qua Redux Global Action. Cách này giúp xử lý các phản hồi nhạy cảm (như Payment URL) một cách tức thời và dễ kiểm soát lỗi (Try/Catch) hơn.
 *    - Payload Formatting: Kỹ thuật "xây dựng" lại cấu trúc dữ liệu (`orderPayload`) từ nhiều nguồn (Redux + Session + Local) để khớp hoàn toàn với Schema của Mongoose ở phía Backend.
 *    - Manual Redirect: Sử dụng `window.location.href` để thực hiện cú "nhảy" sang các hệ thống thanh toán của Ngân hàng.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin tài chính từ SessionStorage và Danh sách sản phẩm từ Redux.
 *    - Output: Một yêu cầu tạo đơn hàng gửi tới Database và chuyển hướng trang.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `loading`: State boolean để ngăn chặn việc người dùng nhấn nút "Thanh toán" nhiều lần liên tục (Double submission).
 *    - `error`: Lưu trữ chuỗi thông báo lỗi trả về từ API (ví dụ: "Sản phẩm đã hết hàng").
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `placeOrderCOD`: Logic xử lý dành riêng cho đơn hàng trả tiền mặt.
 *    - `placeOrderVnpay`: Logic xử lý phức tạp hơn, bao gồm việc tạo đơn hàng tạm và lấy Link từ cổng VNPay.
 *    - `totals`: Biến tính toán tổng hợp sử dụng `useMemo`.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng truy cập trang -> UI tính toán lại số tiền lần cuối.
 *    - Bước 2: Nhấn nút thanh toán -> Bật hiệu ứng Loading.
 *    - Bước 3: Gửi dữ liệu đơn hàng tới `/api/v1/order/new`.
 *    - Bước 4: Nếu thành công -> Dọn dẹp `localStorage.removeItem("cartItems")` -> Chuyển sang trang Success kèm ID đơn hàng.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI (Axios) -> POST Request -> API Controller -> MongoDB.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - `setError`: Hiển thị thông báo lỗi ngay trên giao diện nếu Backend báo lỗi xác thực hoặc hết hàng.
 *    - `disabled={loading}`: Vô hiệu hóa nút nhấn khi đang xử lý để đảm bảo tính toàn vẹn của giao dịch.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Các lời gọi hàm `placeOrderCOD` và `placeOrderVnpay` là các tác vụ bất đồng bộ tiêu biểu.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý hàm `getItemImage`: Đây là một hàm helper "phòng thủ", giúp lấy ảnh sản phẩm từ nhiều cấu trúc dữ liệu khác nhau mà không làm ứng dụng bị crash.
 *    - Trình tự dọn dẹp: Việc xóa giỏ hàng chỉ nên thực hiện SAU KHI API trả về kết quả thành công (`data.success`).
 */
import React, { useMemo, useState } from "react";
import "@/features/checkout/styles/Payment.css";
import PageTitle from "@/shared/components/PageTitle";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import CheckoutPath from "@/features/checkout/components/CheckoutPath";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "@/shared/api/http.js";
import { formatVND } from "@/shared/utils/formatCurrency";

function Payment() {
  const navigate = useNavigate();
  const { shippingInfo, cartItems = [] } = useSelector((state) => state.cart);

  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo") || "{}");

  const shippingInfoPayload = {
    address: shippingInfo?.address || "",
    city: shippingInfo?.city || shippingInfo?.provinceName || "",
    state: shippingInfo?.state || shippingInfo?.districtName || "",
    ward: shippingInfo?.ward || shippingInfo?.wardName || "",
    country: shippingInfo?.country || "Việt Nam",
    pinCode: Number(shippingInfo?.pinCode || 0),
    phoneNo: Number(shippingInfo?.phoneNo || shippingInfo?.phoneNumber || 0),
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    if (orderInfo && typeof orderInfo.total === "number") {
      return {
        itemPrice: orderInfo.subtotal ?? orderInfo.itemPrice ?? 0,
        taxPrice: orderInfo.tax ?? orderInfo.taxPrice ?? 0,
        shippingPrice: orderInfo.shippingCharges ?? orderInfo.shippingPrice ?? 0,
        totalPrice: orderInfo.total ?? orderInfo.totalPrice ?? 0,
      };
    }

    const itemPrice = cartItems.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    );
    const taxPrice = itemPrice * 0.1;
    const shippingPrice = itemPrice >= 500000 ? 0 : 30000;
    const totalPrice = itemPrice + taxPrice + shippingPrice;
    return { itemPrice, taxPrice, shippingPrice, totalPrice };
  }, [orderInfo, cartItems]);

  const getItemImage = (item) =>
    item?.image || item?.images?.[0]?.url || item?.images?.[0] || item?.thumbnail || "";

  const placeOrderVnpay = async () => {
    setError("");
    if (!shippingInfoPayload.address || !shippingInfoPayload.city || !shippingInfoPayload.state) {
      setError("Thiếu thông tin giao hàng (địa chỉ/tỉnh/quận).");
      return;
    }
    if (cartItems.length === 0) {
      setError("Giỏ hàng trống.");
      return;
    }

    setLoading(true);
    try {
      // 1. Tạo đơn hàng PENDING với method VNPAY
      const orderPayload = {
        shippingInfo: shippingInfoPayload,
        orderItems: cartItems.map((item) => ({
          name: item.name,
          price: String(item.price),
          quantity: item.quantity,
          image: getItemImage(item),
          product: item.product || item._id,
          product_id: item.product_id || item.product || item._id,
          pricingType: item.pricingType,
          flashSaleId: item.flashSaleId,
          flashSaleItemId: item.flashSaleItemId,
        })),
        itemPrice: totals.itemPrice,
        taxPrice: totals.taxPrice,
        shippingPrice: totals.shippingPrice,
        totalPrice: totals.totalPrice,
        paymentMethod: "VNPAY"
      };

      const { data: orderData } = await axios.post("/api/v1/order/new", orderPayload, {
        withCredentials: true,
      });

      const orderId = orderData?.orderId || orderData?.order?._id;
      if (!orderId) throw new Error("Không lấy được ID đơn hàng");

      // 2. Gọi API tạo link thanh toán VNPay
      const { data: paymentData } = await axios.post("/api/v1/payment/vnpay/create", {
        amount: totals.totalPrice,
        orderId: orderId,
        orderDescription: `Thanh toan don hang ${orderId}`
      }, {
        withCredentials: true,
      });

      if (paymentData.success && paymentData.paymentUrl) {
         // Dọn dữ liệu trước khi redirect
         sessionStorage.removeItem("orderInfo");
         localStorage.removeItem("cartItems");
         
         // Chuyển hướng sang VNPay
         window.location.href = paymentData.paymentUrl;
      } else {
        setError("Lỗi khi tạo liên kết thanh toán VNPay");
      }

    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi xử lý VNPay";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const placeOrderCOD = async () => {

    setError("");

    // check tối thiểu
    if (!shippingInfoPayload.address || !shippingInfoPayload.city || !shippingInfoPayload.state) {
      setError("Thiếu thông tin giao hàng (địa chỉ/tỉnh/quận).");
      return;
    }
    if (cartItems.length === 0) {
      setError("Giỏ hàng trống.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        shippingInfo: shippingInfoPayload,
        orderItems: cartItems.map((item) => ({
          name: item.name,
          price: String(item.price),
          quantity: item.quantity,
          image: getItemImage(item),
          product: item.product || item._id,
          product_id: item.product_id || item.product || item._id,
          pricingType: item.pricingType,
          flashSaleId: item.flashSaleId,
          flashSaleItemId: item.flashSaleItemId,
        })),
        itemPrice: totals.itemPrice,
        taxPrice: totals.taxPrice,
        shippingPrice: totals.shippingPrice,
        totalPrice: totals.totalPrice,
      };

      const { data } = await axios.post("/api/v1/order/new", payload, {
        withCredentials: true,
      });

      // ✅ lấy orderId từ response (2 kiểu đều hỗ trợ)
      const orderId = data?.orderId || data?.order?._id;

      // dọn dữ liệu
      sessionStorage.removeItem("orderInfo");
      localStorage.removeItem("cartItems");

      // ✅ điều hướng sang trang success để hiện mã đơn
      if (!orderId) {
        console.log("Create order response (missing orderId):", data);
        navigate("/orders/user");
        return;
      }

      navigate(`/order/success?orderId=${orderId}`);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Đặt hàng thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const displayTotal = typeof orderInfo?.total === "number" ? orderInfo.total : totals.totalPrice;

  return (
    <>
      <PageTitle title="Thanh toán" />
      <Navbar />
      <CheckoutPath activePath={2} />

      <div className="payment-container">
        <Link to="/order/confirm" className="payment-go-back hover-link-slide">
          Quay lại
        </Link>

        {error ? <p style={{ color: "red", marginTop: 10 }}>{error}</p> : null}

        <button className="payment-btn hover-btn-gradient" onClick={placeOrderCOD} disabled={loading}>
          {loading ? "Đang tạo đơn..." : `Thanh toán khi nhận hàng (${formatVND(displayTotal)})`}
        </button>

        <button 
          className="payment-btn hover-btn-gradient" 
          style={{ marginTop: '15px', background: 'linear-gradient(to right, #e61937, #f7d01b)', color: '#fff' }}
          onClick={() => placeOrderVnpay()} 
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : `Thanh toán qua VNPay (${formatVND(displayTotal)})`}
        </button>
      </div>


      <Footer />
    </>
  );
}

export default Payment;
