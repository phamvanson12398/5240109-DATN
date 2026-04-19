import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  
  orderCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
  },

  shippingInfo: { // Snapshot địa chỉ giao hàng tại thời điểm đặt
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true }
  },

  orderStatus: {
    type: String,
    required: true,
    enum: ["Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"],
    default: "Chờ xử lý",
  },

  trackingNumber: {
    type: String,
    trim: true,
    sparse: true, // Cho phép null nhưng nếu có giá trị thì phải duy nhất (nếu unique: true)
  },

  cancellationReason: {
    type: String,
    trim: true,
    default: null
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "MOMO", "VNPAY"],
    default: "COD",
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },

  paymentInfo: {
    provider: { type: String }, 
    transId: { type: String },
    resultCode: { type: String },
    message: { type: String },
    amount: { type: Number },
    payType: { type: String },
  },

  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },

  // --- VOUCHER SNAPSHOT (Refactor: Gộp History vào Order) ---
  voucher_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Voucher",
    index: true
  },
  voucherCode: { // Lưu mã tại thời điểm áp dụng
    type: String,
    uppercase: true,
    trim: true
  },
  voucherType: { // Lưu loại: percentage | fixed
    type: String,
    enum: ["percentage", "fixed"]
  },
  voucherValue: { // Giá trị (ví dụ: 10% hoặc 50000)
    type: Number
  },
  discountAmount: { // Số tiền được giảm thực tế
    type: Number,
    default: 0
  },

  itemsPrice: { type: Number, required: true, default: 0 },
  taxPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },

  deliveredAt: Date,
  cancelledAt: Date, // Thời gian đơn hàng bị hủy
  cancelledBy: { // Người thực hiện việc hủy đơn
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  cancellationReason: { // Lý do hủy đơn hàng (Shopee Style)
    type: String,
    default: ""
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// --- CẤU HÌNH INDEX (Tối ưu truy vấn & nghiệp vụ) ---
// Index cho user và voucher để tăng tốc độ đối soát
orderSchema.index({ user_id: 1 });
orderSchema.index({ orderStatus: 1 });

// Compound Index: Phục vụ logic "Kiểm tra User đã dùng voucher này chưa"
// Giúp Query cực nhanh khi hệ thống có hàng triệu đơn hàng
orderSchema.index({ user_id: 1, voucher_id: 1, orderStatus: 1 });


// Middleware tính tổng tiền trước khi lưu đơn hàng
orderSchema.pre('save', function(next) {
  this.itemsPrice = this.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
  next();
});

export default mongoose.model("Order", orderSchema);
