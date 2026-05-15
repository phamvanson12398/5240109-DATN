import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { voucherApi } from "./api/voucherApi";

/**
 * Thunk: Kiểm tra và áp dụng Voucher vào đơn hàng
 */
export const applyVoucher = createAsyncThunk(
  "voucher/applyVoucher",
  async ({ voucherCode, itemPrice }, { rejectWithValue }) => {
    try {
      return await voucherApi.applyVoucher(voucherCode, itemPrice);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể áp dụng mã giảm giá"
      );
    }
  }
);

/**
 * Thunk: Lập danh sách Voucher hệ thống
 */
export const fetchActiveVouchers = createAsyncThunk(
  "voucher/fetchActiveVouchers",
  async (_, { rejectWithValue }) => {
    try {
      return await voucherApi.fetchActiveVouchers();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy danh sách mã giảm giá"
      );
    }
  }
);

/**
 * Thunk: Lấy kho voucher cá nhân
 */
export const fetchMyVouchers = createAsyncThunk(
  "voucher/fetchMyVouchers",
  async (_, { rejectWithValue }) => {
    try {
      return await voucherApi.fetchMyVouchers();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải kho mã giảm giá của bạn"
      );
    }
  }
);

/**
 * Thunk: Lưu voucher vào tài khoản
 */
export const claimVoucher = createAsyncThunk(
  "voucher/claimVoucher",
  async (voucherId, { rejectWithValue }) => {
    try {
      return await voucherApi.claimVoucher(voucherId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lưu mã giảm giá"
      );
    }
  }
);

const voucherSlice = createSlice({
  name: "voucher",
  initialState: {
    activeVouchers: [],
    myVouchers: [],
    appliedVoucher: null,
    voucherCode: "",
    loading: false,
    claimLoading: false,
    error: null,
    success: false,
    claimSuccess: false,
  },
  reducers: {
    resetVoucher: (state) => {
      state.appliedVoucher = null;
      state.voucherCode = "";
      state.error = null;
      state.success = false;
    },
    clearVoucherErrors: (state) => {
      state.error = null;
    },
    resetClaimState: (state) => {
      state.claimSuccess = false;
      state.claimLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedVoucher = action.payload;
        state.voucherCode = action.payload.voucherCode;
        state.success = true;
        state.error = null;
      })
      .addCase(applyVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.appliedVoucher = null;
        state.success = false;
      })
      .addCase(fetchActiveVouchers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.activeVouchers = action.payload;
      })
      .addCase(fetchActiveVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyVouchers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.myVouchers = action.payload;
      })
      .addCase(fetchMyVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(claimVoucher.pending, (state) => {
        state.claimLoading = true;
        state.error = null;
      })
      .addCase(claimVoucher.fulfilled, (state) => {
        state.claimLoading = false;
        state.claimSuccess = true;
      })
      .addCase(claimVoucher.rejected, (state, action) => {
        state.claimLoading = false;
        state.error = action.payload;
        state.claimSuccess = false;
      });
  },
});

export const { resetVoucher, clearVoucherErrors, resetClaimState } = voucherSlice.actions;
export default voucherSlice.reducer;
