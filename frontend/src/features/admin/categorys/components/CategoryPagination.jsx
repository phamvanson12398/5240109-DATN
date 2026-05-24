export default function CategoryPagination({ total }) {
    return (
        <div className="category-pagination">
            <span className="category-pagination-text">
                Hiển thị 1-5 trên {total} danh mục
            </span>

            <div className="category-pagination-actions">
                <button
                    className="category-page-btn"
                    disabled
                >
                    <span className="material-symbols-outlined">
                        chevron_left
                    </span>
                </button>

                <button className="category-page-btn active">
                    1
                </button>

                <button className="category-page-btn">
                    2
                </button>

                <button className="category-page-btn">
                    3
                </button>

                <button className="category-page-btn">
                    <span className="material-symbols-outlined">
                        chevron_right
                    </span>
                </button>
            </div>
        </div>
    );
}