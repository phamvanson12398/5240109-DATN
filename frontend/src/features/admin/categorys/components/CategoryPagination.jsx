export default function CategoryPagination({
  total,
  currentPage,
  itemsPerPage,
  onPageChange,
}) {
  const totalPages = Math.ceil(total / itemsPerPage);

  if (total === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  return (
    <div className="category-pagination">
      <span className="category-pagination-text">
        Hiển thị {startItem}-{endItem} trên {total} danh mục
      </span>

      <div className="category-pagination-actions">
        <button
          type="button"
          className="category-page-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <span className="material-symbols-outlined">
            chevron_left
          </span>
        </button>

        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;

          return (
            <button
              key={page}
              type="button"
              className={`category-page-btn ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          className="category-page-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <span className="material-symbols-outlined">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}