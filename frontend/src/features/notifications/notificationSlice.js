import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/shared/api/http.js";

// Thunk: Lấy tất cả thông báo
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/notifications/all");
      return data; // { notifications, unreadCount }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy thông báo"
      );
    }
  }
);

// Thunk: Đánh dấu đã đọc
export const markAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await axios.put(`/api/v1/notifications/${id}/read`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi cập nhật thông báo"
      );
    }
  }
);

// Thunk: Đánh dấu tất cả đã đọc
export const markAllRead = createAsyncThunk(
  "notification/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await axios.put("/api/v1/notifications/read-all");
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi cập nhật thông báo"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearNotificationErrors: (state) => {
      state.error = null;
    },
    // Optimistic reading
    readLocal: (state, action) => {
      const note = state.notifications.find(n => n._id === action.payload);
      if (note && !note.isRead) {
        note.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    readAllLocal: (state) => {
      state.notifications.forEach(n => n.isRead = true);
      state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNotificationErrors, readLocal, readAllLocal } = notificationSlice.actions;
export default notificationSlice.reducer;
