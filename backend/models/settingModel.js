const settingsSchema = new mongoose.Schema({
    // ========== THÔNG TIN CÁ NHÂN ==========
    adminName: {
        type: String,
        required: [true, 'Tên admin không được để trống'],
        trim: true, // Tự động xóa khoảng trắng đầu/cuối
        maxLength: [100, 'Tên không được vượt quá 100 ký tự']
    },

    email: {
        type: String,
        required: [true, 'Email không được để trống'],
        unique: true, // Đảm bảo email là duy nhất trong DB
        validate: [validator.isEmail, 'Email không hợp lệ'], // Sử dụng validator library
        lowercase: true // Tự động convert sang lowercase
    },

    // ========== THÔNG TIN CÔNG TY ==========
    companyName: {
        type: String,
        required: [true, 'Tên công ty không được để trống'],
        trim: true,
        maxLength: [200, 'Tên công ty quá dài']
    },

    address: {
        type: String,
        required: [true, 'Địa chỉ không được để trống'],
        trim: true,
        maxLength: [500, 'Địa chỉ quá dài']
    },

    // ========== THÔNG BÁO ==========
    /**
     * Notifications - Các cài đặt thông báo cho admin
     * Mặc định tất cả = true (opt-out thay vì opt-in)
     * Admin có thể tắt từng loại thông báo riêng lẻ
     */
    notifications: {
        newOrders: {
            type: Boolean,
            default: true // Thông báo khi có đơn hàng mới
        },
        lowStock: {
            type: Boolean,
            default: true // Thông báo khi sản phẩm sắp hết hàng
        },
        newUsers: {
            type: Boolean,
            default: true // Thông báo khi có user đăng ký mới
        },
        newReviews: {
            type: Boolean,
            default: true // Thông báo khi có review mới
        }
    }
}, {
    timestamps: true  // Tự động thêm createdAt và updatedAt
});

/**
 * PRE-SAVE MIDDLEWARE
 * Chạy TRƯỚC KHI save document vào database
 * 
 * MỤC ĐÍCH: Enforce Singleton Pattern
 * - Kiểm tra xem đã có settings document nào chưa
 * - Nếu đã có và đang tạo mới (isNew = true) → throw error
 * - Chỉ cho phép UPDATE, không cho phép tạo document thứ 2
 */
settingsSchema.pre('save', async function (next) {
    // countDocuments() - Đếm số lượng documents trong collection
    const count = await this.constructor.countDocuments();

    // Nếu đã có document VÀ đây là document mới → chặn lại
    if (count > 0 && this.isNew) {
        throw new Error('Settings document already exists. Use update instead.');
    }

    next(); // Tiếp tục save nếu pass validation
});

/**
 * Export Model
 * mongoose.model() tạo Model từ Schema
 * - Tham số 1: Tên model (sẽ tự động tạo collection 'settings' - lowercase + plural)
 * - Tham số 2: Schema definition
 */
export default mongoose.model('Settings', settingsSchema);