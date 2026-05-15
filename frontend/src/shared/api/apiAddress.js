/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Quản lý Kết nối Địa liệu Địa chính (Address API Service).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp các hàm giao tiếp với API địa giới hành chính (Tỉnh, Quận, Phường) của Việt Nam.
 *    - Phục vụ cho tính năng chọn địa chỉ giao hàng trong trang `Shipping`.
 *    - Đảm bảo dữ liệu địa chỉ luôn đồng nhất và chính xác từ một nguồn dữ liệu chuẩn.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Thông tin Vận chuyển (Shipping & Logistics Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `axios.create`: Tạo một instance Axios riêng biệt cho Address API với cấu hình `baseURL` và `timeout` đặc thù.
 *    - Async/Await: Xử lý các yêu cầu lấy danh sách địa phương một cách trơn tru.
 *    - Error Handling: Kỹ thuật bắt lỗi và trả về thông báo thân thiện (`getErrorMessage`) để tránh ứng dụng bị dừng đột ngột.
 *    - API Depth Parameter: Sử dụng tham số `depth` để kiểm soát mức độ chi tiết của dữ liệu trả về (VD: chỉ lấy Quận, hoặc lấy Quận kèm Phường).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: `provinceCode` hoặc `districtCode` hoặc từ khóa tìm kiếm `q` từ giao diện.
 *    - Output: Mảng các đối tượng Tỉnh/Thành, Quận/Huyện hoặc Phường/Xã.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không quản lý State của React, chỉ là các hàm tiện ích (Utility Functions).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `getProvinces`: Lấy danh sách 63 tỉnh thành.
 *    - `getDistrictsByProvince`: Lấy các quận huyện thuộc một tỉnh cụ thể.
 *    - `getWardsByDistrict`: Lấy các phường xã thuộc một quận cụ thể.
 *    - Group hàm `search...`: Tìm kiếm địa danh theo từ khóa.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Giao diện `Shipping.jsx` gọi hàm `getProvinces`.
 *    - Bước 2: Hàm thực hiện Request lên Endpoint `/api/v1/address/p/`.
 *    - Bước 3: Dữ liệu trả về được kiểm tra xem có phải là mảng không (`Array.isArray`).
 *    - Bước 4: Trả dữ liệu về cho Component để render vào thẻ `<select>`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Frontend -> Address API Instance -> Backend Proxy -> 3rd Party Address API / DB -> Data -> Frontend UI.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Validate Input: Các hàm `getDistricts` và `getWards` sẽ trả về mảng rỗng ngay lập tức nếu thiếu Code đầu vào, giúp tiết kiệm băng thông API.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Toàn bộ các hàm Export ra ngoài đều là hàm bất đồng bộ (`async`).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Lưu ý cấu trúc URL: API này sử dụng các tiền tố `/p/` (Province), `/d/` (District), `/w/` (Ward).
 *    - Nếu bạn đổi sang một nhà cung cấp dữ liệu địa chỉ khác, bạn chỉ cần sửa duy nhất file này mà không cần chạm vào logic ở giao diện.
 */
import axios from "axios";
import { API_V1_BASE_URL } from "@/shared/config/api";

const API_URL = API_V1_BASE_URL ? `${API_V1_BASE_URL}/address` : "/api/v1/address";

const http = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "Có lỗi xảy ra";
};

// Lấy danh sách tỉnh/thành
export const getProvinces = async () => {
  try {
    const res = await http.get("/p/");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    throw new Error(`getProvinces: ${getErrorMessage(error)}`);
  }
};

// Lấy danh sách quận/huyện theo provinceCode
export const getDistrictsByProvince = async (provinceCode) => {
  if (!provinceCode) return [];
  try {
    const res = await http.get(`/p/${provinceCode}`, { params: { depth: 2 } });
    return res.data?.districts || [];
  } catch (error) {
    throw new Error(`getDistrictsByProvince: ${getErrorMessage(error)}`);
  }
};

// Lấy danh sách phường/xã theo districtCode
export const getWardsByDistrict = async (districtCode) => {
  if (!districtCode) return [];
  try {
    const res = await http.get(`/d/${districtCode}`, { params: { depth: 2 } });
    return res.data?.wards || [];
  } catch (error) {
    throw new Error(`getWardsByDistrict: ${getErrorMessage(error)}`);
  }
};

// Search
export const searchProvinces = async (q) => {
  if (!q?.trim()) return [];
  try {
    const res = await http.get("/p/search/", { params: { q } });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    throw new Error(`searchProvinces: ${getErrorMessage(error)}`);
  }
};

export const searchDistricts = async (q) => {
  if (!q?.trim()) return [];
  try {
    const res = await http.get("/d/search/", { params: { q } });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    throw new Error(`searchDistricts: ${getErrorMessage(error)}`);
  }
};

export const searchWards = async (q) => {
  if (!q?.trim()) return [];
  try {
    const res = await http.get("/w/search/", { params: { q } });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    throw new Error(`searchWards: ${getErrorMessage(error)}`);
  }
};
