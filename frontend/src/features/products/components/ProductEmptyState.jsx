import React from "react";
import { SearchX } from "lucide-react";
import RelatedProductsSection from "./RelatedProductsSection";

function ProductEmptyState({ keyword, onResetFilters, relatedProducts }) {
  return (
    <div>
      <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-6 py-14 text-center shadow-[0_10px_30px_rgba(17,24,39,0.04)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FAFAFA] text-[#6B7280]">
          <SearchX size={28} strokeWidth={1.5} />
        </div>

        <h3 className="mx-auto max-w-lg text-xl font-semibold text-[#111827]">
          {keyword
            ? `Không tìm thấy sản phẩm phù hợp cho "${keyword}"`
            : "Không tìm thấy sản phẩm phù hợp"}
        </h3>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6B7280]">
          Hãy thử từ khóa khác hoặc điều chỉnh lại danh mục, khoảng giá và đánh giá.
        </p>

        {onResetFilters && (
          <button
            type="button"
            className="mt-7 h-11 rounded-xl bg-[#E85D75] px-6 text-sm font-semibold text-white transition hover:bg-[#d94b65] focus:outline-none focus:ring-4 focus:ring-[#E85D75]/20"
            onClick={onResetFilters}
          >
            Xóa tất cả bộ lọc
          </button>
        )}
      </div>

      <RelatedProductsSection
        products={relatedProducts}
        title="Sản phẩm liên quan"
      />
    </div>
  );
}

export default ProductEmptyState;
