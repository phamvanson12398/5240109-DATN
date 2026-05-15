import { useEffect, useState } from "react";

import {
  PRICE_MAX,
  PRICE_MIN,
} from "@/features/products/constants/productFilters.constants";

function getCategoriesFromURL(categoryFromURL) {
  return categoryFromURL ? [categoryFromURL] : [];
}

function areCategoriesEqual(first, second) {
  return first.length === second.length && first.every((item, index) => item === second[index]);
}

function useProductFilters({
  categoryFromURL,
  clearProductQuery,
  setCurrentPage,
  updateCategoryParam,
}) {
  const [selectedCategories, setSelectedCategories] = useState(
    getCategoriesFromURL(categoryFromURL),
  );
  const [priceRange, setPriceRange] = useState({
    min: PRICE_MIN,
    max: PRICE_MAX,
  });
  const [appliedPrice, setAppliedPrice] = useState(null);
  const [priceError, setPriceError] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const nextCategories = getCategoriesFromURL(categoryFromURL);

    setSelectedCategories((currentCategories) =>
      areCategoriesEqual(currentCategories, nextCategories)
        ? currentCategories
        : nextCategories,
    );
  }, [categoryFromURL]);

  const handleCategoryToggle = (category) => {
    const isRemoving = selectedCategories.includes(category);

    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      }

      return [category];
    });

    setCurrentPage(1);
    updateCategoryParam(category, isRemoving);
  };

  const handleApplyPrice = () => {
    if (priceRange.min > 0 && priceRange.max > 0 && priceRange.min > priceRange.max) {
      setPriceError("Kho\u1ea3ng gi\u00e1 kh\u00f4ng h\u1ee3p l\u1ec7");
      return;
    }

    setPriceError("");
    const newPrice =
      priceRange.min > PRICE_MIN || priceRange.max < PRICE_MAX
        ? { gte: priceRange.min, lte: priceRange.max }
        : null;

    setAppliedPrice(newPrice);
    setCurrentPage(1);
  };

  const handlePresetClick = (preset) => {
    setPriceRange({ min: preset.min, max: preset.max });
    setAppliedPrice({ gte: preset.min, lte: preset.max });
    setPriceError("");
    setCurrentPage(1);
  };

  const handleClearPrice = () => {
    setPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
    setAppliedPrice(null);
    setPriceError("");
    setCurrentPage(1);
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(rating === selectedRating ? null : rating);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
    setAppliedPrice(null);
    setSelectedRating(null);
    setInStockOnly(false);
    setSortBy("newest");
    setCurrentPage(1);
    clearProductQuery();
  };

  const activeFilterCount =
    selectedCategories.length +
    (appliedPrice ? 1 : 0) +
    (selectedRating ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  return {
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
  };
}

export default useProductFilters;
