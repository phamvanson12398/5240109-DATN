import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { 
    fetchMyVouchers, 
    fetchActiveVouchers, 
    claimVoucher, 
    resetClaimState 
} from "../voucherSlice";
import formatVND from "@/shared/utils/formatCurrency";
import { TicketPercent, Gift, Truck, Store } from "lucide-react";

/**
 * Hook quản lý nghiệp vụ Voucher: Lọc, Chuyển đổi dữ liệu và Hành động (Claim)
 */
export const useVouchers = (viewMode) => {
    const dispatch = useDispatch();
    const { 
        myVouchers, 
        activeVouchers, 
        loading, 
        claimLoading, 
        claimSuccess, 
        error 
    } = useSelector((state) => state.voucher);

    const [activeTab, setActiveTab] = useState("all");

    // Fetch dữ liệu dựa trên chế độ xem
    useEffect(() => {
        if (viewMode === "my_vouchers") {
            dispatch(fetchMyVouchers());
        } else {
            dispatch(fetchActiveVouchers());
        }
    }, [dispatch, viewMode]);

    // Xử lý thông báo sau khi lưu voucher
    useEffect(() => {
        if (claimSuccess) {
            toast.success("Đã lưu mã giảm giá vào kho của bạn.");
            dispatch(resetClaimState());
        }
        if (error && viewMode === "voucher_center") {
            toast.error(error);
            dispatch(resetClaimState());
        }
    }, [claimSuccess, error, dispatch, viewMode]);

    const handleClaim = (voucherId) => {
        dispatch(claimVoucher(voucherId));
    };

    /**
     * Chuyển đổi dữ liệu từ API sang Schema hiển thị của UI
     */
    const transformVoucher = (data, isOwned = true) => {
        const v = isOwned ? data.voucher : data;
        if (!v) return null;

        // Xác định icon và badge dựa trên type
        const typeConfigs = {
            freeship: { Icon: Truck, label: "Miễn phí vận chuyển" },
            shop: { Icon: Store, label: "Độc quyền từ cửa hàng" },
            discount: { Icon: Gift, label: "Ưu đãi giảm giá" },
            default: { Icon: TicketPercent, label: "Mã khuyến mãi" }
        };

        const config = typeConfigs[v.type] || typeConfigs.default;

        const discountText = v.discount.type === "percentage" 
            ? `Giảm ${v.discount.value}%` 
            : `Giảm ${formatVND(v.discount.value)}`;

        const systemUsedPercent = v.conditions.usageLimit > 0 
            ? Math.round((v.usedCount / v.conditions.usageLimit) * 100) 
            : 0;

        return {
            id: isOwned ? data._id : v._id,
            originalId: v._id,
            type: v.type,
            Icon: config.Icon,
            badgeLabel: config.label,
            discount: discountText,
            title: v.title || v.code,
            condition: v.conditions.minOrderAmount > 0 
                ? `Đơn tối thiểu ${formatVND(v.conditions.minOrderAmount)}` 
                : "Không yêu cầu tối thiểu",
            expiry: `HSD: ${new Date(v.conditions.endDate).toLocaleDateString("vi-VN")}`,
            usedPercent: Math.min(systemUsedPercent, 100),
            status: isOwned ? data.status : "available",
            isOwned
        };
    };

    // Chuẩn bị danh sách hiển thị
    const filteredVouchers = useMemo(() => {
        const currentVouchers = viewMode === "my_vouchers" 
            ? myVouchers.map(uv => transformVoucher(uv, true))
            : activeVouchers.map(v => {
                const alreadyOwned = myVouchers.some(uv => uv.voucher?._id === v._id || uv.voucher === v._id);
                return transformVoucher(v, false, alreadyOwned);
            });

        const validVouchers = currentVouchers.filter(v => v !== null);

        return activeTab === "all"
            ? validVouchers
            : validVouchers.filter(v => v.type === activeTab);
    }, [myVouchers, activeVouchers, viewMode, activeTab]);

    return {
        vouchers: filteredVouchers,
        loading,
        claimLoading,
        activeTab,
        setActiveTab,
        handleClaim,
        totalCount: viewMode === "my_vouchers" ? myVouchers.length : activeVouchers.length
    };
};
