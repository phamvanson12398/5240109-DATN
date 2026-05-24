import React from "react";
import AccountSidebar from "@/features/user/components/AccountSidebar";
import PageTitle from "@/shared/components/PageTitle";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";

import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import "@/features/categorys/styles/Category.css";
import "@/features/user/styles/AccountShared.css";

// Import module Category
import { useCategories } from "@/features/categorys/hooks/useCategories";
import CategoryList from "@/features/categorys/components/CategoryList";

/**
 * PAGE: Danh mục sản phẩm
 */
const CategoryPageView = () => {

    // Sử dụng Custom Hook để lấy dữ liệu category
    const {
        categories,
        loading,
        totalCount,
        refetch
    } = useCategories();

    return (
        <>
            <PageTitle title="Danh mục sản phẩm" />

            <Navbar />

            <div className="account-container category-page">
                <div className="account-content">

                    <AccountSidebar />

                    <div className="account-main">

                        {/* HERO HEADER */}
                        <div className="account-hero">

                            <div className="hero-content">
                                <span className="hero-badge">
                                    Danh mục sản phẩm
                                </span>

                                <h1 className="hero-title">
                                    Khám phá danh mục sản phẩm
                                </h1>

                                <p className="hero-desc">
                                    Tìm kiếm các danh mục phù hợp với nhu cầu mua sắm của bạn.
                                </p>
                            </div>

                            <div className="hero-stats">
                                <p className="hero-stats-label">
                                    Tổng danh mục hiện có
                                </p>

                                <div className="hero-stats-number">
                                    <span className="number">
                                        {totalCount}
                                    </span>

                                    <span className="unit">
                                        danh mục
                                    </span>
                                </div>
                            </div>

                            <div className="hero-decoration-1"></div>
                            <div className="hero-decoration-2"></div>

                        </div>

                        {/* CATEGORY HEADER */}
                        <div className="voucher-mode-selector">

                            <button
                                type="button"
                                className="mode-btn active"
                            >
                                <CategoryOutlinedIcon fontSize="small" />
                                Danh sách danh mục
                            </button>

                        </div>

                        {/* DANH SÁCH CATEGORY */}
                        <CategoryList
                            categories={categories}
                            loading={loading}
                            onRetry={refetch}
                        />

                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default CategoryPageView;