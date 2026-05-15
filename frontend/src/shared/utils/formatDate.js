/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Tiện ích Định dạng Ngày tháng (Date Formatter Utility).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp các hàm chuẩn hóa hiển thị ngày tháng trên toàn hệ thống (Admin & Client).
 *    - Đảm bảo định dạng thân thiện với người dùng Việt Nam (dd/MM/yyyy).
 */

/**
 * Định dạng ngày giờ đầy đủ: dd/MM/yyyy HH:mm
 * @param {Date|String|Number} dateString 
 * @returns {String} "05/04/2026 11:35"
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
};

/**
 * Định dạng ngày rút gọn: dd/MM/yyyy
 * @param {Date|String|Number} dateString 
 * @returns {String} "05/04/2026"
 */
export const formatDateOnly = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export default {
    formatDateTime,
    formatDateOnly
};
