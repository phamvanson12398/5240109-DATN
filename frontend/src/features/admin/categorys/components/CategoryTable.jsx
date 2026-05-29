import React, { useState } from "react";
import { categoryApi } from "../api/categoryApi.js";
import EditCategoryModal from "./EditCategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";

export default function CategoryTable({
  categories = [],
  allCategories = [],
  fetchCategories,
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const parentCategories = categories.filter((category) => {
    return !category.parentId;
  });

  const getChildCategories = (parentId) => {
    return allCategories.filter((category) => {
      const categoryParentId =
        typeof category.parentId === "object"
          ? category.parentId?._id
          : category.parentId;

      return categoryParentId === parentId;
    });
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedCategory(null);
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setSelectedCategory(null);
  };

  const handleSaveEdit = async (updatedCategory) => {
    try {
      await categoryApi.updateCategory(updatedCategory._id, {
        name: updatedCategory.name,
        description: updatedCategory.description,
        parentId: updatedCategory.parentId || null,
      });

      await fetchCategories();
      handleCloseEdit();
    } catch (error) {
      console.log("Lỗi khi cập nhật category:", error);
    }
  };

  const handleConfirmDelete = async (category) => {
    try {
      await categoryApi.deleteCategory(category._id);

      await fetchCategories();
      handleCloseDelete();
    } catch (error) {
      console.log("Lỗi khi xóa category:", error);
    }
  };

  return (
    <>
      <div className="category-table-scroll">
        <table className="category-table">
          <thead>
            <tr>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th className="category-actions">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {parentCategories.length === 0 ? (
              <tr>
                <td colSpan="3" className="category-empty">
                  Chưa có danh mục nào
                </td>
              </tr>
            ) : (
              parentCategories.map((parent) => (
                <React.Fragment key={parent._id}>
                  <tr className="category-parent-row">
                    <td>
                      <div className="category-cell">
                        <div className="category-icon-box">
                          <span className="material-symbols-outlined">
                            {parent.icon || "folder"}
                          </span>
                        </div>

                        <span className="category-name">
                          {parent.name}
                        </span>
                      </div>
                    </td>

                    <td className="category-description">
                      {parent.description}
                    </td>

                    <td className="category-actions">
                      <button
                        type="button"
                        className="category-action-btn category-edit-btn"
                        onClick={() => handleOpenEdit(parent)}
                      >
                        <span className="material-symbols-outlined">
                          edit
                        </span>
                      </button>

                      <button
                        type="button"
                        className="category-action-btn category-delete-btn"
                        onClick={() => handleOpenDelete(parent)}
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>

                  {getChildCategories(parent._id).map((child) => (
                    <tr
                      key={child._id}
                      className="category-child-row"
                    >
                      <td>
                        <div className="category-cell category-child-cell">
                          <span className="category-child-line">
                            └─
                          </span>

                          <div className="category-icon-box">
                            <span className="material-symbols-outlined">
                              {child.icon ||
                                "subdirectory_arrow_right"}
                            </span>
                          </div>

                          <span className="category-name">
                            {child.name}
                          </span>
                        </div>
                      </td>

                      <td className="category-description">
                        {child.description}
                      </td>

                      <td className="category-actions">
                        <button
                          type="button"
                          className="category-action-btn category-edit-btn"
                          onClick={() => handleOpenEdit(child)}
                        >
                          <span className="material-symbols-outlined">
                            edit
                          </span>
                        </button>

                        <button
                          type="button"
                          className="category-action-btn category-delete-btn"
                          onClick={() => handleOpenDelete(child)}
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditCategoryModal
        isOpen={isEditOpen}
        category={selectedCategory}
        categories={allCategories}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />

      <DeleteCategoryModal
        isOpen={isDeleteOpen}
        category={selectedCategory}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}