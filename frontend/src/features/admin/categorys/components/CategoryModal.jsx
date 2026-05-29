import { useEffect, useState } from "react";
import { categoryApi } from "../api/categoryApi.js";
import "../styles/category.css";

export default function CategoryModal({ onClose }) {
  const [categoriesLevel1, setCategoriesLevel1] = useState([]);

  const [parentId, setParentId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategoriesLevel1 = async () => {
      try {
        const categories = await categoryApi.fetchCategories();

        const level1Categories = categories.filter(
          (category) => category.parentId === null
        );

        setCategoriesLevel1(level1Categories);
      } catch (error) {
        console.log("Lỗi khi lấy danh mục cấp 1:", error);

        setMessage({
          type: "error",
          text: "Không thể tải danh mục cấp 1",
        });
      }
    };

    fetchCategoriesLevel1();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập tên danh mục";
    }

    if (!description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả danh mục";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      setLoading(true);
      setMessage({ type: "", text: "" });

      await categoryApi.createCategory({
        name: name.trim(),
        description: description.trim(),
        parentId: parentId || null,
      });

      setMessage({
        type: "success",
        text: "Tạo danh mục thành công",
      });

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      console.log("Lỗi khi tạo category:", error);

      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          "Tạo danh mục thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-modal">
      <div onClick={onClose} className="category-modal-backdrop" />

      <div className="category-modal-content">
        <div className="category-modal-header">
          <div>
            <h3 className="category-modal-title">
              Thêm Danh mục mới
            </h3>

            <p className="category-modal-subtitle">
              Tạo danh mục cấp 1 hoặc danh mục con cấp 2
            </p>
          </div>

          <button
            onClick={onClose}
            className="category-modal-close"
            type="button"
            disabled={loading}
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        {message.text && (
          <div className={`category-alert ${message.type}`}>
            <span className="material-symbols-outlined">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            <p>{message.text}</p>
          </div>
        )}

        <div className="category-modal-body">
          <div className="category-form-group">
            <label className="category-label">
              Chọn danh mục cấp 1
            </label>

            <select
              className="category-input"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              disabled={loading}
            >
              <option value="">
                Không chọn - Đây là danh mục cấp 1
              </option>

              {categoriesLevel1.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <span className="category-helper-text">
              Nếu chọn danh mục cấp 1, danh mục mới sẽ là cấp 2.
            </span>
          </div>

          <div className="category-form-group">
            <label className="category-label">
              Tên danh mục
            </label>

            <input
              className={`category-input ${
                errors.name ? "error" : ""
              }`}
              placeholder="Nhập tên danh mục..."
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              disabled={loading}
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
              placeholder="Nhập mô tả chi tiết cho danh mục này..."
              rows="4"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  description: "",
                }));
              }}
              disabled={loading}
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
            onClick={onClose}
            className="category-cancel-btn"
            type="button"
            disabled={loading}
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="category-save-btn"
            type="button"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu danh mục"}
          </button>
        </div>
      </div>
    </div>
  );
}