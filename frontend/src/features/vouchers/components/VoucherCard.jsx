import React from "react";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";

/**
 * Component hien thi chi tiet mot the Voucher.
 */
const VoucherCard = ({ voucher, viewMode, onClaim, claimLoading }) => {
    const isUsed = voucher.status === "used";
    const usedPercent = Math.max(0, Math.min(Number(voucher.usedPercent) || 0, 100));
    const voucherCode = voucher.code || voucher.title || voucher.originalId;
    const isClaimDisabled = claimLoading || usedPercent >= 100;

    return (
        <div className={`voucher-card type-${voucher.type} ${isUsed ? "is-used" : ""}`}>
            <div className="voucher-left">
                <div className="voucher-icon">
                    <ConfirmationNumberOutlinedIcon />
                </div>
                <span className="voucher-badge-type">{voucher.badgeLabel}</span>
                <span className="voucher-discount">{voucher.discount}</span>
            </div>

            <div className="voucher-divider" aria-hidden="true" />

            <div className="voucher-right">
                <div className="voucher-info-group">
                    <div className="voucher-title-row">
                        <h3 className="voucher-title">{voucher.title}</h3>
                        <span className="voucher-code-badge">{voucherCode}</span>
                    </div>
                    <p className="voucher-condition">{voucher.condition}</p>
                </div>

                <div className="voucher-actions">
                    <div className="voucher-status-info">
                        <span className="voucher-status-text">
                            <CardGiftcardOutlinedIcon />
                            {viewMode === "my_vouchers" ? "Mã giảm giá đã lưu" : `Đã dùng ${usedPercent}%`}
                        </span>
                        <span className="voucher-expiry">
                            <AccessTimeOutlinedIcon />
                            {voucher.expiry}
                        </span>
                    </div>

                    <div className="voucher-progress" aria-hidden="true">
                        <div
                            className="progress-fill"
                            style={{ width: `${usedPercent}%` }}
                        />
                    </div>

                    {viewMode === "my_vouchers" ? (
                        <button
                            type="button"
                            className={`use-btn saved ${isUsed ? "used" : ""}`}
                            disabled={isUsed}
                        >
                            {isUsed ? (
                                "Đã sử dụng"
                            ) : (
                                <>
                                    <CheckCircleOutlineIcon fontSize="small" />
                                    Đã lưu
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={`use-btn claim-btn ${claimLoading ? "loading" : ""}`}
                            disabled={isClaimDisabled}
                            onClick={() => onClaim(voucher.originalId)}
                        >
                            {claimLoading ? "Đang lưu..." : usedPercent >= 100 ? "Hết lượt" : "Lưu mã giảm giá"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoucherCard;
