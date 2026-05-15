import React from "react";
import SortIcon from "@mui/icons-material/Sort";
import FilterListIcon from "@mui/icons-material/FilterList";

function ProductToolbar({
  productCount,
  keyword,
  sortBy,
  onSortChange,
  onOpenMobileFilter,
}) {
  const pageTitle = keyword ? `Kết quả cho "${keyword}"` : "Sản phẩm";
  const resultLabel =
    productCount > 0
      ? `${productCount.toLocaleString("vi-VN")} sản phẩm`
      : "Không có sản phẩm";

  return (
    <header className="mb-8 space-y-6">
      <div className="space-y-3">
     

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          {/* <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">
              {pageTitle}
            </h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Khám phá những thiết kế tối giản, hiện đại và dễ mặc mỗi ngày.
            </p>
          </div> */}

        </div>
      </div>

      <div className="flex flex-col gap-3 border-y border-[#E5E7EB] bg-white/70 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:rounded-xl sm:border">
       

        <div className="flex items-center gap-3">
          <div className="relative min-w-[190px] flex-1 sm:flex-none">
            <select
              value={sortBy}
              onChange={onSortChange}
              className="h-11 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-4 pr-11 text-sm font-medium text-[#111827] outline-none transition focus:border-[#E85D75] focus:ring-4 focus:ring-[#E85D75]/10"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: thấp đến cao</option>
              <option value="price_desc">Giá: cao đến thấp</option>
              <option value="rating_desc">Đánh giá cao</option>
              <option value="bestselling">Bán chạy</option>
            </select>
            <SortIcon className="pointer-events-none absolute right-4 top-1/2 !text-[18px] -translate-y-1/2 text-[#6B7280]" />
          </div>

          <button
            type="button"
            onClick={onOpenMobileFilter}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:border-[#E85D75] hover:text-[#E85D75] lg:hidden"
          >
            <FilterListIcon className="!text-[18px]" />
            Lọc
          </button>
        </div>
      </div>
    </header>
  );
}

export default ProductToolbar;
