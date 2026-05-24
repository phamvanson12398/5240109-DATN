import React from "react";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

/**
 * Component hiển thị chi tiết một Category.
 */
const CategoryCard = ({ category }) => {
    const categoryName = category?.name || "Chưa có tên danh mục";
    const categoryDescription = category?.description || "Chưa có mô tả";

    return (
        <div className="category-card">
            <div className="category-left">
                <div className="category-icon">
                    <CategoryOutlinedIcon />
                </div>
            </div>

            <div className="category-right">
                <div className="category-info-group">
                    <h3 className="category-title">
                        {categoryName}
                    </h3>

                    <p className="category-description">
                        {categoryDescription}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CategoryCard;