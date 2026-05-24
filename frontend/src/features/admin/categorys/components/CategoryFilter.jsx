export default function CategoryFilter({ searchTerm, onSearchChange }) {
    return (
        <div className="category-filter">
            <div className="category-filter-search">
                <span className="material-symbols-outlined category-filter-icon">
                    filter_list
                </span>

                <input
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="category-filter-input"
                    placeholder="Lọc theo tên danh mục hoặc mô tả..."
                    type="text"
                />
            </div>

            <div className="category-filter-actions">
                <button className="category-outline-btn">
                    <span className="material-symbols-outlined text-sm">
                        sort
                    </span>

                    Sắp xếp
                </button>

                <button className="category-outline-btn">
                    <span className="material-symbols-outlined text-sm">
                        download
                    </span>

                    Xuất file
                </button>
            </div>
        </div>
    );
}