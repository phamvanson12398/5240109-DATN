/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component "Menu Người dùng Nhanh" (User Navigation Dashboard / Mini Profile).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Hiển thị ảnh đại diện và tên người dùng ngay trên Thanh công cụ (Navbar).
 *    - Cung cấp Menu xả xuống (Dropdown) chứa các lối tắt quan trọng: Quản lý đơn hàng, Hồ sơ, Giỏ hàng và Đăng xuất.
 *    - Tự động phân quyền: Nếu là Admin, sẽ có thêm nút dẫn tới trang Quản trị (Admin Dashboard).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Điều phối Người dùng (User Navigation & Auth Actions Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Unwrapping Promises: Sử dụng `dispatch(logout()).unwrap()` để xử lý logic "Clean up" và "Navigate" ngay sau khi hành động logout bất đồng bộ hoàn tất thành công.
 *    - Overlay Tech: Kỹ thuật sử dụng một lớp phủ trong suốt (`.overlay`) để bắt sự kiện click ra ngoài, giúp đóng menu một cách tự nhiên.
 *    - Dynamic Menu Generation: Cách sử dụng mảng `options` kết hợp lệnh `unshift()` để xây dựng danh sách nút bấm linh hoạt theo vai trò người dùng (User vs Admin).
 *    - Redux State Subscription: Theo dõi `cartItems.length` để cập nhật con số hiển thị trên nút "Giỏ hàng" ngay tức thì.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Prop `user` (dữ liệu người dùng hiện tại).
 *    - Output: Giao diện chuyển đổi trạng thái (Toggle Menu) và các lệnh chuyển trang (Navigate).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `menuVisible`: Biến Boolean điều khiển việc hiện/ẩn danh sách các nút chức năng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `logoutUser`: Thực hiện dọn dẹp phiên làm việc, xóa Token và đưa người dùng về trang Đăng nhập.
 *    - `toggleMennu`: Hàm đảo trạng thái hiển thị của Dropdown.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng di chuột/click vào ảnh Avatar -> `menuVisible` thành `true`.
 *    - Bước 2: Menu hiện lên liệt kê các lựa chọn phù hợp với phân quyền.
 *    - Bước 3: Người dùng chọn một mục (VD: Orders) -> Kích hoạt hàm điều hướng `navigate`.
 *    - Bước 4: Click vào vùng trống bên ngoài -> Lớp phủ `overlay` bắt sự kiện để đóng menu.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> Logout Action -> API /api/v1/logout -> Server xóa Cookie/Session -> Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - `location.pathname.startsWith('/admin')`: Tự động ẩn Component này nếu đang ở trong vùng quản trị để tránh xung đột giao diện.
 *    - Admin Check: `if (user.role === 'admin')` để quyết định có hiện nút quản trị hay không.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Tiến trình `logoutUser` là bất đồng bộ quan trọng nhất trong file này.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - "Rules of Hooks": Lưu ý dòng comment "ALL HOOKS must be called BEFORE any conditional return". Đây là nguyên tắc vàng của React để tránh lỗi Hooks nhảy lung tung khi render.
 *    - `cart-not-empty`: Class đặc biệt dùng để làm nổi bật nút Giỏ hàng khi có đồ bên trong.
 */
import React, { useState } from 'react'
import '@/features/user/styles/UserDashboard.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout, removeErrors } from '@/features/user/userSlice'
import { toast } from 'react-toastify'

function UserDashboard({ user }) {

    const { cartItems } = useSelector(state => state.cart)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // ALL HOOKS must be called BEFORE any conditional return (Rules of Hooks)
    const [menuVisible, setMenuVisible] = useState(false);

    // Guard: hide UserDashboard on admin pages (AFTER all hooks)
    if (location.pathname.startsWith('/admin')) return null;

    function toggleMennu() {
        setMenuVisible(!menuVisible);
    }

    const options = [
        { name: 'Đơn hàng', funcName: orders },
        { name: 'Tài khoản', funcName: profile },
        { name: `Giỏ hàng (${cartItems.length})`, funcName: myCart, isCart: true },
        { name: 'Đăng xuất', funcName: logoutUser },
    ]
    const userRole = user?.role_id?.name || user?.role;
    if (userRole === 'admin') {
        options.unshift({
            name: 'Trang quản trị', funcName: dashboard
        })
    }
    function orders() {
        navigate("/orders/user")
    }
    function profile() {
        navigate("/profile")

    }
    function myCart() {
        navigate("/cart")
    }
    function logoutUser() {
        dispatch(logout())
            .unwrap()
            .then(() => {
                toast.success("Đăng xuất thành công", { position: 'top-center', autoClose: 3000 })
                dispatch(removeErrors())
                navigate('/login')
            })
            .catch((error) => {
                toast.error(error.message || 'Đăng xuất thất bại', { position: 'top-center', autoClode: 3000 })
            })

    }
    function dashboard() {
        navigate("/admin/dashboard")
    }
    return (

        <>
            <div className={`overlay ${menuVisible ? 'show' : ''}`} onClick={toggleMennu}>


            </div>

            <div className="dashboard-container">
                <div className="profile-header" onClick={toggleMennu}>
                    <img src={user.avatar.url ? user.avatar.url : 'images/profile.png'}
                        alt="Ảnh đại diện"
                        className='profile-avatar'
                        style={{ width: '36px', height: '36px' }}
                    />

                    <span className="profile-name">{user.name || 'Người dùng'}</span>

                    {menuVisible && (
                        // phần menu tùy chọn
                        <div className="menu-options">
                            {options.map((item) => {
                                const isCartNotEmpty = item.isCart && (cartItems?.length ?? 0) > 0;

                                return (
                                    <button
                                        key={item.name}
                                        onClick={item.funcName}
                                        className={`menu-option-btn ${isCartNotEmpty ? " cart-not-empty" : ""}`}
                                        type="button"
                                    >
                                        {item.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>


    )
}

export default UserDashboard
