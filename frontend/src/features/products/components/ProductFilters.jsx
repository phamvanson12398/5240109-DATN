import React from "react";
import ProductCategoryFilter from "./ProductCategoryFilter";
import ProductPriceFilter from "./ProductPriceFilter";
import ProductRatingFilter from "./ProductRatingFilter";

function ProductFilters({
  handleApplyPrice,
  handleCategoryToggle,
  handlePresetClick,
  handleRatingChange,
  isMobile = false,
  priceError,
  priceRange,
  selectedCategories,
  selectedRating,
  setPriceError,
  setPriceRange,
}) {
  return (
    <div className="flex flex-col gap-7">
      <ProductCategoryFilter
        handleCategoryToggle={handleCategoryToggle}
        selectedCategories={selectedCategories}
      />
      <div className="h-px bg-[#E5E7EB]" />
      <ProductPriceFilter
        handleApplyPrice={handleApplyPrice}
        handlePresetClick={handlePresetClick}
        priceError={priceError}
        priceRange={priceRange}
        setPriceError={setPriceError}
        setPriceRange={setPriceRange}
      />
      <div className="h-px bg-[#E5E7EB]" />
      <ProductRatingFilter
        handleRatingChange={handleRatingChange}
        isMobile={isMobile}
        selectedRating={selectedRating}
      />
    </div>
  );
}

export default React.memo(ProductFilters);
