/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mảnh quản lý trạng thái Quản trị (Admin Redux Slice).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Đóng vai trò là "Trung tâm điều khiển" (Command Center) cho các tính năng dành riêng cho Admin.
 *    - Quản lý dữ liệu Thống kê (Dashboard), Danh sách Sản phẩm, Đơn hàng, Người dùng và Cấu hình hệ thống (Settings).
 *    - Hỗ trợ các tác vụ phức tạp như: Import sản phẩm từ Excel, Kiểm tra tồn kho hàng loạt, Tìm kiếm sản phẩm nâng cao.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị (Back-office / Admin Management Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `createAsyncThunk`: Xử lý hàng chục tác vụ bất đồng bộ liên quan đến CRUD (Create, Read, Update, Delete) trên Server.
 *    - Optimistic Updates (Cập nhật lạc quan): Tự động cập nhật mảng `products` hoặc `orders` ngay trong Slice sau khi API thành công mà không cần tải lại toàn bộ trang.
 *    - Excel/CSV Data Handling: Xử lý mảng dữ liệu lớn gửi từ Frontend lên để thực hiện Import hàng loạt.
 *    - Multi-case Handling: Một Slice duy nhất nhưng xử lý rất nhiều thực thể khác nhau (Products, Orders, Users, Stats).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Dữ liệu từ các form Admin (Thông tin sản phẩm, file Excel, trạng thái đơn hàng...).
 *    - Output: Một State phình to chứa toàn bộ "vũ trụ" dữ liệu của trang Admin.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `stats`: Chứa các con số tổng quan (Doanh thu, số lượng đơn, số lượng khách).
 *    - `products/orders/users`: Các mảng chứa danh sách đối tượng tương ứng.
 *    - `importResult`: Lưu thông báo kết quả sau khi thực hiện Import Excel (số dòng thành công, số dòng lỗi).
 *    - `loading`: Trạng thái xử lý chung cho toàn bộ trang Dashboard Admin.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `fetchDashboardStats`: Lấy dữ liệu biểu đồ và thống kê tổng hợp.
 *    - `importProducts/importStock`: Bộ đôi xử lý file Excel cực kỳ quan trọng cho khâu vận hành.
 *    - `updateOrderStatus/updateUserRole`: Các hàm thay đổi trạng thái thực thể.
 *    - `searchAdminProducts`: Công cụ tìm kiếm sản phẩm nhanh theo tên dành cho Admin.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Admin thực hiện một hành động (VD: Xóa sản phẩm).
 *    - Bước 2: Dispatch `deleteProduct(id)`.
 *    - Bước 3: Slice gọi API Server -> DB xóa bản ghi -> Trả về ID vừa xóa.
 *    - Bước 4: Slice dùng ID đó lọc (filter) mảng `products` hiện tại để xóa đi phần tử đó mà không cần load lại trang.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Admin UI -> Dispatch Thunk -> Axios -> Admin Controllers (Backend) -> MongoDB -> Response -> Slice Update.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Phân quyền: Toàn bộ API gọi từ file này đều được Backend bảo vệ bằng middleware `authorizeRoles('admin')`.
 *    - Validate: Xử lý thông báo lỗi chi tiết khi Admin nhập sai định dạng sản phẩm hoặc file Excel không hợp lệ.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Sử dụng `createAsyncThunk` cho toàn bộ các chức năng tương tác dữ liệu.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý hàm `importProducts.fulfilled`: Đây là nơi logic "Merging" diễn ra (Cập nhật nếu có rồi, thêm mới nếu chưa có).
 *    - File này rất dài vì nó gom nhiều tính năng Admin vào một nơi để dễ quản lý "Phân vùng dữ liệu Admin".
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/shared/api/http.js';

const getOrderTimestamp = (order) => {
    const rawDate = order?.createdAt || order?.orderDate || order?.created_at || order?.updatedAt;
    const timestamp = rawDate ? new Date(rawDate).getTime() : Number.NaN;
    return Number.isFinite(timestamp) ? timestamp : -1;
};

const sortOrdersByNewest = (orders = []) =>
    [...orders].sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));

/**
 * Async Thunk - Lấy thống kê dashboard
 */
export const fetchDashboardStats = createAsyncThunk(
    'admin/fetchDashboardStats',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/v1/admin/dashboard', {
                withCredentials: true
            });
            return data.stats;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải dữ liệu');
        }
    }
);

/**
 * Async Thunk - Lấy đơn hàng gần đây
 */
export const fetchRecentOrders = createAsyncThunk(
    'admin/fetchRecentOrders',
    async (limit = 5, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/v1/admin/orders/recent?limit=${limit}`, {
                withCredentials: true
            });
            return data.orders;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải đơn hàng');
        }
    }
);

/**
 * Async Thunk - Lấy dữ liệu phân tích doanh thu (Chart)
 */
export const fetchRevenueAnalytics = createAsyncThunk(
    'admin/fetchRevenueAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/v1/admin/analytics/revenue', {
                withCredentials: true
            });
            return data.analytics;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải dữ liệu biểu đồ');
        }
    }
);

/**
 * Async Thunk - Lấy tất cả sản phẩm (Admin)
 */
export const fetchAllProducts = createAsyncThunk(
    'admin/fetchAllProducts',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/v1/admin/products', {
                withCredentials: true
            });
            return data.products;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải sản phẩm');
        }
    }
);

/**
 * Async Thunk - Tạo sản phẩm mới
 */
export const createProduct = createAsyncThunk(
    'admin/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/api/v1/admin/products/create', productData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data.product;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tạo sản phẩm');
        }
    }
);

/**
 * Async Thunk - Cập nhật sản phẩm
 */
export const updateProduct = createAsyncThunk(
    'admin/updateProduct',
    async ({ id, productData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/v1/admin/products/${id}`, productData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data.product;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật sản phẩm');
        }
    }
);

/**
 * Async Thunk - Xóa sản phẩm
 */
export const deleteProduct = createAsyncThunk(
    'admin/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/v1/admin/products/${id}`, {
                withCredentials: true
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa sản phẩm');
        }
    }
);

/**
 * Async Thunk - Import sản phẩm hàng loạt từ Excel/CSV
 */
export const importProducts = createAsyncThunk(
    'admin/importProducts',
    async (products, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/api/v1/admin/products/import',
                { products },
                { withCredentials: true }
            );
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Import sản phẩm thất bại');
        }
    }
);

/**
 * Async Thunk - Kiểm tra sản phẩm tồn tại trước khi import
 */
export const importProductsPreCheck = createAsyncThunk(
    'admin/importProductsPreCheck',
    async (skus, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/api/v1/admin/products/import-precheck',
                { skus },
                { withCredentials: true }
            );
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Kiểm tra sản phẩm thất bại');
        }
    }
);

/**
 * Async Thunk - Import tồn kho hàng loạt
 */
export const importStock = createAsyncThunk(
    'admin/importStock',
    async (items, { rejectWithValue }) => {
        try {
            const { data } = await axios.put('/api/v1/admin/products/import-stock',
                { items },
                { withCredentials: true }
            );
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Import tồn kho thất bại');
        }
    }
);

/**
 * Async Thunk - Cập nhật tồn kho 1 sản phẩm
 */
export const updateSingleStock = createAsyncThunk(
    'admin/updateSingleStock',
    async ({ id, quantity }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/v1/admin/products/${id}/stock`,
                { quantity },
                { withCredentials: true }
            );
            return data.product;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Cập nhật tồn kho thất bại');
        }
    }
);

/**
 * Async Thunk - Tìm kiếm sản phẩm theo tên (Admin)
 */
export const searchAdminProducts = createAsyncThunk(
    'admin/searchAdminProducts',
    async (name, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/v1/admin/products/search?name=${encodeURIComponent(name)}`, {
                withCredentials: true
            });
            return data.products;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Tìm kiếm thất bại');
        }
    }
);

/**
 * === VOUCHERS MANAGEMENT ===
 */

/**
 * Async Thunk - Lấy tất cả voucher (Admin)
 */
export const fetchAllAdminVouchers = createAsyncThunk(
    'admin/fetchAllVouchers',
    async (filters = {}, { rejectWithValue }) => {
        try {
            // Chuyển đổi object filter thành query string
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value);
                }
            });

            const queryString = params.toString();
            const url = `/api/v1/vouchers/admin${queryString ? `?${queryString}` : ''}`;

            const { data } = await axios.get(url, {
                withCredentials: true
            });
            // Trả về toàn bộ object data để lấy thông tin phân trang (vouchers, totalVouchers, totalPages, ...)
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách voucher');
        }
    }
);

/**
 * Async Thunk - Tạo voucher mới
 */
export const createVoucher = createAsyncThunk(
    'admin/createVoucher',
    async (voucherData, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/api/v1/vouchers/admin/new', voucherData, {
                withCredentials: true
            });
            return data.voucher;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tạo voucher');
        }
    }
);

/**
 * Async Thunk - Thay đổi trạng thái voucher
 */
export const toggleVoucherStatus = createAsyncThunk(
    'admin/toggleVoucherStatus',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/v1/vouchers/admin/${id}/status`, {}, {
                withCredentials: true
            });
            return data.voucher;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể thay đổi trạng thái');
        }
    }
);

/**
 * Async Thunk - Xóa voucher
 */
export const deleteVoucher = createAsyncThunk(
    'admin/deleteVoucher',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/v1/vouchers/admin/${id}`, {
                withCredentials: true
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa voucher');
        }
    }
);

/**
 * Async Thunk - Cập nhật voucher
 */
export const updateVoucher = createAsyncThunk(
    'admin/updateVoucher',
    async ({ id, voucherData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/v1/vouchers/admin/${id}`, voucherData, {
                withCredentials: true
            });
            return data.voucher;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật voucher');
        }
    }
);

/**
 * === ORDERS MANAGEMENT ===
 */

/**
 * Async Thunk - Lấy tất cả đơn hàng (admin)
 */
export const fetchAllOrders = createAsyncThunk(
    'admin/fetchAllOrders',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/v1/admin/orders/', {
                withCredentials: true
            });
            return data.orders;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải đơn hàng');
        }
    }
);

/**
 * Async Thunk - Cập nhật trạng thái đơn hàng
 */
export const updateOrderStatus = createAsyncThunk(
    'admin/updateOrderStatus',
    async ({ id, status, trackingNumber, cancellationReason }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/v1/admin/order/${id}`,
                { status, trackingNumber, cancellationReason },
                { withCredentials: true }
            );
            return data.order;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật đơn hàng');
        }
    }
);

export const generateTrackingCode = createAsyncThunk(
    'admin/generateTrackingCode',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/v1/admin/orders/tracking-code', {
                withCredentials: true
            });
            return data.trackingCode;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tạo mã vận đơn');
        }
    }
);

/**
 * Async Thunk - Xóa đơn hàng
 */
export const deleteOrder = createAsyncThunk(
    'admin/deleteOrder',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/v1/admin/order/${id}`, {
                withCredentials: true
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa đơn hàng');
        }
    }
);

/**
 * === USERS MANAGEMENT ===
 */

/**
 * Async Thunk - Lấy tất cả users (admin)
 */
export const fetchAllUsers = createAsyncThunk(
    'admin/fetchAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/v1/admin/users', {
                withCredentials: true
            });
            return data.users;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách user');
        }
    }
);

/**
 * Async Thunk - Cập nhật role user
 */
export const updateUserRole = createAsyncThunk(
    'admin/updateUserRole',
    async ({ id, role }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/v1/admin/users/${id}`,
                { role },
                { withCredentials: true }
            );
            return data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật role');
        }
    }
);

/**
 * Async Thunk - Toggle user status (Khóa/Mở khóa tài khoản)
 */
export const toggleUserStatus = createAsyncThunk(
    'admin/toggleUserStatus',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/v1/admin/users/${id}/toggle-status`,
                { reason },
                { withCredentials: true }
            );
            return data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản');
        }
    }
);

/**
 * ========================================
 * SETTINGS MANAGEMENT
 * ========================================
 * 
 * LÝ DO DÙNG REDUX THUNK:
 * - Settings cần lưu global state (dùng ở nhiều components)
 * - Cần handle async API calls
 * - Cần dispatch nhiều actions (loading, success, error)
 * 
 * THUNK PATTERN:
 * thunk = async function nhận (dispatch, getState) và return promise
 * createAsyncThunk tự động tạo 3 action types:
 * - pending: Khi bắt đầu call API
 * - fulfilled: Khi API success
 * - rejected: Khi API fail
 */

/**
 * Async Thunk - Lấy settings từ server
 * 
 * FLOW:
 * 1. Component dispatch fetchSettings()
 * 2. Redux dispatch 'fetchSettings/pending'
 * 3. Call API GET /api/v1/admin/settings
 * 4. Success → dispatch 'fetchSettings/fulfilled' với data
 *    Fail → dispatch 'fetchSettings/rejected' với error
 * 
 * PARAMETERS:
 * - Param 1: 'admin/fetchSettings' - Action type prefix
 * - Param 2: Async callback function
 *   - Argument 1: _ (không cần params)
 *   - Argument 2: { rejectWithValue } - Thunk API
 */
export const fetchSettings = createAsyncThunk(
    'admin/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            // axios.get() - HTTP GET request
            // withCredentials: true - Gửi cookies (JWT token) kèm theo
            const { data } = await axios.get('/api/v1/admin/settings', {
                withCredentials: true
            });

            // Return data.settings → sẽ trở thành action.payload
            return data.settings;
        } catch (error) {
            // rejectWithValue() - Trả về custom error payload
            // error.response?.data?.message - Error message từ backend
            // Fallback: 'Không thể tải cài đặt' nếu không có message
            return rejectWithValue(
                error.response?.data?.message || 'Không thể tải cài đặt'
            );
        }
    }
);

/**
 * Async Thunk - Cập nhật settings
 * 
 * FLOW:
 * 1. Component dispatch updateSettings(formData)
 * 2. Redux dispatch 'updateSettings/pending'
 * 3. Call API PUT /api/v1/admin/settings với settingsData
 * 4. Success → dispatch 'updateSettings/fulfilled' với updated data
 *    Fail → dispatch 'updateSettings/rejected' với error
 * 
 * PARAMETERS:
 * - Param 1: settingsData - Object chứa form data từ component
 *   { adminName, email, companyName, address, notifications }
 * - Param 2: { rejectWithValue } - Thunk API
 */
export const updateSettings = createAsyncThunk(
    'admin/updateSettings',
    async (settingsData, { rejectWithValue }) => {
        try {
            // axios.put() - HTTP PUT request
            // Param 1: URL
            // Param 2: Request body (settingsData)
            // Param 3: Config (withCredentials)
            const { data } = await axios.put(
                '/api/v1/admin/settings',
                settingsData,
                { withCredentials: true }
            );

            // Return updated settings → action.payload
            return data.settings;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Không thể cập nhật cài đặt'
            );
        }
    }
);

/**
 * Admin Slice
 */
const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        stats: null,
        recentOrders: [],
        products: [],
        orders: [],
        users: [],
        vouchers: [],
        totalVouchers: 0,     // Tổng số voucher
        totalPages: 0,        // Tổng số trang
        currentPage: 1,       // Trang hiện tại
        settings: null,
        globalSearchQuery: '', // Từ khóa tìm kiếm toàn cục từ Header
        searchResults: [],    // Kết quả tìm kiếm sản phẩm API
        importResult: null,   // Kết quả import
        revenueAnalytics: {   // Dữ liệu biểu đồ doanh thu thực tế
            week: [],
            month: [],
            year: []
        },
        loading: false,
        error: null
    },
    reducers: {
        // Có thể thêm reducers khác nếu cần
        clearError: (state) => {
            state.error = null;
        },
        setGlobalSearchQuery: (state, action) => {
            state.globalSearchQuery = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Fetch Dashboard Stats
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch Recent Orders
        builder
            .addCase(fetchRecentOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecentOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.recentOrders = action.payload;
            })
            .addCase(fetchRecentOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch Revenue Analytics (Chart)
        builder
            .addCase(fetchRevenueAnalytics.pending, (state) => {
                state.loading = true; // Dashboard dùng chung loading
                state.error = null;
            })
            .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.revenueAnalytics = action.payload;
            })
            .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch All Products
        builder
            .addCase(fetchAllProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Create Product
        builder
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update Product
        builder
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Delete Product
        builder
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter(p => p._id !== action.payload);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch All Orders
        builder
            .addCase(fetchAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = sortOrdersByNewest(action.payload || []);
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update Order Status
        builder
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload._id) {
                    const index = state.orders.findIndex(o => o._id === action.payload._id);
                    if (index !== -1) {
                        state.orders[index] = action.payload;
                        state.orders = sortOrdersByNewest(state.orders);
                    }
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Delete Order
        builder
            .addCase(deleteOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = state.orders.filter(o => o._id !== action.payload);
            })
            .addCase(deleteOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch All Users
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update User Role
        builder
            .addCase(updateUserRole.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.users.findIndex(u => u._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Toggle User Status (Soft Delete / Reactivate)
        builder
            .addCase(toggleUserStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(toggleUserStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.users.findIndex(u => u._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(toggleUserStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * ========================================
         * SETTINGS REDUCERS
         * ========================================
         * 
         * EXTRA REDUCERS:
         * - Xử lý actions từ async thunks
         * - Không thể dùng trong reducers thường vì async
         * - Builder pattern: Chuỗi .addCase() để handle các cases
         * 
         * STATE TRANSITIONS:
         * pending → loading = true, error = null
         * fulfilled → loading = false, update data
         * rejected → loading = false, set error
         */

        // ===== Fetch Settings =====
        builder
            /** 
             * PENDING STATE
             * Trigger: Khi gọi dispatch(fetchSettings())
             * Action: Set loading = true để hiện spinner
             */
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
                state.error = null; // Clear error cũ
            })

            /** 
             * FULFILLED STATE
             * Trigger: Khi API success
             * Payload: action.payload = settings object từ server
             * Action: Lưu settings vào state
             */
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload; // Update settings từ server
            })

            /** 
             * REJECTED STATE
             * Trigger: Khi API fail (network error, 401, 500, etc)
             * Payload: action.payload = error message
             * Action: Set error để component hiện thông báo
             */
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== Update Settings =====
        builder
            /** PENDING: Khi click Save button */
            .addCase(updateSettings.pending, (state) => {
                state.loading = true; // Disable button, show loading
            })

            /** 
             * FULFILLED: Khi update thành công
             * Optimistic update: Cập nhật state ngay với data mới
             * Không cần refetch - server đã return updated data
             */
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload; // Update với data mới từ server
            })

            /** REJECTED: Khi update fail */
            .addCase(updateSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== Import Products (batch) =====
        builder
            .addCase(importProducts.pending, (state) => {
                state.loading = true;
                state.importResult = null;
            })
            .addCase(importProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.importResult = action.payload;
                
                // Cập nhật/Thêm sản phẩm vào danh sách một cách thông minh để tránh trùng lặp ID
                if (action.payload.products && Array.isArray(action.payload.products)) {
                    action.payload.products.forEach(newP => {
                        const index = state.products.findIndex(p => p._id === newP._id);
                        if (index !== -1) {
                            // Nếu đã tồn tại (Updated), cập nhật sản phẩm cũ
                            state.products[index] = newP;
                        } else {
                            // Nếu chưa có (New), thêm mới vào đầu danh sách
                            state.products.unshift(newP);
                        }
                    });
                }
            })
            .addCase(importProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== Import Stock (batch) =====
        builder
            .addCase(importStock.pending, (state) => {
                state.loading = true;
                state.importResult = null;
            })
            .addCase(importStock.fulfilled, (state, action) => {
                state.loading = false;
                state.importResult = action.payload;
                // Cập nhật stock trong danh sách products
                if (action.payload.details) {
                    action.payload.details.forEach(item => {
                        const idx = state.products.findIndex(p => p._id === item._id);
                        if (idx !== -1) {
                            state.products[idx].stock = item.newStock;
                        }
                    });
                }
            })
            .addCase(importStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== Update Single Stock =====
        builder
            .addCase(updateSingleStock.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateSingleStock.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.products.findIndex(p => p._id === action.payload._id);
                if (idx !== -1) {
                    state.products[idx] = action.payload;
                }
                // Cập nhật cả searchResults
                const sIdx = state.searchResults.findIndex(p => p._id === action.payload._id);
                if (sIdx !== -1) {
                    state.searchResults[sIdx].stock = action.payload.stock;
                }
            })
            .addCase(updateSingleStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== Search Admin Products =====
        builder
            .addCase(searchAdminProducts.pending, (state) => {
                state.loading = true;
                state.searchResults = [];
            })
            .addCase(searchAdminProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchAdminProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== Vouchers Management =====
        builder
            .addCase(fetchAllAdminVouchers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllAdminVouchers.fulfilled, (state, action) => {
                state.loading = false;
                state.vouchers = action.payload.vouchers;
                state.totalVouchers = action.payload.totalVouchers;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchAllAdminVouchers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        builder
            .addCase(createVoucher.pending, (state) => {
                state.loading = true;
            })
            .addCase(createVoucher.fulfilled, (state, action) => {
                state.loading = false;
                state.vouchers.unshift(action.payload);
            })
            .addCase(createVoucher.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        builder
            .addCase(toggleVoucherStatus.pending, () => {
                // state.loading = true; // Thường không set loading cho toggle để mượt mà hơn
            })
            .addCase(toggleVoucherStatus.fulfilled, (state, action) => {
                const index = state.vouchers.findIndex(v => v._id === action.payload._id);
                if (index !== -1) {
                    state.vouchers[index] = action.payload;
                }
            })
            .addCase(toggleVoucherStatus.rejected, (state, action) => {
                state.error = action.payload;
            });

        builder
            .addCase(deleteVoucher.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteVoucher.fulfilled, (state, action) => {
                state.loading = false;
                state.vouchers = state.vouchers.filter(v => v._id !== action.payload);
            })
            .addCase(deleteVoucher.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        builder
            .addCase(updateVoucher.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateVoucher.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.vouchers.findIndex(v => v._id === action.payload._id);
                if (index !== -1) {
                    state.vouchers[index] = action.payload;
                }
            })
            .addCase(updateVoucher.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, setGlobalSearchQuery } = adminSlice.actions;
export default adminSlice.reducer;
