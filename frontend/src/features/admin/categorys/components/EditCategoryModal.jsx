import { useEffect, useState } from "react";
import "../styles/category.css";

function EditCategoryModal({
  isOpen,
  category,
  categories = [],
  onClose,
  onSave,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [errors, setErrors] = useState({});

  const getParentId = (item) => {
    if (!item?.parentId) return null;

    return typeof item.parentId === "object"
      ? item.parentId?._id
      : item.parentId;
  };

  const isLevel1Category = !getParentId(category);

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setDescription(category.description || "");
      setParentId(getParentId(category) || "");
      setErrors({});
    }
  }, [category]);

  if (!isOpen) return null;

  const parentOptions = categories.filter((item) => {
    const itemId = item._id || item.id;
    const currentId = category?._id || category?.id;

    return !getParentId(item) && itemId !== currentId;
  });

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập tên danh mục";
    }

    if (!description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả danh mục";
    }

    if (!isLevel1Category && !parentId) {
      newErrors.parentId = "Vui lòng chọn danh mục cấp 1";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSave({
      ...category,
      name: name.trim(),
      description: description.trim(),
      parentId: isLevel1Category ? null : parentId,
    });
  };

  return (
    <div className="category-modal">
      <div
        className="category-modal-backdrop"
        onClick={onClose}
      />

      <div className="category-modal-content">
        <div className="category-modal-header">
          <div>
            <h3 className="category-modal-title">
              Chỉnh sửa Danh mục
            </h3>

            <p className="category-modal-subtitle">
              {isLevel1Category
                ? "Danh mục cấp 1 không thể chọn danh mục cha"
                : "Danh mục cấp 2 có thể chọn lại danh mục cấp 1"}
            </p>
          </div>

          <button
            type="button"
            className="category-modal-close"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        <div className="category-modal-body">
          {!isLevel1Category && (
            <div className="category-form-group">
              <label className="category-label">
                Danh mục cấp 1
              </label>

              <select
                className={`category-input ${
                  errors.parentId ? "error" : ""
                }`}
                value={parentId}
                onChange={(e) => {
                  setParentId(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    parentId: "",
                  }));
                }}
              >
                <option value="">
                  Chọn danh mục cấp 1
                </option>

                {parentOptions.map((parent) => (
                  <option
                    key={parent._id || parent.id}
                    value={parent._id || parent.id}
                  >
                    {parent.name}
                  </option>
                ))}
              </select>

              {errors.parentId && (
                <span className="category-error">
                  {errors.parentId}
                </span>
              )}

              <span className="category-helper-text">
                Danh mục cấp 2 bắt buộc thuộc một danh mục cấp 1.
              </span>
            </div>
          )}

          {isLevel1Category && (
            <div className="category-info-box">
              Đây là danh mục cấp 1, không thể chọn danh mục cha.
            </div>
          )}

          <div className="category-form-group">
            <label className="category-label">
              Tên danh mục
            </label>

            <input
              className={`category-input ${
                errors.name ? "error" : ""
              }`}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="Nhập tên danh mục..."
            />

            {errors.name && (
              <span className="category-error">
                {errors.name}
              </span>
            )}
          </div>

          <div className="category-form-group">
            <label className="category-label">
              Mô tả
            </label>

            <textarea
              className={`category-textarea ${
                errors.description ? "error" : ""
              }`}
              rows="4"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  description: "",
                }));
              }}
              placeholder="Nhập mô tả..."
            />

            {errors.description && (
              <span className="category-error">
                {errors.description}
              </span>
            )}
          </div>
        </div>

        <div className="category-modal-footer">
          <button
            type="button"
            className="category-cancel-btn"
            onClick={onClose}
          >
            Hủy
          </button>

          <button
            type="button"
            className="category-save-btn"
            onClick={handleSubmit}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditCategoryModal;