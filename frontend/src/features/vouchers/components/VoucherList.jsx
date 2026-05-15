import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import LocalActivityOutlinedIcon from "@mui/icons-material/LocalActivityOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import VoucherCard from "./VoucherCard";

/**
 * Component hien thi danh sach cac the Voucher kem trang thai loading/no-data.
 */
const VoucherList = ({
    vouchers,
    loading,
    viewMode,
    onClaim,
    claimLoading,
    onRetry
}) => {
    const hasVouchers = Array.isArray(vouchers) && vouchers.length > 0;

    if (loading) {
        return (
            <div className="loading-state">
                <CircularProgress size={34} thickness={4} sx={{ color: "#E85D75" }} />
                <p>Đang tải kho mã giảm giá...</p>
            </div>
        );
    }

    if (!hasVouchers) {
        const emptyTitle = viewMode === "my_vouchers"
            ? "Bạn chưa lưu mã giảm giá nào"
            : "Hiện chưa có mã giảm giá phù hợp";

        return (
            <div className="no-vouchers">
                <div className="empty-voucher-icon">
                    {viewMode === "my_vouchers" ? (
                        <LocalActivityOutlinedIcon />
                    ) : (
                        <SearchOffOutlinedIcon />
                    )}
                </div>
                <h3>{emptyTitle}</h3>
                <p>Các ưu đãi mới sẽ được cập nhật tại đây.</p>
                {onRetry && (
                    <button type="button" onClick={onRetry} className="retry-btn">
                        Tải lại
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="voucher-list">
            {vouchers.map((voucher) => (
                <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    viewMode={viewMode}
                    onClaim={onClaim}
                    claimLoading={claimLoading}
                />
            ))}
        </div>
    );
};

export default VoucherList;
