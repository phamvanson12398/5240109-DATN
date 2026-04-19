import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    cart_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Cart",
        required: [true, "Item phải thuộc về một giỏ hàng"]
    },
    product_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: [true, "Item phải liên kết với một sản phẩm"]
    },
    name: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    }, // Giá snapshot tại thời điểm thêm vào giỏ
    image: { 
        type: String, 
        required: true 
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Số lượng phải ít nhất là 1"],
        default: 1
    },
    size: { 
        type: String 
    },
    color: { 
        type: String 
    }
}, { timestamps: true });

export default mongoose.models.CartItem || mongoose.model("CartItem", cartItemSchema);
