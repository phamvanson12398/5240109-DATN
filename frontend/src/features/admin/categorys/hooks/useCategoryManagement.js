import { useEffect, useMemo, useState } from "react";
import { categoryApi } from "../api/categoryApi.js";

export function useCategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const removeVietnameseTones = (str = "") => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase();
    };
    const [isOpenModal, setIsOpenModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const fetchCategories = async () => {
        try {
            const data = await categoryApi.fetchCategories();
            setCategories(data || []);
        } catch (error) {
            console.log("Lỗi khi lấy danh mục:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);


    
    const filteredCategories = useMemo(() => {
        const keyword = removeVietnameseTones(searchTerm.trim());

        if (!keyword) {
            return categories;
        }

        return categories.filter((category) => {
            const name = removeVietnameseTones(category.name || "");
            const description = removeVietnameseTones(
                category.description || ""
            );

            return (
                name.includes(keyword) ||
                description.includes(keyword)
            );
        });
    }, [categories, searchTerm]);

    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return filteredCategories.slice(startIndex, endIndex);
    }, [filteredCategories, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const openModal = () => setIsOpenModal(true);
    const closeModal = () => setIsOpenModal(false);

    return {
        categories,
        filteredCategories,
        paginatedCategories,

        searchTerm,
        setSearchTerm,

        isOpenModal,
        openModal,
        closeModal,

        fetchCategories,

        currentPage,
        setCurrentPage,
        itemsPerPage,
    };
}