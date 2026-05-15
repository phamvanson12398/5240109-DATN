import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getProduct } from "@/features/products/productSlice";

function useProductFetch({
  appliedPrice,
  category,
  currentPage,
  inStockOnly,
  keyword,
  selectedRating,
  sortBy,
}) {
  const dispatch = useDispatch();
  const {
    loading,
    error,
    products = [],
    productCount = 0,
    hasResults,
    relatedProducts = [],
    resultPerPage,
  } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(
      getProduct({
        keyword,
        page: currentPage,
        category,
        price: appliedPrice,
        sort: sortBy,
        ratings: selectedRating ? { gte: selectedRating } : null,
        inStock: inStockOnly,
      }),
    );
  }, [
    dispatch,
    currentPage,
    category,
    keyword,
    appliedPrice,
    sortBy,
    selectedRating,
    inStockOnly,
  ]);

  return {
    error,
    hasResults,
    loading,
    productCount,
    products,
    relatedProducts,
    resultPerPage,
  };
}

export default useProductFetch;
