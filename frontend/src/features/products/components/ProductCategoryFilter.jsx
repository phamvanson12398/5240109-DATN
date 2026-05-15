import React from "react";
import { categoryTree } from "../config/categoryTree";

function ProductCategoryFilter({ handleCategoryToggle, selectedCategories }) {
  const renderCategoryLink = (item) => {
    const isActive = selectedCategories.includes(item.value);

    return (
      <button
        key={item.value}
        type="button"
        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
          isActive
            ? "bg-[#E85D75]/10 font-semibold text-[#E85D75]"
            : "font-medium text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111827]"
        }`}
        onClick={(event) => {
          event.preventDefault();
          handleCategoryToggle(item.value);
        }}
      >
        {item.label}
      </button>
    );
  };

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6B7280]">
          Danh mục
        </p>
        <h2 className="mt-2 text-lg font-semibold text-[#111827]">
          Khám phá danh mục
        </h2>
      </div>

      <div className="space-y-6">
        {categoryTree.map((section) => (
          <div key={section.id} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#111827]">
              {section.label}
            </h3>

            <div className="space-y-4">
              {section.groups?.map((group) => (
                <div key={group.label} className="space-y-2">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                    {group.label}
                  </span>
                  <div className="space-y-1">{group.items.map(renderCategoryLink)}</div>
                </div>
              ))}

              {section.items && (
                <div className="space-y-1">{section.items.map(renderCategoryLink)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default React.memo(ProductCategoryFilter);
