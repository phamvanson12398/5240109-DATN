import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Vui lòng nhập tên danh mục"],
    trim: true 
  },
  description: {
    type: String,
    default: ""
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null // Hỗ trợ cấu trúc cây đa cấp
  },
  status: { 
    type: String, 
    enum: ["active", "inactive"],
    default: "active" 
  }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
