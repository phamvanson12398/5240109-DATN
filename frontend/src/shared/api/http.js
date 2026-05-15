/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Cấu hình Giao thức Kết nối (Axios Interception Config).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Thiết lập URL gốc (Base URL) cho toàn bộ các yêu cầu HTTP gửi lên Backend.
 *    - Quản lý cơ chế xác thực tập trung: Tự động đính kèm Token vào Header của mọi Request.
 *    - Cấu hình các thiết lập bảo mật và phiên làm việc (Cookies, CSRF).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Hạ tầng Kết nối (Infrastructure & Networking Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Axios Instances: Sử dụng cấu hình mặc định của Axios để áp dụng cho mọi cuộc gọi API.
 *    - Axios Interceptors (Request): Kỹ thuật "đánh chặn" yêu cầu trước khi nó rời khỏi trình duyệt để tiêm thêm dữ liệu (Bearer Token).
 *    - Environment Variables (`import.meta.env`): Bảo mật thông tin URL của Backend bằng cách lấy từ file `.env`.
 *    - String Normalization: Xử lý chuỗi URL để đảm bảo không bị lỗi dấu gạch chéo thừa (`/`) gây lỗi 404.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Biến môi trường `VITE_API_URL` và Token từ `localStorage`.
 *    - Output: Một instance Axios đã được cấu hình sẵn sàng cho các Slice/Component sử dụng.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không lưu trữ State của React, chỉ quản lý cấu hình tĩnh và logic xử lý Token.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Interceptor Request (dòng 49): Kiểm tra và tiêm Token vào Header `Authorization`.
 *    - Normalize URL: Đảm bảo đường dẫn API luôn chuẩn xác bất kể cấu hình ở `.env`.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Trình duyệt tải file App.
 *    - Bước 2: File `http.js` khởi chạy, thiết lập `baseURL` và `withCredentials`.
 *    - Bước 3: Khi có bất kỳ hàm `axios.get/post` nào được gọi, Interceptor sẽ nhảy vào.
 *    - Bước 4: Interceptor lấy Token mới nhất từ `localStorage` và gán vào Header.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Frontend -> Interceptor (Add Token) -> Server (Validate Token) -> Database -> Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Tự động hóa việc phân quyền: Giúp lập trình viên không phải viết thủ công dòng `headers: { Authorization: ... }` cho mỗi lần gọi API.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có luồng bất đồng bộ phức tạp, chỉ là logic chạy trước khi Request đi.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Đây là cửa ngõ duy nhất của dữ liệu ra vào. Nếu cấu hình sai `baseURL` ở đây, toàn bộ ứng dụng sẽ bị lỗi "Network Error".
 *    - `withCredentials: true` là bắt buộc nếu Backend sử dụng cơ chế Cookie-based Authentication.
 */
import axios from "axios";
import { API_ORIGIN } from "@/shared/config/api";

axios.defaults.baseURL = API_ORIGIN || "";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axios;
