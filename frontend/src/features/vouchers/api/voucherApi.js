import axios from "@/shared/api/http.js";

/**
 * Voucher API Services
 */
export const voucherApi = {
  // Lấy danh sách Voucher công khai
  fetchActiveVouchers: async () => {
    const { data } = await axios.get("/api/v1/vouchers/all");
    return data.vouchers;
  },

  // Lấy kho voucher của cá nhân
  fetchMyVouchers: async () => {
    const { data } = await axios.get("/api/v1/user-vouchers/me");
    return data.vouchers;
  },

  // Áp dụng voucher vào đơn hàng
  applyVoucher: async (voucherCode, itemPrice) => {
    const { data } = await axios.post("/api/v1/vouchers/apply", { 
      voucherCode, 
      itemPrice 
    });
    return data;
  },

  // Lưu voucher vào kho cá nhân
  claimVoucher: async (voucherId) => {
    const { data } = await axios.post(`/api/v1/user-vouchers/claim/${voucherId}`);
    return data;
  }
};
