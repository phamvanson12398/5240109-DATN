import React from 'react';
import "../styles/category.css";

function DeleteCategoryModal({
    isOpen,
    category,
    onClose,
    onConfirm
}) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(category);
        onClose();
    };

    return (
        <div className="category-modal">
            <div
                className="category-modal-backdrop"
                onClick={onClose}
            />

            <div className="category-modal-content delete-modal">
                <div className="category-delete-body">
                    <div className="category-delete-icon">
                        <span className="material-symbols-outlined">
                            warning
                        </span>
                    </div>

                    <h3 className="category-delete-title">
                        Xác nhận xóa
                    </h3>

                    <p className="category-delete-message">
                        Bạn có chắc chắn muốn xóa danh mục{' '}
                        {category?.name ? (
                            <span className="category-delete-name">
                                "{category.name}"
                            </span>
                        ) : (
                            'này'
                        )}
                        ? Hành động này không thể hoàn tác.
                    </p>
                </div>

                <div className="category-modal-footer category-delete-footer">
                    <button
                        type="button"
                        className="category-cancel-btn"
                        onClick={onClose}
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        className="category-delete-confirm-btn"
                        onClick={handleConfirm}
                    >
                        Xác nhận xóa
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteCategoryModal;