import React, { useEffect, useState } from 'react';
import "../styles/category.css";

function EditCategoryModal({
    isOpen,
    category,
    onClose,
    onSave
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (category) {
            setName(category.name || '');
            setDescription(category.description || '');
        }
    }, [category]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave({
            ...category,
            name,
            description
        });

        onClose();
    };

    return (
        <div className="category-modal">
            <div
                className="category-modal-backdrop"
                onClick={onClose}
            />

            <div className="category-modal-content">
                <div className="category-modal-header">
                    <h3 className="category-modal-title">
                        Chỉnh sửa Danh mục
                    </h3>

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
                    <div className="category-form-group">
                        <label className="category-label">
                            Tên danh mục
                        </label>

                        <input
                            className="category-input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên danh mục..."
                        />
                    </div>

                    <div className="category-form-group">
                        <label className="category-label">
                            Mô tả
                        </label>

                        <textarea
                            className="category-textarea"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả..."
                        />
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