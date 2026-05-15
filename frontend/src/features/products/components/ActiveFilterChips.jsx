import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { PRICE_MAX, PRICE_MIN } from "@/features/products/constants/productFilters.constants";

function ActiveFilterChips({
  selectedCategories,
  keyword,
  priceRange,
  onCategoryToggle,
  onClearKeyword,
  onClearPrice,
  onClearAll,
}) {
  const hasPriceFilter = priceRange.min > PRICE_MIN || priceRange.max < PRICE_MAX;
  const hasFilters = selectedCategories.length > 0 || keyword || hasPriceFilter;

  if (!hasFilters) return null;

  const chipClass =
    "flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:border-[#E85D75]";

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {selectedCategories.map((category) => (
        <span key={category} className={chipClass}>
          {category.replace(/-/g, " ")}
          <button
            type="button"
            onClick={() => onCategoryToggle(category)}
            className="text-[#6B7280] transition hover:text-[#E85D75]"
            aria-label={`Xóa ${category}`}
          >
            <CloseIcon className="!text-[14px]" />
          </button>
        </span>
      ))}

      {keyword && (
        <span className={chipClass}>
          Tìm: {keyword}
          <button
            type="button"
            onClick={onClearKeyword}
            className="text-[#6B7280] transition hover:text-[#E85D75]"
            aria-label="Xóa từ khóa"
          >
            <CloseIcon className="!text-[14px]" />
          </button>
        </span>
      )}

      {hasPriceFilter && (
        <span className={chipClass}>
          Giá: {priceRange.min.toLocaleString("vi-VN")} -{" "}
          {priceRange.max.toLocaleString("vi-VN")}
          <button
            type="button"
            onClick={onClearPrice}
            className="text-[#6B7280] transition hover:text-[#E85D75]"
            aria-label="Xóa khoảng giá"
          >
            <CloseIcon className="!text-[14px]" />
          </button>
        </span>
      )}

      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 text-xs font-semibold text-[#6B7280] underline underline-offset-4 transition hover:text-[#E85D75]"
      >
        Xóa tất cả bộ lọc
      </button>
    </div>
  );
}

export default ActiveFilterChips;
