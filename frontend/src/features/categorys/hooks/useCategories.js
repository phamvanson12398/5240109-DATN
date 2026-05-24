import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../categorySlice";

/**
 * Hook quản lý nghiệp vụ Category
 */
export const useCategories = () => {
    const dispatch = useDispatch();

    const {
        categories,
        loading,
        error
    } = useSelector((state) => state.category);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const transformCategory = (category) => {
        if (!category) return null;

        return {
            id: category._id || category.id,
            name: category.name || "Chưa có tên danh mục",
            description: category.description || "Chưa có mô tả"
        };
    };

    const filteredCategories = useMemo(() => {
        if (!Array.isArray(categories)) return [];

        return categories
            .map(transformCategory)
            .filter(Boolean);
    }, [categories]);

    return {
        categories: filteredCategories,
        loading,
        error,
        totalCount: filteredCategories.length,
        refetch: () => dispatch(fetchCategories())
    };
};