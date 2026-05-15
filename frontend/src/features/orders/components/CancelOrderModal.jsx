import React, { useState } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";
import "@/features/orders/styles/CancelOrderModal.css";

const CANCELLATION_REASONS = [
    "Muốn thay đổi địa chỉ nhận hàng",
    "Muốn nhập/thay đổi mã giảm giá",
    "Tìm thấy giá rẻ hơn ở nơi khác",
    "Không còn nhu cầu mua nữa",
    "Thủ tục thanh toán quá rắc rối",
    "Khác",
];

/**
 * CancelOrderModal - Modal chọn lý do hủy đơn hàng (Shopee Style)
 * 
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {function} onClose - Hàm đóng modal
 * @param {function} onConfirm - Hàm xác nhận hủy với lý do { reason }
 * @param {string} orderId - ID của đơn hàng đang thao tác
 */
const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderId }) => {
    const [selectedReason, setSelectedReason] = useState("");
    const [otherReason, setOtherReason] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        const finalReason = selectedReason === "Khác" ? otherReason : selectedReason;
        if (!finalReason) return;
        
        onConfirm(finalReason);
        handleClose();
    };

    const handleClose = () => {
        setSelectedReason("");
        setOtherReason("");
        onClose();
    };

    const isSubmitDisabled = !selectedReason || (selectedReason === "Khác" && !otherReason.trim());

    return (
        <div className="com-overlay" onClick={handleClose}>
            <div className="com-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <header className="com-header">
                    <h2 className="com-title">Lý do hủy đơn</h2>
                    <button className="com-close-btn" onClick={handleClose}>
                        <FiX />
                    </button>
                </header>

                {/* Body */}
                <div className="com-body">
                    {/* Hint Box */}
                    <div className="com-hint">
                        <FiAlertCircle className="com-hint-icon" size={20} />
                        <p className="com-hint-text">
                            {orderId ? `Đơn hàng #${String(orderId).slice(-8).toUpperCase()}. ` : ''}
                            Vui lòng chọn lý do hủy đơn. Lưu ý: Thao tác này không thể hoàn tác và các mã giảm giá (nếu có) có thể không còn hiệu lực.
                        </p>
                    </div>

                    {/* Reason List */}
                    <div className="com-reason-list">
                        {CANCELLATION_REASONS.map((reason, index) => (
                            <label key={index} className="com-reason-item">
                                <input
                                    type="radio"
                                    name="cancelReason"
                                    className="com-radio"
                                    value={reason}
                                    checked={selectedReason === reason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                />
                                <span className="com-reason-label">{reason}</span>
                            </label>
                        ))}
                    </div>

                    {/* Other Reason Input */}
                    {selectedReason === "Khác" && (
                        <textarea
                            className="com-other-input"
                            placeholder="Vui lòng nhập lý do cụ thể (tối thiểu 10 ký tự)..."
                            rows={3}
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                        />
                    )}
                </div>

                {/* Footer */}
                <footer className="com-footer">
                    <button className="com-btn com-btn-cancel" onClick={handleClose}>
                        ĐÓNG
                    </button>
                    <button
                        className="com-btn com-btn-submit"
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                    >
                        XÁC NHẬN HỦY
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CancelOrderModal;
