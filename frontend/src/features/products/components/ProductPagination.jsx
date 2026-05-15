import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ELLIPSIS = "ellipsis";

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, ELLIPSIS, totalPages - 1, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 2, ELLIPSIS, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, ELLIPSIS, currentPage, ELLIPSIS, totalPages];
}

function ProductPagination({ currentPage, totalItems, resultPerPage, onPageChange }) {
  const totalPages = Math.ceil((Number(totalItems) || 0) / (Number(resultPerPage) || 1));
  const safeCurrentPage = Math.min(Math.max(Number(currentPage) || 1, 1), totalPages);

  if (totalPages <= 1) return null;

  const handlePageSelect = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const renderPageNumbers = () =>
    getPaginationItems(safeCurrentPage, totalPages).map((item, index) => {
      if (item === ELLIPSIS) {
        return (
          <span
            key={`${item}-${index}`}
            className="pagination-ellipsis"
            aria-hidden="true"
          >
            ...
          </span>
        );
      }

      const page = item;
      const isActive = safeCurrentPage === page;

      return (
        <button
          key={page}
          type="button"
          onClick={() => handlePageSelect(page)}
          className={`pagination-btn ${isActive ? "active" : ""}`}
          aria-current={isActive ? "page" : undefined}
          aria-label={isActive ? `Trang ${page} hiện tại` : `Tới trang ${page}`}
        >
          {page}
        </button>
      );
    });

  return (
    <nav className="product-pagination" aria-label="Phân trang sản phẩm">
      <button
        type="button"
        onClick={() => handlePageSelect(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        className="pagination-btn"
        aria-label="Trang trước"
      >
        <ChevronLeft aria-hidden="true" strokeWidth={2.25} />
      </button>

      {renderPageNumbers()}

      <button
        type="button"
        onClick={() => handlePageSelect(safeCurrentPage + 1)}
        disabled={safeCurrentPage === totalPages}
        className="pagination-btn"
        aria-label="Trang sau"
      >
        <ChevronRight aria-hidden="true" strokeWidth={2.25} />
      </button>
    </nav>
  );
}

export default ProductPagination;
