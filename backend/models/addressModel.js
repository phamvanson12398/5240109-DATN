import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  streetAddress: {
    type: String,
    required: [true, "Vui lòng nhập địa chỉ cụ thể"]
  },
  district: {
    type: String,
    required: [true, "Vui lòng nhập Quận/Huyện"]
  },
  province: {
    type: String,
    required: [true, "Vui lòng nhập Tỉnh/Thành phố"]
  },
  ward: {
    type: String,
    required: [true, "Vui lòng nhập Phường/Xã"]
  },
  phone: {
    type: String,
    required: [true, "Vui lòng nhập số điện thoại nhận hàng"]
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

export default mongoose.models.Address || mongoose.model("Address", addressSchema);
