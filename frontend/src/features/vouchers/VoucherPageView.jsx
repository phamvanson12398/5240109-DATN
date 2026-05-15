import React, { useState } from "react";
import AccountSidebar from "@/features/user/components/AccountSidebar";
import PageTitle from "@/shared/components/PageTitle";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import LocalActivityOutlinedIcon from "@mui/icons-material/LocalActivityOutlined";
import "@/features/vouchers/styles/Vouchers.css";
import "@/features/user/styles/AccountShared.css";

// Import từ module Voucher (Mô hình mới)
import { useVouchers } from "@/features/vouchers/hooks/useVouchers";
import VoucherList from "@/features/vouchers/components/VoucherList";

/**
 * PAGE: Kho Voucher / Mã giảm giá
 * Đây là bản refactor sử dụng mô hình Modular Feature-Based
 */
const VoucherPageView = () => {
    const [viewMode, setViewMode] = useState("my_vouchers"); // my_vouchers | voucher_center
    
    // Sử dụng Custom Hook để lấy logic và dữ liệu
    const { 
        vouchers, 
        loading, 
        claimLoading, 
        activeTab, 
        setActiveTab, 
        handleClaim,
        totalCount
    } = useVouchers(viewMode);

    const tabs = [
        { id: "all", label: "Tất Cả" },
        { id: "shop", label: "Mã giảm giá của cửa hàng" },
    ];

    return (
        <>
            <PageTitle title="Kho mã giảm giá" />
            <Navbar />
            <div className="account-container voucher-page">
                <div className="account-content">
                    <AccountSidebar />
                    <div className="account-main">
                        
                        {/* HERO HEADER */}
                        <div className="account-hero">
                            <div className="hero-content">
                                <span className="hero-badge">Trung tâm ưu đãi</span>
                                <h1 className="hero-title">
                                    Kho mã giảm giá của bạn
                                </h1>
                                <p className="hero-desc">
                                    Khám phá các ưu đãi đang có và lưu mã giảm giá phù hợp cho lần mua sắm tiếp theo.
                                </p>
                            </div>
                            <div className="hero-stats">
                                <p className="hero-stats-label">
                                    {viewMode === "my_vouchers" ? "Số lượng trong kho" : "Ưu đãi hiện có"}
                                </p>
                                <div className="hero-stats-number">
                                    <span className="number">{totalCount}</span>
                                    <span className="unit">mã</span>
                                </div>
                            </div>
                            <div className="hero-decoration-1"></div>
                            <div className="hero-decoration-2"></div>
                        </div>

                        {/* SELECTOR CHẾ ĐỘ (My Vouchers vs Center) */}
                        <div className="voucher-mode-selector">
                            <button 
                                type="button"
                                className={`mode-btn ${viewMode === "my_vouchers" ? "active" : ""}`}
                                onClick={() => { setViewMode("my_vouchers"); setActiveTab("all"); }}
                            >
                                <LocalActivityOutlinedIcon fontSize="small" />
                                Kho mã giảm giá của tôi
                            </button>
                            <button 
                                type="button"
                                className={`mode-btn center ${viewMode === "voucher_center" ? "active" : ""}`}
                                onClick={() => { setViewMode("voucher_center"); setActiveTab("all"); }}
                            >
                                <CardGiftcardOutlinedIcon fontSize="small" />
                                Mã giảm giá nổi bật
                            </button>
                        </div>

                        {/* THANH TAB LỌC */}
                        <div className="account-tab-group">
                            <div className="account-tabs">
                                {tabs.map(tab => (
                                    <button
                                        type="button"
                                        key={tab.id}
                                        className={`account-tab ${activeTab === tab.id ? "active" : ""}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* DANH SÁCH VOUCHER (Đã refactor thành component riêng) */}
                        <VoucherList 
                            vouchers={vouchers}
                            loading={loading}
                            viewMode={viewMode}
                            onClaim={handleClaim}
                            claimLoading={claimLoading}
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VoucherPageView;
