import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Vui lòng nhập tên quyền hạn"], 
    unique: true,
    trim: true,
    lowercase: true // admin, user, editor
  }
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model("Role", roleSchema);
