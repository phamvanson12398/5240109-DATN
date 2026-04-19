import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, "Đánh giá phải thuộc về một người dùng"] 
  },
  product_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: [true, "Đánh giá phải thuộc về một sản phẩm"] 
  },
  rating: { 
    type: Number, 
    required: [true, "Vui lòng chọn số sao đánh giá"],
    min: [1, "Số sao tối thiểu là 1"], 
    max: [5, "Số sao tối đa là 5"] 
  },
  comment: {
    type: String,
    required: [true, "Vui lòng nhập nội dung đánh giá"]
  },
  status: { 
    type: String, 
    enum: ["approved", "pending", "rejected"],
    default: "approved" 
  }
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
