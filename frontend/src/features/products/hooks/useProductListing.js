import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { removeErrors } from "@/features/products/productSlice";

import useProductDrawer from "./useProductDrawer";
import useProductFetch from "./useProductFetch";
import useProductFilters from "./useProductFilters";
import useProductQueryParams from "./useProductQueryParams";

function useProductListing() {
  const dispatch = useDispatch();
  const { isMobileDrawerOpen, setIsMobileDrawerOpen } = useProductDrawer();
  const {
    categoryFromURL,
    clearProductQuery,
    keyword,
    pageFromURL,
    updateCategoryParam,
    updatePageParam,
  } = useProductQueryParams();
  const [currentPage, setCurrentPage] = useState(pageFromURL);

  useEffect(() => {
    setCurrentPage((page) => (page === pageFromURL ? page : pageFromURL));
  }, [pageFromURL]);
  const {
    activeFilterCount,
    appliedPrice,
    handleApplyPrice,
    handleCategoryToggle,
    handleClearAll,
    handleClearPrice,
    handlePresetClick,
    handleRatingChange,
    handleSortChange,
    inStockOnly,
    priceError,
    priceRange,
    selectedCategories,
    selectedRating,
    setPriceError,
    setPriceRange,
    sortBy,
  } = useProductFilters({
    categoryFromURL,
    clearProductQuery,
    setCurrentPage,
    updateCategoryParam,
  });
  const {
    error,
    hasResults,
    loading,
    productCount,
    products,
    relatedProducts,
    resultPerPage,
  } = useProductFetch({
    appliedPrice,
    category: categoryFromURL,
    currentPage,
    inStockOnly,
    keyword,
    selectedRating,
    sortBy,
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message, { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      updatePageParam(page);
    }
  };

  return {
    activeFilterCount,
    currentPage,
    handleApplyPrice,
    handleCategoryToggle,
    handleClearAll,
    handleClearPrice,
    handlePageChange,
    handlePresetClick,
    handleRatingChange,
    handleSortChange,
    isMobileDrawerOpen,
    keyword,
    loading,
    priceError,
    priceRange,
    productCount,
    products,
    relatedProducts,
    selectedCategories,
    selectedRating,
    setIsMobileDrawerOpen,
    setPriceError,
    setPriceRange,
    sortBy,
    hasResults,
    resultPerPage,
  };
}

export default useProductListing;
