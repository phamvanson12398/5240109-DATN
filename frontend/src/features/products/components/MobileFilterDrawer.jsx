import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import ProductFilters from "./ProductFilters";

function MobileFilterDrawer({
  isOpen,
  onClose,
  filterProps,
  activeFilterCount,
  onClearAll,
}) {
  return (
    <>
      {isOpen && (
        <>
          <div
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-[#111827]/45 backdrop-blur-sm lg:hidden"
          />

          <aside
            className="fixed bottom-0 right-0 top-0 z-[110] flex w-[88%] max-w-[420px] flex-col overflow-y-auto bg-white shadow-2xl lg:hidden"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-5 py-4">
              <div className="flex items-center gap-3 text-[#111827]">
                <FilterListIcon className="!text-[20px]" />
                <div>
                  <p className="text-sm font-semibold">Bộ lọc</p>
                  <p className="text-xs text-[#6B7280]">
                    {activeFilterCount > 0
                      ? `${activeFilterCount} bộ lọc đang chọn`
                      : "Tìm sản phẩm phù hợp"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#111827] transition hover:border-[#E85D75] hover:text-[#E85D75]"
                aria-label="Đóng bộ lọc"
              >
                <CloseIcon className="!text-[20px]" />
              </button>
            </div>

            <div className="flex-1 px-5 py-6">
              <ProductFilters {...filterProps} isMobile={true} />
            </div>

            <div className="sticky bottom-0 space-y-3 border-t border-[#E5E7EB] bg-white px-5 py-4">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#6B7280] transition hover:border-[#E85D75] hover:text-[#E85D75]"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="h-12 w-full rounded-xl bg-[#E85D75] text-sm font-semibold text-white transition hover:bg-[#d94b65] active:scale-[0.99]"
              >
                Xem kết quả
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

export default MobileFilterDrawer;
