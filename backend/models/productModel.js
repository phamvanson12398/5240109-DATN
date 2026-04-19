import "./categoryModel.js";
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({ // tạo schema cho sản phẩm
    name: {
        // tên sản phẩm
        type: String,
        required: [true, "Nhập tên sản sản phẩm"],
        trim: true,
        maxLength: [100, "Tên sản phẩm không được vượt quá 100 ký tự"]
    },
    description: { // mô tả sản phẩm
        type: String,
        required: [true, "Nhập mô tả sản phẩm"]
    },
    // --- NHÓM GIÁ & KHO ---
    price: { // giá bán (sau khi giảm)
        type: Number,
        required: [true, "Nhập giá sản phẩm"],
        maxLength: [10, "Giá sản phẩm không được vượt quá 10 ký tự"]
    },
    originalPrice: { // giá gốc (để hiện gạch ngang)
        type: Number,
        default: 0
    },
    stock: { // số lượng tồn kho
        type: Number,
        required: [true, "Nhập số lượng sản phẩm"],
        maxLength: [10, "Số lượng sản phẩm không được vượt quá 10 ký tự"],
        default: 1
    },
    sold: { // số lượng đã bán (social proof)
        type: Number,
        default: 0
    },

    // [Graceful Degradation] - Cấu trúc Category cũ dạng Object (Để tương thích Frontend hiện tại)
    category: {
        level1: { type: String, required: [true, "Vui lòng chọn danh mục cấp 1"] },
        level2: { type: String, required: [true, "Vui lòng chọn danh mục cấp 2"] },
        level3: { type: String, required: [true, "Vui lòng chọn danh mục cấp 3"] }
    },
    publisher: { // nhà xuất bản (nếu là sách)
        type: String,
        default: ""
    },
    publishYear: { // năm xuất bản
        type: Number
    },
    page: { // số trang
        type: Number
    },
    language: { // ngôn ngữ
        type: String,
        default: "Tiếng Việt"
    },

    // --- HÌNH ẢNH & TRẠNG THÁI ---
    ratings: { // đánh giá trung bình của sản phẩm
        type: Number,
        default: 0
    },
    images: [// hình ảnh sản phẩm
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],

    numOfReviews: { // số lượng đánh giá của sản phẩm
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["available", "out_of_stock", "discontinued"],
        default: "available"
    },
    keyword: [
         String
    ],
    level: String,
    createdAt: { // ngày tạo sản phẩm
        type: Date,
        default: Date.now
    }

})

// Thêm Index cho Tên sản phẩm để hỗ trợ tìm kiếm
productSchema.index({ name: 1 });

export default mongoose.models.Product || mongoose.model("Product", productSchema);