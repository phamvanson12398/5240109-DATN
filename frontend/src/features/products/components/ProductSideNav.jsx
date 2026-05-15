import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ManIcon from "@mui/icons-material/Man";
import WomanIcon from "@mui/icons-material/Woman";
import TransgenderIcon from "@mui/icons-material/Transgender";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { categoryTree } from "../config/categoryTree";
import ProductPriceFilter from "./ProductPriceFilter";
import ProductRatingFilter from "./ProductRatingFilter";

const iconClass = "!text-[18px] text-[#6B7280]";

const ICON_MAP = {
  nam: <ManIcon className={iconClass} />,
  nu: <WomanIcon className={iconClass} />,
  unisex: <TransgenderIcon className={iconClass} />,
  "phu-kien": <ShoppingBagIcon className={iconClass} />,
};

function ProductSideNav({
  handleApplyPrice,
  handlePresetClick,
  handleRatingChange,
  priceError,
  priceRange,
  selectedCategories,
  selectedRating,
  setPriceError,
  setPriceRange,
  onCategoryToggle,
}) {
  const [expandedIds, setExpandedIds] = useState(["nam", "nu"]);

  useEffect(() => {
    setExpandedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      categoryTree.forEach((category) => {
        const hasSelectedGroupItem = category.groups?.some((group) =>
          group.items.some((item) => selectedCategories.includes(item.value)),
        );
        const hasSelectedDirectItem = category.items?.some((item) =>
          selectedCategories.includes(item.value),
        );

        if (hasSelectedGroupItem || hasSelectedDirectItem) {
          nextIds.add(category.id);
        }
      });

      return nextIds.size === currentIds.length ? currentIds : Array.from(nextIds);
    });
  }, [selectedCategories]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const renderCategoryButton = (item) => {
    const isActive = selectedCategories.includes(item.value);

    return (
      <button
        key={item.value}
        type="button"
        onClick={() => onCategoryToggle(item.value)}
        className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
          isActive
            ? "bg-[#E85D75]/10 font-semibold text-[#E85D75]"
            : "font-medium text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111827]"
        }`}
      >
        {item.label}
      </button>
    );
  };

  return (
    <aside className="hidden w-[280px] shrink-0 lg:block">
      <div className="sidebar-sticky">
        <div className="product-filter-panel">
          <div className="border-b border-[#E5E7EB] pb-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6B7280]">
              Bộ lọc
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[#111827]">
              Khám phá danh mục
            </h2>
          </div>

          <div className="space-y-2 py-5">
            {categoryTree.map((category) => {
              const hasChildren =
                category.groups || (category.items && category.items.length > 0);
              const isExpanded = expandedIds.includes(category.id);

              return (
                <div key={category.id} className="border-b border-[#E5E7EB] pb-2 last:border-0">
                  <button
                    type="button"
                    onClick={() => toggleExpand(category.id)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#FAFAFA]"
                  >
                    <span className="flex items-center gap-3">
                      {ICON_MAP[category.id] || <ShoppingBagIcon className={iconClass} />}
                      {category.label}
                    </span>
                    {hasChildren && (
                      <ExpandMoreIcon
                        className={`!text-[18px] text-[#6B7280] transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="overflow-hidden">
                      <div className="space-y-5 pb-4 pl-7 pr-1">
                        {category.groups?.map((group) => (
                          <div key={group.label}>
                            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                              {group.label}
                            </span>
                            <div className="space-y-1">{group.items.map(renderCategoryButton)}</div>
                          </div>
                        ))}

                        {category.items && (
                          <div className="space-y-1">
                            {category.items.map(renderCategoryButton)}
                          </div>
                        )}
                      </div>
                    </div>
                    )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#E5E7EB] pt-6">
            <ProductPriceFilter
              handleApplyPrice={handleApplyPrice}
              handlePresetClick={handlePresetClick}
              priceError={priceError}
              priceRange={priceRange}
              setPriceError={setPriceError}
              setPriceRange={setPriceRange}
            />
          </div>

          <div className="mt-7 border-t border-[#E5E7EB] pt-6">
            <ProductRatingFilter
              handleRatingChange={handleRatingChange}
              selectedRating={selectedRating}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

export default ProductSideNav;
