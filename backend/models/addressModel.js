import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, "Địa chỉ phải thuộc về một người dùng"]
  },
  fullName: {
    type: String,
    required: [true, "Vui lòng nhập tên người nhận"],
    trim: true
  },
  phone: {
    type: String,
    required: [true, "Vui lòng nhập số điện thoại nhận hàng"],
    validate: {
      validator: function(v) {
        // Regex kiểm tra số điện thoại Việt Nam (0xxxxxxxxx hoặc +84xxxxxxxxx)
        return /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(v); 
      },
      message: props => `${props.value} không phải là số điện thoại hợp lệ!`
    }
  },
  province: {
    type: String,
    required: [true, "Vui lòng chọn Tỉnh/Thành phố"],
    trim: true
  },
  district: {
    type: String,
    required: [true, "Vui lòng chọn Quận/Huyện"],
    trim: true
  },
  ward: {
    type: String,
    required: [true, "Vui lòng chọn Phường/Xã"],
    trim: true
  },
  streetAddress: {
    type: String,
    required: [true, "Vui lòng nhập địa chỉ cụ thể"],
    trim: true
  },
  provinceCode: {
    type: String,
    required: [true, "Mã tỉnh/thành là bắt buộc"]
  },
  districtCode: {
    type: String,
    required: [true, "Mã quận/huyện là bắt buộc"]
  },
  wardCode: {
    type: String,
    required: [true, "Mã phường/xã là bắt buộc"]
  },
  zipCode: {
    type: String,
    trim: true
  },
  addressLabel: {
    type: String,
    enum: ["Nhà riêng", "Văn phòng", "Khác"],
    default: "Khác"
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, "Ghi chú không được vượt quá 200 ký tự"]
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

// TỐI ƯU HÓA: Index để tìm kiếm địa chỉ theo user_id cực nhanh
addressSchema.index({ user_id: 1, isDefault: -1 });

export default mongoose.models.Address || mongoose.model("Address", addressSchema);
