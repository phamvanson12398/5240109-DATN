/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mảnh quản lý trạng thái Đơn hàng (Order Redux Slice).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý toàn bộ thông tin về các giao dịch mua hàng của người dùng.
 *    - Chịu trách nhiệm tạo đơn hàng mới (`createOrder`) sau khi khách hàng xác nhận thanh toán.
 *    - Lưu trữ và cung cấp danh sách lịch sử mua hàng để hiển thị trong trang cá nhân.
 *    - Cung cấp dữ liệu chi tiết cho từng đơn hàng cụ thể (Sản phẩm đã mua, trạng thái vận chuyển, thông tin thanh toán).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Chốt đơn (Checkout Flow) & Lịch sử mua hàng (Purchase History Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `createAsyncThunk`: Xử lý các tác vụ ghi/đọc đơn hàng từ Backend (liên quan đến Database).
 *    - Redux Toolkit Workflow: Quản lý trạng thái tập trung cho đối tượng Order, tách biệt hoàn toàn với Product hay User.
 *    - JSON Data Handling: Xử lý các object phức tạp chứa nhiều tầng dữ liệu (Items -> Product -> Price).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin đơn hàng hoàn chỉnh (danh sách món, địa chỉ, tổng tiền, phương thức thanh toán).
 *    - Output: Trạng thái giao dịch (Thành công/Thất bại), danh sách `orders` và chi tiết `orderDetails`.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `orders`: Mảng chứa tất cả các đơn hàng trong lịch sử của User.
 *    - `orderDetails`: Dữ liệu "soi" chi tiết 1 đơn hàng cụ thể.
 *    - `success`: Cờ hiệu quan trọng để thông báo cho giao diện biết là đã đặt hàng xong (để xóa giỏ hàng hoặc chuyển trang).
 *    - `orderId`: ID của đơn hàng vừa tạo, dùng để truy vấn thanh toán hoặc hiển thị mã đơn.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `createOrder`: Hàm khởi tạo giao dịch, gửi toàn bộ data đơn hàng lên Server để lưu vào MongoDB.
 *    - `getMyOrders`: Lấy toàn bộ danh sách đơn hàng của người đang đăng nhập.
 *    - `getOrderDetails`: Lấy thông tin sâu của một đơn hàng dựa trên ID.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: User nhấn "Đặt hàng" -> Component gọi `dispatch(createOrder)`.
 *    - Bước 2: Slice gửi yêu cầu POST chứa thông tin đơn hàng lên Backend.
 *    - Bước 3: Backend kiểm tra kho, tính tiền, lưu DB -> Trả về Object đơn hàng đã tạo.
 *    - Bước 4: Slice nhận dữ liệu -> Cập nhật `state.order` và bật `success = true`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - React Component -> Dispatch -> Slice -> Backend API (`/api/v1/order/new`) -> MongoDB (Order Collection) -> Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Phân quyền: Các hàm lấy đơn hàng yêu cầu Header chứa Token xác thực (được xử lý tự động bởi Axios config).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Sử dụng `createAsyncThunk` cho các tác vụ tương tác với cơ sở dữ liệu từ xa.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Lưu ý: Sau khi `createOrder` thành công, bạn thường phải dọn dẹp giỏ hàng (Cart Slice) - việc này thường được thực hiện ở Component UI sau khi quan sát thấy `success = true`.
 *    - Đảm bảo rằng `orderDetails` và `order` được định rõ cấu trúc dữ liệu để tránh lỗi "undefined" khi render thông tin sản phẩm trong đơn hàng.
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from '@/shared/api/http.js'

const getOrderTimestamp = (order) => {
    const rawDate = order?.createdAt || order?.orderDate || order?.created_at || order?.updatedAt;
    const timestamp = rawDate ? new Date(rawDate).getTime() : Number.NaN;
    return Number.isFinite(timestamp) ? timestamp : -1;
};

const sortOrdersByNewest = (orders = []) =>
    [...orders].sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));

const prependUniqueOrder = (orders = [], newOrder) => {
    if (!newOrder?._id) {
        return sortOrdersByNewest(orders);
    }

    const remainingOrders = orders.filter((order) => order?._id !== newOrder._id);

    if (getOrderTimestamp(newOrder) < 0) {
        return [newOrder, ...sortOrdersByNewest(remainingOrders)];
    }

    return sortOrdersByNewest([newOrder, ...remainingOrders]);
};


// Tạo order slice
export const createOrder = createAsyncThunk('order/createOrder', async (order, { rejectWithValue }) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const { data } = await axios.post('/api/v1/order/new', order, config)
        console.log('du lieu dat hang', data);
        return data


    } catch (error) {
        return rejectWithValue(error.response?.data || ' tao don hang that bai')
    }
})


// lấy tất cả đơn hàng của user hiện tại

export const getMyOrders = createAsyncThunk('order/getAllMyOrders', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get("/api/v1/orders/user")
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "khong tai duoc don hang "

        )
    }
})

// lấy chi tiết 1 đơn hàng
export const getOrderDetails = createAsyncThunk('order/getOrderDetails', async (id, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`/api/v1/order/${id}`)
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "khong tai duoc chi tiet don hang")
    }
})

// hủy đơn hàng
export const cancelOrder = createAsyncThunk('order/cancelOrder', async ({ id, reason }, { rejectWithValue }) => {
    try {
        const { data } = await axios.put(`/api/v1/order/cancel/${id}`, { reason })
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Hủy đơn hàng thất bại")
    }
})


const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        success: false,
        cancelSuccess: false,
        loading: false,
        error: null,
        orders: [],
        order: {},
        orderDetails: {},
        orderId: null,
    },
    reducers: {
        removeErrors: (state) => {
            state.error = null
        },
        removeSuccess: (state) => {
            state.success = false
            state.cancelSuccess = false
        }
    },
    extraReducers: (builder) => {
        builder
            // tao don hang 
            .addCase(createOrder.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false
                state.order = action.payload.order
                state.success = action.payload.success
                state.orderId = action.payload?.orderId || action.payload?.order?._id || null;
                state.orders = prependUniqueOrder(state.orders, action.payload?.order);

            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Tao don hang that bai'
            })

            // lay don hang 

            .addCase(getMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = sortOrdersByNewest(action.payload?.orders || []);
            })
            .addCase(getMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Không tải được đơn hàng";
            })
            // lay chi tiet don hang
            .addCase(getOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.orderDetails = action.payload?.order || {};
            })
            .addCase(getOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Không tải được chi tiết đơn hàng";
            })
            // huy đơn hàng
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state) => {
                state.loading = false;
                state.cancelSuccess = true; // Chỉ bật cancelSuccess
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Hủy đơn hàng thất bại";
            });
    }
})

export const { removeErrors, removeSuccess } = orderSlice.actions

export default orderSlice.reducer
