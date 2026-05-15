/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang kết quả thanh toán VNPAY (VNPAY Result Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Điểm tiếp nhận phản hồi (Callback URL) sau khi người dùng thực hiện thanh toán trên cổng VNPAY.
 *    - Giải mã mã phản hồi (`vnp_ResponseCode`) để thông báo cho khách hàng biết giao dịch có thành công hay không.
 *    - Đồng bộ hóa trạng thái ứng dụng: Làm mới giỏ hàng (refetch) và dọn dẹp các dữ liệu tạm thời (Session Storage) sau khi mua hàng thành công.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Thanh toán (Payment Flow) - Giai đoạn cuối cùng.
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `useSearchParams`: Hook của React Router dùng để bóc tách các tham số phức tạp mà VNPAY gửi về trên URL (ví dụ: mã giao dịch, số tiền, mã phản hồi).
 *    - Status Code Mapping: Kỹ thuật tra cứu từ điển (Dictionary) để chuyển đổi các mã số khô khan (00, 24, 51...) thành thông báo Tiếng Việt thân thiện.
 *    - State Synchronization: Phối hợp giữa `useEffect` và Redux để đảm bảo khi khách hàng quay lại web, giỏ hàng của họ đã được tự động dọn sạch món hàng vừa mua.
 *    - Session Storage Cleanup: Dọn dẹp "rác" dữ liệu tạm để tránh xung đột cho các đơn hàng tiếp theo.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Các tham số Query String từ VNPAY.
 *    - Output: Giao diện thông báo trạng thái (Thành công/Thất bại) và các nút điều hướng (Xem đơn hàng/Về trang chủ).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `orderId`: Mã đơn hàng được lấy từ URL để hiển thị cho khách đối chiếu.
 *    - `responseCode`: Mã trạng thái giao dịch từ VNPAY.
 *    - `isSuccess`: Biến cờ (flag) xác định nhanh giao dịch thành công (mã 00).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `getVnpayMessage`: Hàm "phiên dịch" mã lỗi VNPAY sang ngôn ngữ người dùng.
 *    - `useEffect`: Nơi xử lý các tác vụ "dọn dẹp" (Side Effects) quan trọng ngay sau khi khách quay lại website.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: VNPAY Redirect người dùng về URL này kèm theo các mã kết quả.
 *    - Bước 2: Component đọc mã -> Xác định `isSuccess`.
 *    - Bước 3: Nếu thành công -> Dispatch `fetchCart()` để Backend trả về giỏ hàng mới (đã xóa món đã mua).
 *    - Bước 4: Xóa triệt để các dữ liệu tạm trong `sessionStorage`.
 *    - Bước 5: Render UI tương ứng (Màu xanh: Vui vẻ / Màu đỏ: Cảnh báo).
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Luồng này chủ yếu nhận dữ liệu (GET Params) và gửi 1 yêu cầu `fetchCart` để đồng bộ UI.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Validation: Chỉ tiến hành dọn dẹp giỏ hàng nếu `isAuthenticated` là true và `userId` đã sẵn sàng.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Quá trình gọi `dispatch(fetchCart())` để lấy lại giỏ hàng là bất đồng bộ.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `orderId` và `vnp_ResponseCode` là hai thông tin quan trọng nhất để đối soát giao dịch.
 *    - Việc dọn dẹp Session Storage là bắt buộc để tránh tình trạng khách hàng bấm "Thanh toán lại" mà vẫn dính dữ liệu đơn hàng cũ.
 */
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeOrderedItems } from '@/features/cart/cartSlice';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import '@/features/checkout/styles/PaymentSuccess.css';

const VnpayResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const orderId = searchParams.get('orderId');
    const responseCode = searchParams.get('vnp_ResponseCode');
    const isSuccess = responseCode === '00';

    const getVnpayMessage = (code) => {
        const messages = {
            '00': 'Thanh toán thành công. Cảm ơn quý khách!',
            '07': 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ (Phân loại vào danh sách chờ xác nhận).',
            '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
            '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
            '11': 'Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.',
            '12': 'Thẻ/Tài khoản của khách hàng bị khóa.',
            '24': 'Bạn đã hủy quá trình thanh toán.',
            '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
            '65': 'Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.',
            '75': 'Ngân hàng thanh toán đang bảo trì.',
            '79': 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.',
            '97': 'Chữ ký không hợp lệ (Signature invalid).',
        };
        return messages[code] || 'Giao dịch không thành công. Đã có lỗi xảy ra.';
    };

    const { userId } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.user);

    useEffect(() => {
        // Only clear cart when:
        // 1. Payment succeeded (isSuccess)
        // 2. User is authenticated
        // 3. UserId in cart is synced (userId !== null)
        if (isSuccess && isAuthenticated && userId !== null) {
            // Step 1: Remove ordered items from Redux state + LocalStorage
            const vnpayOrderedItems = sessionStorage.getItem('vnpayOrderedItems');
            if (vnpayOrderedItems) {
                try {
                    const orderedItems = JSON.parse(vnpayOrderedItems);
                    dispatch(removeOrderedItems(orderedItems));
                } catch (e) {
                    console.error('Error parsing vnpayOrderedItems:', e);
                }
            }

            // Step 2: Fetch fresh cart from Backend (backend also cleaned up)
            dispatch(fetchCart());
            
            // Step 3: Clean up all temp session data
            sessionStorage.removeItem('vnpayOrderedItems');
            sessionStorage.removeItem("directBuyItem");
            sessionStorage.removeItem("selectedOrderItems");
            sessionStorage.removeItem("orderInfo");
            sessionStorage.removeItem("paymentMethod");
        }
    }, [isSuccess, isAuthenticated, userId, dispatch]);

    return (
        <>
            <Navbar />
            <div className="payment-success-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ background: '#fff', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '0 auto' }}>
                    {isSuccess ? (
                        <>
                            <div style={{ fontSize: '60px', color: '#2ecc71', marginBottom: '20px' }}>✅</div>
                            <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Thanh toán thành công!</h2>
                            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
                                {getVnpayMessage(responseCode)} <br/>
                                Đơn hàng <strong>#{orderId}</strong> của bạn đang được xử lý.
                            </p>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '60px', color: '#e74c3c', marginBottom: '20px' }}>❌</div>
                            <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Thanh toán chưa hoàn tất</h2>
                            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
                                {getVnpayMessage(responseCode)}
                            </p>
                        </>
                    )}
                    
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button 
                            onClick={() => navigate('/orders/user')}
                            style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#3498db', color: '#fff', cursor: 'pointer' }}
                        >
                            Xem đơn hàng
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            style={{ padding: '10px 20px', borderRadius: '5px', border: '1px solid #3498db', background: 'transparent', color: '#3498db', cursor: 'pointer' }}
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VnpayResult;
