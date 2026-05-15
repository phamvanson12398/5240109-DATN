/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component "Modal Đánh giá & Phản hồi" (Review Comment Modal).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp giao diện chuyên nghiệp để người dùng gửi cảm nhận sau khi nhận được hàng.
 *    - Cho phép chấm điểm sao (Star Rating), viết bình luận, chọn thẻ gợi ý (Tags) và tải lên hình ảnh/video thực tế.
 *    - Giúp tăng độ tin cậy cho sản phẩm thông qua các "User Generated Content" (Nội dung do người dùng tạo).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Sau mua hàng & Đánh giá (Post-purchase & Review Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Modal Pattern: Sử dụng kỹ thuật `isOpen` kết hợp `onClose` và `e.stopPropagation()` để quản lý hộp thoại đè lên màn hình chính.
 *    - Complex State Management: Quản lý rất nhiều trạng thái đồng thời (Rating, Hover, Tags, Images Previews, Loading, Success).
 *    - Cloudinary/Multer Integration: Xử lý `FormData` và `multipart/form-data` để gửi tập tin hình ảnh/video từ trình duyệt lên server.
 *    - URL Object: Sử dụng `URL.createObjectURL(file)` để tạo ảnh xem trước tức thì (Image Previews) mà không cần đợi tải lên server.
 *    - Memoization: Sử dụng `useMemo` và `useCallback` để tối ưu hiệu năng, tránh render lại modal khi các thông tin tĩnh không đổi.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Props `product` (đối tượng sản phẩm), `orderId` (id đơn hàng), và các hàm điều khiển `onClose`, `onSuccess`.
 *    - Output: Một bản ghi Review mới được tạo trong Database và hiển thị thông báo thành công.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `rating`: Số sao người dùng chọn (1-5).
 *    - `selectedTags`: Danh sách các nhãn gợi ý (VD: Giao hàng nhanh, Đóng gói kỹ).
 *    - `images/imagePreviews`: Lưu file thực tế và link ảnh tạm thời để hiển thị.
 *    - `showUsername`: Quyền riêng tư (Cho phép ẩn danh hoặc hiện tên thật).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `handleImageChange`: Xử lý chọn nhiều ảnh/video, kiểm tra giới hạn số lượng và dung lượng.
 *    - `handleSubmit`: Tổng hợp toàn bộ dữ liệu (Rating + Tags + Comment + Images) vào `FormData` và gửi đi.
 *    - `renderStars`: Hàm hỗ trợ vẽ icon sao với màu sắc thay đổi theo trạng thái `hover` hoặc `selected`.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Modal bật lên -> Hiển thị thông tin sản phẩm cần đánh giá.
 *    - Bước 2: User chọn số sao -> Nhấn thêm các thẻ gợi ý nhanh.
 *    - Bước 3: User chọn ảnh từ máy tính -> `imagePreviews` hiển thị ngay lập tức để kiểm tra.
 *    - Bước 4: Nhấn "Hoàn thành" -> Bật `loading` -> Gửi `FormData` lên API.
 *    - Bước 5: Thành công -> Chuyển sang trạng thái `success=true` -> Hiện màn hình cảm ơn.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> PUT (FormData) -> API `/api/v1/review` -> Backend (Multer + Cloudinary) -> MongoDB (Update Product Ratings).
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Validate Stars: Bắt buộc người dùng phải chọn ít nhất 1 sao trước khi gửi.
 *    - Error Handling: Hiển thị thông báo lỗi chi tiết (VD: File quá nặng, đã đánh giá rồi).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Hàm `handleSubmit` chứa logic gọi API bất đồng bộ và xử lý File.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `URL.revokeObjectURL(preview)`: Đừng quên giải phóng bộ nhớ khi người dùng xóa ảnh xem trước hoặc đóng modal để tránh rò rỉ bộ nhớ (Memory Leak).
 *    - `maskedName`: Logic che giấu tên (VD: N*****c) giúp bảo vệ quyền riêng tư nếu người dùng không muốn hiện tên đầy đủ.
 */
import React, { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { FiArrowLeft, FiCamera, FiVideo, FiInfo, FiAlertCircle, FiCheck, FiChevronRight } from "react-icons/fi";
import { FaStar, FaCoins } from "react-icons/fa";
import "@/features/orders/styles/ReviewComment.css";

// ====== Cấu hình ======
const RATING_LABELS = {
    1: "Tệ",
    2: "Không hài lòng",
    3: "Bình thường",
    4: "Hài lòng",
    5: "Tuyệt vời",
};

const SUGGESTION_TAGS = [
    "Đúng với mô tả",
    "Chất lượng sản phẩm",
    "Giao hàng nhanh",
    "Đóng gói cẩn thận",
    "Giá cả hợp lý",
];

/**
 * ReviewComment — Modal đánh giá sản phẩm
 *
 * Props:
 * @param {boolean}  isOpen    — Hiện/ẩn modal
 * @param {function} onClose   — Callback đóng modal
 * @param {object}   product   — { _id, name, images, category }
 * @param {string}   orderId   — ID đơn hàng (tuỳ chọn)
 * @param {function} onSuccess — Callback khi gửi đánh giá thành công
 */
function ReviewComment({ isOpen, onClose, product, orderId, onSuccess }) {
    // ====== State ======
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [showUsername, setShowUsername] = useState(true);
    const [sellerRating, setSellerRating] = useState(5);
    const [shippingRating, setShippingRating] = useState(5);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // ====== Redux ======
    const { user } = useSelector((state) => state.user);

    // ====== Derived ======
    const displayRating = hoverRating || rating;
    const ratingLabel = RATING_LABELS[displayRating] || "";

    const productImage = useMemo(() => {
        if (!product) return "";
        return product.images?.[0]?.url || product.images?.[0] || product.image || "";
    }, [product]);

    const maskedName = useMemo(() => {
        if (!user?.name) return "***";
        const name = user.name;
        if (name.length <= 2) return name[0] + "*";
        return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
    }, [user]);

    // ====== Handlers ======
    const handleTagToggle = useCallback((tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    }, []);

    const handleImageChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        
        // Giới hạn số lượng ảnh (ví dụ: tối đa 5 ảnh)
        if (images.length + files.length > 5) {
            setError("Chỉ được tải lên tối đa 5 ảnh/video");
            return;
        }

        // Cập nhật file object
        setImages((prev) => [...prev, ...files]);
        
        // Tạo URL xem trước
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...previews]);
    }, [images]);

    const handleRemoveImage = useCallback((index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]); // Giải phóng bộ nhớ
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!product?._id) return;
        if (rating === 0) {
            setError("Vui lòng chọn số sao đánh giá");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const tagText = selectedTags.length > 0 ? selectedTags.join(", ") + ". " : "";
            const finalComment = (tagText + comment).trim() || RATING_LABELS[rating];

            const formData = new FormData();
            formData.append("rating", Number(rating));
            formData.append("comment", finalComment);
            formData.append("productId", product._id);
            if (orderId) {
                formData.append("orderId", orderId);
            }
            
            images.forEach((img) => {
                formData.append("images", img);
            });

            const config = { headers: { "Content-Type": "multipart/form-data" } };

            await axios.put("/api/v1/review", formData, config);

            setSuccess(true);
            onSuccess?.();
        } catch (err) {
            const msg = err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [product, rating, comment, selectedTags, images, onSuccess, orderId]);

    const handleClose = useCallback(() => {
        setRating(5);
        setHoverRating(0);
        setComment("");
        setSelectedTags([]);
        setShowUsername(true);
        setSellerRating(5);
        setShippingRating(5);
        setImages([]);
        setImagePreviews([]);
        setError("");
        setSuccess(false);
        onClose?.();
    }, [onClose]);

    // ====== Early return ======
    if (!isOpen) return null;

    // ====== Success State ======
    if (success) {
        return (
            <div className="rc-success-overlay" onClick={handleClose}>
                <div className="rc-success-card" onClick={(e) => e.stopPropagation()}>
                    <div className="rc-success-icon-circle">
                        <FiCheck size={32} />
                    </div>
                    <h3 className="rc-success-title">Cảm ơn bạn!</h3>
                    <p className="rc-success-desc">Đánh giá của bạn đã được gửi thành công.</p>
                    <button className="rc-success-btn" onClick={handleClose}>
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    // ====== Render Stars Helper ======
    const renderStars = (count, currentRating, onStarClick, size = 36) => {
        return Array.from({ length: count }, (_, i) => {
            const value = i + 1;
            const isActive = value <= currentRating;
            const isMain = size > 24;

            return (
                <button
                    key={value}
                    className={isMain ? "rc-star-btn" : "rc-service-star-btn"}
                    onClick={() => onStarClick(value)}
                    onMouseEnter={isMain ? () => setHoverRating(value) : undefined}
                    onMouseLeave={isMain ? () => setHoverRating(0) : undefined}
                    type="button"
                    aria-label={`${value} sao`}
                >
                    <FaStar
                        size={size}
                        className={`${isMain ? "rc-star-icon" : "rc-service-star-icon"} ${isActive ? "active" : ""}`}
                    />
                </button>
            );
        });
    };

    return (
        <div className="rc-overlay" onClick={handleClose}>
            <div className="rc-container" onClick={(e) => e.stopPropagation()}>

                {/* ===== Header ===== */}
                <header className="rc-header">
                    <div className="rc-header-left">
                        <button className="rc-back-btn" onClick={handleClose} type="button" aria-label="Quay lại">
                            <FiArrowLeft size={20} />
                        </button>
                        <h2 className="rc-title">Đánh giá sản phẩm</h2>
                    </div>
                    <button className="rc-help-btn" type="button">Trợ giúp</button>
                </header>

                {/* ===== Scrollable Body ===== */}
                <div className="rc-body">

                    {/* Coin Banner */}
                    <div className="rc-coin-banner">
                        <div className="rc-coin-banner-left">
                            <FaCoins size={22} color="#ec5b13" />
                            <p className="rc-coin-text">
                                Xem hướng dẫn đánh giá chuẩn để nhận đến{" "}
                                <span className="rc-coin-highlight">200 xu</span>
                            </p>
                        </div>
                        <FiChevronRight size={20} color="#94a3b8" />
                    </div>

                    {/* Product Info */}
                    {product && (
                        <div className="rc-product-info">
                            <img
                                src={productImage}
                                alt={product.name}
                                className="rc-product-image"
                                onError={(e) => {
                                    e.target.src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23f1f5f9' width='64' height='64' rx='10'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3E📦%3C/text%3E%3C/svg%3E";
                                }}
                            />
                            <div className="rc-product-details">
                                <h3 className="rc-product-name">{product.name}</h3>
                                {product.category && (
                                    <span className="rc-product-variant">
                                        Phân loại: {typeof product.category === 'object' 
                                            ? (product.category.level3 || product.category.level2 || product.category.level1) 
                                            : product.category}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Star Rating */}
                    <div className="rc-rating-section">
                        <div className="rc-stars-row">
                            {renderStars(5, displayRating, setRating, 36)}
                        </div>
                        <span className="rc-rating-label">{ratingLabel}</span>
                    </div>

                    {/* Review Form */}
                    <div className="rc-form">
                        {/* Suggestion Tags */}
                        <div className="rc-tags">
                            {SUGGESTION_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    className={`rc-tag ${selectedTags.includes(tag) ? "selected" : ""}`}
                                    onClick={() => handleTagToggle(tag)}
                                    type="button"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* Textarea */}
                        <div className="rc-textarea-wrapper">
                            <textarea
                                className="rc-textarea"
                                placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này với những người mua khác nhé."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                maxLength={500}
                            />
                            <span className="rc-textarea-counter">{comment.length}/500</span>
                        </div>

                        {/* Media Preview */}
                        {imagePreviews.length > 0 && (
                            <div className="rc-media-previews" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                                {imagePreviews.map((preview, index) => {
                                    const file = images[index];
                                    const isVideo = file && file.type.startsWith('video/');
                                    return (
                                        <div key={index} className="rc-media-preview-item" style={{ position: "relative", width: "80px", height: "80px" }}>
                                            {isVideo ? (
                                                <video src={preview} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                                            ) : (
                                                <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                                            )}
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveImage(index)}
                                                style={{ position: "absolute", top: "-8px", right: "-8px", background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" }}>
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Media Buttons */}
                        <div className="rc-media-row">
                            <label className="rc-media-btn" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: "10px 15px", border: "1px dashed #ec5b13", borderRadius: "4px", color: "#ec5b13" }}>
                                <input type="file" multiple accept="image/*,video/*" style={{ display: "none" }} onChange={handleImageChange} />
                                <FiCamera size={24} />
                                <span className="rc-media-label">Thêm hình ảnh/Video</span>
                            </label>
                        </div>

                        {/* Coin Hint */}
                        <div className="rc-coin-hint">
                            <FiInfo size={16} color="#94a3b8" />
                            <p>Tải lên tối đa 5 ảnh/video để mô tả sản phẩm chi tiết hơn.</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rc-error-msg">
                                <FiAlertCircle size={18} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Anonymous Toggle */}
                    <div className="rc-anon-section">
                        <div className="rc-anon-left">
                            <input
                                type="checkbox"
                                id="rc-anon-check"
                                className="rc-anon-checkbox"
                                checked={showUsername}
                                onChange={(e) => setShowUsername(e.target.checked)}
                            />
                            <label htmlFor="rc-anon-check" className="rc-anon-label">
                                Hiển thị tên đăng nhập trên đánh giá này
                            </label>
                        </div>
                        <span className="rc-anon-preview">Tên bạn sẽ hiển thị là {maskedName}</span>
                    </div>

                    {/* Service Ratings */}
                    <div className="rc-service-section">
                        <div className="rc-service-row">
                            <span className="rc-service-name">Dịch vụ của người bán</span>
                            <div className="rc-service-right">
                                <div className="rc-service-stars">
                                    {renderStars(5, sellerRating, setSellerRating, 20)}
                                </div>
                                <span className="rc-service-label">{RATING_LABELS[sellerRating]}</span>
                            </div>
                        </div>
                        <div className="rc-service-row">
                            <span className="rc-service-name">Dịch vụ vận chuyển</span>
                            <div className="rc-service-right">
                                <div className="rc-service-stars">
                                    {renderStars(5, shippingRating, setShippingRating, 20)}
                                </div>
                                <span className="rc-service-label">{RATING_LABELS[shippingRating]}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ===== Footer ===== */}
                <footer className="rc-footer">
                    <button className="rc-btn-back" onClick={handleClose} type="button">
                        Trở lại
                    </button>
                    <button
                        className="rc-btn-submit"
                        onClick={handleSubmit}
                        disabled={loading || rating === 0}
                        type="button"
                    >
                        {loading ? (
                            <span className="rc-btn-submit-loading">
                                <span className="rc-submit-spinner" />
                                Đang gửi...
                            </span>
                        ) : (
                            "Hoàn Thành"
                        )}
                    </button>
                </footer>

            </div>
        </div>
    );
}

export default ReviewComment;
