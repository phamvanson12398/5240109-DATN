import React from "react";
import {
  PRICE_MAX,
  PRODUCT_PRICE_PRESETS,
} from "@/features/products/constants/productFilters.constants";

function ProductPriceFilter({
  handleApplyPrice,
  handlePresetClick,
  priceError,
  priceRange,
  setPriceError,
  setPriceRange,
}) {
  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[#111827]">Khoảng giá</h3>
        <p className="mt-1 text-xs text-[#6B7280]">Chọn ngân sách phù hợp.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          className="h-11 min-w-0 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#E85D75] focus:ring-4 focus:ring-[#E85D75]/10"
          placeholder="Tối thiểu"
          value={priceRange.min || ""}
          onChange={(event) => {
            const value = event.target.value === "" ? 0 : Number(event.target.value);
            setPriceRange({ ...priceRange, min: value });
            setPriceError("");
          }}
        />

        <input
          type="number"
          className="h-11 min-w-0 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#E85D75] focus:ring-4 focus:ring-[#E85D75]/10"
          placeholder="Tối đa"
          value={priceRange.max >= PRICE_MAX ? "" : priceRange.max}
          onChange={(event) => {
            const value = event.target.value === "" ? PRICE_MAX : Number(event.target.value);
            setPriceRange({ ...priceRange, max: value });
            setPriceError("");
          }}
        />
      </div>

      {priceError && (
        <p className="rounded-lg bg-[#DC2626]/10 px-3 py-2 text-xs font-medium text-[#DC2626]">
          {priceError}
        </p>
      )}

      <button
        type="button"
        className="h-11 w-full rounded-xl bg-[#E85D75] px-4 text-sm font-semibold text-white transition hover:bg-[#d94b65] focus:outline-none focus:ring-4 focus:ring-[#E85D75]/20 active:scale-[0.99]"
        onClick={handleApplyPrice}
      >
        Áp dụng
      </button>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
          Gợi ý giá
        </p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_PRICE_PRESETS.map((preset) => {
            const isActive =
              priceRange.min === preset.min && priceRange.max === preset.max;

            return (
              <button
                key={preset.label}
                type="button"
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "border-[#E85D75] bg-[#E85D75] text-white"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#E85D75] hover:text-[#E85D75]"
                }`}
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default React.memo(ProductPriceFilter);
