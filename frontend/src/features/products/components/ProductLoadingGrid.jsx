import React from "react";

function ProductLoadingGrid({ count = 8 }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"
      aria-label="Đang tải sản phẩm"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(17,24,39,0.04)]"
        >
          <div className="aspect-[4/5] animate-pulse bg-[#F3F4F6]" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-20 animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="h-4 w-full animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-[#F3F4F6]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default React.memo(ProductLoadingGrid);
