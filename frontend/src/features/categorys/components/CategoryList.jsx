import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import CategoryCard from "./CategoryCard";

/**
 * Component hiển thị danh sách Category kèm trạng thái loading/no-data.
 */
const CategoryList = ({
    categories,
    loading,
    onRetry
}) => {
    const hasCategories = Array.isArray(categories) && categories.length > 0;

    if (loading) {
        return (
            <div className="loading-state">
                <CircularProgress size={34} thickness={4} sx={{ color: "#E85D75" }} />
                <p>Đang tải danh mục...</p>
            </div>
        );
    }

    if (!hasCategories) {
        return (
            <div className="no-categories">
                <div className="empty-category-icon">
                    <SearchOffOutlinedIcon />
                </div>

                <h3>Hiện chưa có danh mục nào</h3>
                <p>Các danh mục sản phẩm sẽ được cập nhật tại đây.</p>

                {onRetry && (
                    <button type="button" onClick={onRetry} className="retry-btn">
                        Tải lại
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="category-list">
            {categories.map((category) => (
                <CategoryCard
                    key={category.id || category._id}
                    category={category}
                />
            ))}
        </div>
    );
};

export default CategoryList;