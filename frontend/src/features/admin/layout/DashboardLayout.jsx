/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Layout chính cho giao diện Quản trị Premium (Dashboard Layout).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Đóng vai trò là "khung xương" (Shell) kiến trúc cho toàn bộ khu vực Admin.
 *    - Tích hợp và cố định các thành phần điều hướng (Sidebar, Header) để tạo trải nghiệm quản lý nhất quán.
 *    - Quản lý vùng hiển thị chính (Main Content Area) nơi các trang chức năng (Sản phẩm, Đơn hàng) được render vào.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Giao diện & Layout Quản trị (Admin UI/UX Framework).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - React Composition (Children Prop): Kỹ thuật "đóng gói" mạnh mẽ nhất trong React. Layout chỉ lo phần khung (Sidebar, Header), còn ruột (Children) là nội dung động của từng trang cụ thể.
 *    - Tailwind CSS Typography & Colors: Thiết kế dựa trên hệ thống Design Tokens tùy chỉnh (`font-body`, `bg-[#f9f9f7]`).
 *    - Print Media Query (`no-print`, `print:m-0`): Một kỹ thuật chuyên sâu cho Dashboard. Khi Admin bấm In báo cáo (Ctrl+P), các thành phần menu (Sidebar, Header) sẽ tự động ẩn đi, chỉ in nội dung dữ liệu quan trọng.
 *    - Fixed Header/Sidebar Pattern: Sử dụng `pt-20` (padding top) và `ml-64` (margin left) để bù trừ khoảng trống cho Header và Sidebar đang được `fixed` vị trí, tránh việc nội dung bị che mất.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Prop `user` (dữ liệu admin) và `children` (nội dung trang con).
 *    - Output: Một giao diện Quản trị hoàn chỉnh, chuyên nghiệp và sẵn sàng cho việc in ấn.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `children`: Đại diện cho bất kỳ Component nào được bọc bên trong Layout này.
 *    - `user`: Thông tin người dùng hiện tại để truyền xuống Sidebar/Header hiển thị Profile.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Render cấu trúc 3 phần: Sidebar (Trái/Cố định), Header (Trên/Cố định), Main (Phải/Nội dung).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Khởi tạo khung toàn màn hình với màu nền trung tính.
 *    - Bước 2: Render Sidebar và Header (được đánh dấu `no-print`).
 *    - Bước 3: Đẩy nội dung `children` vào thẻ `main` với khoảng cách căn chỉnh chuẩn.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không gọi API trực tiếp. Đây là Pure Presentation Layout.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Phân quyền cấp cao: Mặc dù file này không check quyền trực tiếp, nhưng nó chỉ được sử dụng bên trong `AdminLayout.jsx` - nơi đã thực hiện chốt chặn bảo mật.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Selection CSS: Sử dụng `selection:bg-[#ffdadb]` - một chi tiết UX nhỏ nhưng tinh tế, giúp màu sắc khi bôi đen văn bản đồng bộ với tông màu thương hiệu.
 *    - Margin Left (`ml-64`): Khi thay đổi độ rộng Sidebar, bạn BẮT BUỘC phải cập nhật lại giá trị margin này ở thẻ `main` để tránh vỡ layout.
 */
import React from 'react';
import Sidebar from '@/features/admin/layout/Sidebar';
import Header from '@/features/admin/layout/Header';
import '@/features/admin/layout/styles/AdminLayout.css';

export default function DashboardLayout({ user, children }) {
    return (
        <div className="admin-shell">
            <div className="no-print">
                <Sidebar user={user} />
                <Header user={user} />
            </div>
            <main className="admin-main-shell">
                {children}
            </main>
        </div>
    );
}
