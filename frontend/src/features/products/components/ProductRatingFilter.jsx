import React from "react";
import { Star } from "lucide-react";
import { PRODUCT_FILTER_RATINGS } from "@/features/products/constants/productFilters.constants";

function ProductRatingFilter({
  handleRatingChange,
  isMobile = false,
  selectedRating,
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[#111827]">Đánh giá</h3>
        <p className="mt-1 text-xs text-[#6B7280]">Lọc theo mức sao khách hàng.</p>
      </div>

      <div className="space-y-2">
        {PRODUCT_FILTER_RATINGS.map((rating) => (
          <label
            key={rating}
            htmlFor={`${isMobile ? "mobile-" : ""}rating-${rating}`}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[#FAFAFA]"
          >
            <input
              type="checkbox"
              id={`${isMobile ? "mobile-" : ""}rating-${rating}`}
              className="h-4 w-4 rounded border-[#E5E7EB] text-[#E85D75] focus:ring-[#E85D75]/20"
              checked={selectedRating === rating}
              onChange={() => handleRatingChange(rating)}
            />
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    star <= rating
                      ? "fill-[#F59E0B] text-[#F59E0B]"
                      : "fill-[#E5E7EB] text-[#E5E7EB]"
                  }
                />
              ))}
            </span>
            <span className="text-xs font-medium text-[#6B7280]">
              {rating === 5 ? "5 sao" : `${rating} sao trở lên`}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}

export default React.memo(ProductRatingFilter);
