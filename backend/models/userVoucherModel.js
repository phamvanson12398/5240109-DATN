import mongoose from "mongoose";

const userVoucherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  voucher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['available', 'used', 'expired'],
    default: 'available',
    index: true
  },
  claimedAt: {
    type: Date,
    default: Date.now
  },
  usedAt: {
    type: Date
  },
  assignedBySystem: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Đảm bảo một user không thể nhận cùng một voucher nhiều lần
userVoucherSchema.index({ user: 1, voucher: 1 }, { unique: true });

export default mongoose.model("UserVoucher", userVoucherSchema);
