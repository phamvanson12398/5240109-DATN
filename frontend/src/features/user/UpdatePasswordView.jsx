/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang Đổi mật khẩu (Update Password Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp giao diện bảo mật cho phép người dùng thay đổi mật khẩu truy cập.
 *    - Yêu cầu xác thực 3 lớp nghiêm ngặt: Mật khẩu cũ (để xác minh chính chủ), Mật khẩu mới và Nhập lại mật khẩu mới.
 *    - Giúp nâng cao tính bảo mật cho tài khoản người dùng trong dự án E-commerce.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Bảo mật Tài khoản (Account Security Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - State Management (useState): Quản lý 3 trạng thái độc lập cho 3 ô nhập mật khẩu để dễ dàng kiểm soát và validate.
 *    - Redux Integration: Sử dụng `useSelector` để lắng nghe trạng thái "Loading/Success/Error" từ Store nhằm đồng bộ hóa UI với kết quả từ Server.
 *    - Toast Notifications: Hiển thị thông báo trạng thái (Xanh cho thành công, Đỏ cho lỗi) giúp người dùng biết chuyện gì đang xảy ra mà không cần load lại trang.
 *    - Programmatic Navigation: Tự động điều hướng người dùng về trang Hồ sơ (`/profile`) ngay sau khi đổi mật khẩu thành công bằng `useNavigate`.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: 3 chuỗi ký tự mật khẩu từ Form.
 *    - Output: Một yêu cầu cập nhật mật khẩu gửi đến Backend và phản hồi trạng thái.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `oldPassword`, `newPassword`, `confirmPassword`: Bộ 3 state cục bộ quản lý các ô nhập liệu (Controlled Inputs).
 *    - `loading`, `success`, `error`: Bộ 3 state từ Redux điều khiển luồng hiển thị.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `updatePasswordSubmit`: Hàm xử lý khi người dùng nhấn nút "Cập nhật". Nó đóng gói dữ liệu và kích hoạt Logic đổi mật khẩu của Redux.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng nhập đầy đủ 3 trường mật khẩu.
 *    - Bước 2: Nhấn nút "Cập nhật mật khẩu" -> `updatePasswordSubmit` chạy.
 *    - Bước 3: Redux Thunk gửi mật khẩu cũ và mới lên Server.
 *    - Bước 4: Server kiểm tra mật khẩu cũ đúng/sai -> Trả về kết quả.
 *    - Bước 5: Nếu thành công -> Hiện Toast xanh -> Điều hướng về `/profile`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> PUT Request -> API Endpoint -> Backend (Bcrypt compare & hash) -> MongoDB Update -> Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - `type="password"`: Đảm bảo tính riêng tư, không hiện mật khẩu lên màn hình.
 *    - `loading ? <Loader /> : Form`: Ẩn form và hiện vòng xoay tải trang để tránh người dùng nhấn nút nhiều lần.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Hành động `dispatch(updatePassword(myForm))` là một tác vụ bất đồng bộ (Network Call).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `dispatch(removeSuccess())` và `dispatch(removeErrors())`: Phải thực hiện lệnh này để "xóa dấu vết" trạng thái cũ trong Redux, tránh việc lần sau vào trang bị tự động hiện thông báo thành công hoặc lỗi từ trước đó.
 *    - `encType='multipart/form-data'`: Mặc dù ở đây chủ yếu là text nhưng việc dùng FormData đồng bộ với các trang User khác giúp code format trở nên nhất quán.
 */
import React, { useEffect, useState } from 'react'
import Footer from '@/shared/components/Footer'
import Navbar from '@/shared/components/Navbar'
import PageTitle from '@/shared/components/PageTitle'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { removeErrors, removeSuccess, updatePassword } from '@/features/user/userSlice'
import { toast } from 'react-toastify'
import Loader from '@/shared/components/Loader'

function UpdatePasswordView() {
    const { success, error, loading } = useSelector(state => state.user)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [oldPassword, setOldPassWord] = useState("")
    const [newPassword, setNewPassWord] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // Toggle visibility for each password field
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const updatePasswordSubmit = (e) => {
        e.preventDefault();
        const myForm = new FormData();
        myForm.set("oldPassword", oldPassword)
        myForm.set("newPassword", newPassword)
        myForm.set("confirmPassword", confirmPassword)
        for (let pair of myForm.entries()) {
            console.log(pair[0] + ':' + pair[1]);
        }
        dispatch(updatePassword(myForm))
    }

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'top-center', autoClose: 3000 })
            dispatch(removeErrors())
        }
    }, [dispatch, error])

    useEffect(() => {
        if (success) {
            toast.success("Cập nhật mật khẩu thành công"), { position: 'top-center', autoClose: 3000 }
            dispatch(removeSuccess())
            navigate("/profile")
        }
    }, [dispatch, success, navigate])

    // Validation indicators
    const isNewPasswordValid = newPassword.length >= 6
    const isPasswordMatch = confirmPassword.length > 0 && newPassword === confirmPassword

    return (
        <>
            {loading ? (<Loader />) : (
                <>
                    <Navbar />
                    <PageTitle title="Cập nhật mật khẩu" />

                    <main
                        className="flex-grow flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden"
                        style={{
                            minHeight: '100vh',
                            background: '#ffffff',
                            fontFamily: "'Manrope', sans-serif"
                        }}
                    >
                        {/* Abstract Background Decoration */}
                        <div className="absolute top-1/4 -right-20 w-96 h-96 opacity-[0.04] pointer-events-none">
                            <svg viewBox="0 0 400 400" fill="none">
                                <circle cx="200" cy="200" r="180" stroke="#702e36" strokeWidth="1" />
                                <circle cx="200" cy="200" r="140" stroke="#702e36" strokeWidth="0.5" />
                                <circle cx="200" cy="200" r="100" stroke="#702e36" strokeWidth="0.3" />
                                <path d="M200 20 L200 380 M20 200 L380 200" stroke="#702e36" strokeWidth="0.3" />
                            </svg>
                        </div>
                        <div className="absolute bottom-10 -left-16 w-72 h-72 opacity-[0.03] pointer-events-none">
                            <svg viewBox="0 0 300 300" fill="none">
                                <rect x="50" y="50" width="200" height="200" rx="20" stroke="#702e36" strokeWidth="1" />
                                <rect x="80" y="80" width="140" height="140" rx="14" stroke="#702e36" strokeWidth="0.5" />
                            </svg>
                        </div>

                        <div className="w-full max-w-[450px] space-y-8 relative z-10">
                            {/* Header Section */}
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <h1
                                        className="text-3xl font-extrabold tracking-tight"
                                        style={{ color: '#1a1a1a' }}
                                    >
                                        Cập nhật mật khẩu
                                    </h1>
                                </div>
                                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                                    Bảo vệ tài khoản của bạn bằng mật khẩu mạnh
                                </p>
                            </div>

                            {/* Main Card */}
                            <div
                                className="rounded-xl p-8"
                                style={{
                                    background: '#fafafa',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 20px 60px -15px rgba(0,0,0,0.08)'
                                }}
                            >
                                <form
                                    className="space-y-6"
                                    encType='multipart/form-data'
                                    onSubmit={updatePasswordSubmit}
                                >
                                    {/* Current Password */}
                                    <div className="space-y-2">
                                        <label
                                            className="text-xs font-bold tracking-wider uppercase ml-1"
                                            style={{ color: '#6b7280' }}
                                        >
                                            Mật khẩu hiện tại
                                        </label>
                                        <div
                                            className="relative flex items-center rounded-xl group transition-all"
                                            style={{
                                                background: '#ffffff',
                                                border: '1.5px solid #e5e7eb',
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(112, 46, 54, 0.5)'
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(112, 46, 54, 0.1)'
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb'
                                                e.currentTarget.style.boxShadow = 'none'
                                            }}
                                        >
                                            <span
                                                className="material-symbols-outlined absolute left-4 transition-colors"
                                                style={{ color: '#9ca3af' }}
                                            >lock</span>
                                            <input
                                                className="w-full bg-transparent border-none py-4 pl-12 pr-12 focus:ring-0 font-medium"
                                                style={{ color: '#1a1a1a', outline: 'none' }}
                                                placeholder="••••••••"
                                                type={showOld ? "text" : "password"}
                                                name="oldPassword"
                                                value={oldPassword}
                                                onChange={(e) => setOldPassWord(e.target.value)}
                                            />
                                            <span
                                                className="material-symbols-outlined absolute right-4 cursor-pointer transition-colors"
                                                style={{ color: showOld ? '#702e36' : '#9ca3af' }}
                                                onClick={() => setShowOld(!showOld)}
                                            >{showOld ? 'visibility_off' : 'visibility'}</span>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label
                                            className="text-xs font-bold tracking-wider uppercase ml-1"
                                            style={{ color: '#6b7280' }}
                                        >
                                            Mật khẩu mới
                                        </label>
                                        <div
                                            className="relative flex items-center rounded-xl group transition-all"
                                            style={{
                                                background: '#ffffff',
                                                border: '1.5px solid #e5e7eb',
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(112, 46, 54, 0.5)'
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(112, 46, 54, 0.1)'
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb'
                                                e.currentTarget.style.boxShadow = 'none'
                                            }}
                                        >
                                            <span
                                                className="material-symbols-outlined absolute left-4 transition-colors"
                                                style={{ color: '#9ca3af' }}
                                            >lock_open</span>
                                            <input
                                                className="w-full bg-transparent border-none py-4 pl-12 pr-12 focus:ring-0 font-medium"
                                                style={{ color: '#1a1a1a', outline: 'none' }}
                                                placeholder="••••••••"
                                                type={showNew ? "text" : "password"}
                                                name="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassWord(e.target.value)}
                                            />
                                            <span
                                                className="material-symbols-outlined absolute right-4 cursor-pointer transition-colors"
                                                style={{ color: showNew ? '#702e36' : '#9ca3af' }}
                                                onClick={() => setShowNew(!showNew)}
                                            >{showNew ? 'visibility_off' : 'visibility'}</span>
                                        </div>
                                        {newPassword.length > 0 && (
                                            <div className="flex items-center gap-2 mt-2 ml-1">
                                                <span
                                                    className="material-symbols-outlined"
                                                    style={{
                                                        fontSize: '16px',
                                                        color: isNewPasswordValid ? '#10b981' : '#ef4444',
                                                        fontVariationSettings: "'FILL' 1"
                                                    }}
                                                >{isNewPasswordValid ? 'check_circle' : 'cancel'}</span>
                                                <p style={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: isNewPasswordValid ? '#10b981' : '#ef4444',
                                                    letterSpacing: '0.02em'
                                                }}>
                                                    {isNewPasswordValid ? 'Mật khẩu hợp lệ' : 'Mật khẩu phải có ít nhất 6 ký tự'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm New Password */}
                                    <div className="space-y-2">
                                        <label
                                            className="text-xs font-bold tracking-wider uppercase ml-1"
                                            style={{ color: '#6b7280' }}
                                        >
                                            Xác nhận mật khẩu mới
                                        </label>
                                        <div
                                            className="relative flex items-center rounded-xl group transition-all"
                                            style={{
                                                background: '#ffffff',
                                                border: '1.5px solid #e5e7eb',
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(112, 46, 54, 0.5)'
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(112, 46, 54, 0.1)'
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb'
                                                e.currentTarget.style.boxShadow = 'none'
                                            }}
                                        >
                                            <span
                                                className="material-symbols-outlined absolute left-4 transition-colors"
                                                style={{ color: '#9ca3af' }}
                                            >verified_user</span>
                                            <input
                                                className="w-full bg-transparent border-none py-4 pl-12 pr-12 focus:ring-0 font-medium"
                                                style={{ color: '#1a1a1a', outline: 'none' }}
                                                placeholder="••••••••"
                                                type={showConfirm ? "text" : "password"}
                                                name="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            <span
                                                className="material-symbols-outlined absolute right-4 cursor-pointer transition-colors"
                                                style={{ color: showConfirm ? '#702e36' : '#9ca3af' }}
                                                onClick={() => setShowConfirm(!showConfirm)}
                                            >{showConfirm ? 'visibility_off' : 'visibility'}</span>
                                        </div>
                                        {confirmPassword.length > 0 && (
                                            <div className="flex items-center gap-2 mt-2 ml-1">
                                                <span
                                                    className="material-symbols-outlined"
                                                    style={{
                                                        fontSize: '16px',
                                                        color: isPasswordMatch ? '#10b981' : '#ef4444',
                                                        fontVariationSettings: "'FILL' 1"
                                                    }}
                                                >{isPasswordMatch ? 'check_circle' : 'cancel'}</span>
                                                <p style={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: isPasswordMatch ? '#10b981' : '#ef4444',
                                                    letterSpacing: '0.02em'
                                                }}>
                                                    {isPasswordMatch ? 'Mật khẩu trùng khớp' : 'Mật khẩu không trùng khớp'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="w-full text-white font-bold py-4 rounded-xl transition-all duration-300"
                                        style={{
                                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                                            boxShadow: '0 8px 24px -4px rgba(112, 46, 54, 0.35)',
                                            letterSpacing: '0.05em'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.02)'
                                            e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(112, 46, 54, 0.45)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)'
                                            e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(112, 46, 54, 0.35)'
                                        }}
                                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    >
                                        Cập nhật mật khẩu
                                    </button>
                                </form>
                            </div>

                            {/* Cancel Link */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile')}
                                    className="text-xs font-bold uppercase tracking-widest transition-colors"
                                    style={{ color: '#9ca3af' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                                >
                                    Quay lại
                                </button>
                            </div>
                        </div>
                    </main>

                    <Footer />
                </>
            )}
        </>
    )
}

export default UpdatePasswordView
