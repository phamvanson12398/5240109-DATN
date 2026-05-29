import React, { useEffect, useMemo, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

import { categoryApi } from "@/features/admin/categorys/api/categoryApi.js";

import ProductPriceFilter from "./ProductPriceFilter";
import ProductRatingFilter from "./ProductRatingFilter";

const iconClass = "!text-[18px] text-[#6B7280]";

function ProductSideNav({
  handleApplyPrice,
  handlePresetClick,
  handleRatingChange,
  priceError,
  priceRange,
  selectedCategories = [],
  selectedRating,
  setPriceError,
  setPriceRange,
  onCategoryToggle,
}) {
  const [categories, setCategories] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const data = await categoryApi.fetchCategories();

        setCategories(data || []);

        const parentIds = (data || [])
          .filter((category) => !category.parentId)
          .map((category) => category._id);

        setExpandedIds(parentIds);
      } catch (error) {
        console.log("Lỗi lấy danh mục:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const categoryTree = useMemo(() => {
    const parentCategories = categories.filter(
      (category) => !category.parentId
    );

    return parentCategories.map((parent) => {
      const children = categories.filter((category) => {
        const categoryParentId =
          typeof category.parentId === "object"
            ? category.parentId?._id
            : category.parentId;

        return categoryParentId === parent._id;
      });

      return {
        id: parent._id,
        label: parent.name,
        value: parent._id,
        items: children.map((child) => ({
          value: child._id,
          label: child.name,
        })),
      };
    });
  }, [categories]);

  useEffect(() => {
    setExpandedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      categoryTree.forEach((category) => {
        const hasSelectedItem = category.items?.some((item) =>
          selectedCategories.includes(item.value)
        );

        if (hasSelectedItem) {
          nextIds.add(category.id);
        }
      });

      return Array.from(nextIds);
    });
  }, [selectedCategories, categoryTree]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
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
            {loadingCategories && (
              <p className="text-sm text-[#6B7280]">
                Đang tải danh mục...
              </p>
            )}

            {!loadingCategories && categoryTree.length === 0 && (
              <p className="text-sm text-[#9CA3AF]">
                Chưa có danh mục nào
              </p>
            )}

            {!loadingCategories &&
              categoryTree.map((category) => {
                const hasChildren =
                  category.items && category.items.length > 0;

                const isExpanded = expandedIds.includes(category.id);

                return (
                  <div
                    key={category.id}
                    className="border-b border-[#E5E7EB] pb-2 last:border-0"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(category.id)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#FAFAFA]"
                    >
                      <span className="flex items-center gap-3">
                        <ShoppingBagIcon className={iconClass} />
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

                    {isExpanded && hasChildren && (
                      <div className="overflow-hidden">
                        <div className="space-y-1 pb-4 pl-7 pr-1">
                          {category.items.map(renderCategoryButton)}
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