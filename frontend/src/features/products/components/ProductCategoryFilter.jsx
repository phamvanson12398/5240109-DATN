import React, { useEffect, useMemo, useState } from "react";
import { categoryApi } from "@/features/admin/categorys/api/categoryApi.js";

function ProductCategoryFilter({
  handleCategoryToggle,
  selectedCategories = [],
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const data = await categoryApi.fetchCategories();

        setCategories(data || []);
      } catch (error) {
        console.log("Lỗi lấy danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const categoryTree = useMemo(() => {
    const parentCategories = categories.filter((category) => {
      return !category.parentId;
    });

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

  if (loading) {
    return (
      <section className="space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6B7280]">
            Danh mục
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[#111827]">
            Đang tải danh mục...
          </h2>
        </div>
      </section>
    );
  }

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

            <div className="space-y-1">
              {section.items.length > 0 ? (
                section.items.map(renderCategoryLink)
              ) : (
                <p className="text-sm text-[#9CA3AF]">
                  Chưa có danh mục con
                </p>
              )}
            </div>
          </div>
        ))}

        {categoryTree.length === 0 && (
          <p className="text-sm text-[#9CA3AF]">
            Chưa có danh mục nào
          </p>
        )}
      </div>
    </section>
  );
}

export default React.memo(ProductCategoryFilter);