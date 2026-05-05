import React from 'react'
import '@/shared/components/styles/NoProducts.css'

function NoProducts({ keyword, onResetFilters }) {
  return (
    <div className="no-products-content">
        <div className="no-products-icon">
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
        <h3 className="no-products-title">
          {keyword 
            ? `Không tìm thấy sản phẩm phù hợp cho "${keyword}"`
            : "Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại"
          }
        </h3>
        <p className="no-products-message">
          Hãy thử từ khóa khác hoặc xóa bớt bộ lọc để tìm thấy thứ bạn cần.
        </p>
        
        {onResetFilters && (
          <button 
            className="no-products-reset-btn"
            onClick={onResetFilters}
          >
            Xóa tất cả bộ lọc
          </button>
        )}
    </div>
  )
}

export default NoProducts