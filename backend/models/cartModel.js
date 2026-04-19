
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
        unique: true // Mỗi user chỉ có 1 giỏ hàng duy nhất trong DB
    }
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);
