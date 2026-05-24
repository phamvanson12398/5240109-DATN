export default function CategoryModal({ onClose }) {
    return (
        <div className="category-modal">
            <div
                onClick={onClose}
                className="category-modal-backdrop"
            />

            <div className="category-modal-content">
                <div className="category-modal-header">
                    <h3 className="category-modal-title">
                        Thêm Danh mục mới
                    </h3>

                    <button
                        onClick={onClose}
                        className="category-modal-close"
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
                            placeholder="Nhập tên danh mục..."
                            type="text"
                        />
                    </div>

                    <div className="category-form-group">
                        <label className="category-label">
                            Mô tả
                        </label>

                        <textarea
                            className="category-textarea"
                            placeholder="Nhập mô tả chi tiết cho danh mục này..."
                            rows="4"
                        />
                    </div>
                </div>

                <div className="category-modal-footer">
                    <button
                        onClick={onClose}
                        className="category-cancel-btn"
                    >
                        Hủy
                    </button>

                    <button className="category-save-btn">
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}