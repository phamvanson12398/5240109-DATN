export default function CategoryHeader({ onOpenModal }) {
    return (
        <div className="category-header">
            <div>
                <h2 className="category-title">
                    Quản lý Danh mục
                </h2>

                <p className="category-subtitle">
                    Tổ chức và quản lý các thể loại sách trong hệ thống.
                </p>
            </div>

            <button
                onClick={onOpenModal}
                className="category-add-btn"
            >
                <span className="material-symbols-outlined">
                    add
                </span>

                Thêm Danh mục
            </button>
        </div>
    );
}