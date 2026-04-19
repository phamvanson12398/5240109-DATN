import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  // 1. Thông tin định danh
  code: { 
    type: String, 
    required: [true, "Vui lòng nhập mã Voucher"], 
    unique: true, 
    uppercase: true,
    trim: true,
    index: true 
  },
  
  // Phân loại: Exclusive (Độc quyền VIP), Limited (Giới hạn lượt), General (Phố thông)
  type: { 
    type: String, 
    enum: ['exclusive', 'limited', 'general'], 
    required: true,
    default: 'general'
  },

  // 2. Cấu hình giảm giá (Discount)
  discount: {
    type: { 
      type: String, 
      enum: ['percentage', 'fixed'], 
      required: true,
      default: 'fixed'
    },
    value: { type: Number, required: true }, // Giá trị giảm (Ví dụ: 10% hoặc 50000 VND)
    maxAmount: { type: Number } // Số tiền giảm tối đa (Rat quan trọng cho loại percentage)
  },

  // 3. Điều kiện áp dụng (Conditions)
  conditions: {
    minOrderAmount: { type: Number, default: 0 }, // Giá trị đơn hàng tối thiểu
    startDate: { type: Date, default: Date.now }, // Ngày bắt đầu có hiệu lực
    endDate: { type: Date, required: [true, "Vui lòng nhập ngày kết hạn"] }, // Ngày hết hạn
    usageLimit: { type: Number, default: -1 }, // Tổng lượt toàn hệ thống (-1 là không giới hạn)
    limitPerUser: { type: Number, default: 1 } // Mỗi khách hàng được dùng tối đa bao nhiêu lần
  },

  // 4. Đối tượng mục tiêu (Targeting)
  targeting: {
    isPublic: { type: Boolean, default: true }, // Hiện lên Banner/Trang chủ hay không
    exclusiveUsers: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }] // Danh sách ID User được phép dùng (Nếu là loại exclusive)
  },

  // 5. Trạng thái vận hành
  usedCount: { type: Number, default: 0 }, // Số lượt đã sử dụng thực tế (Dùng để check nhanh)
  status: { 
    type: String, 
    enum: ['active', 'disabled'], 
    default: 'active',
    index: true
  }

}, { timestamps: true });

// Middleware kiểm tra tính hợp lệ của ngày hết hạn trước khi lưu
voucherSchema.pre('save', function(next) {
  if (this.conditions.endDate <= this.conditions.startDate) {
    next(new Error("Ngày kết thúc phải lớn hơn ngày bắt đầu!"));
  }
  next();
});

export default mongoose.model("Voucher", voucherSchema);
