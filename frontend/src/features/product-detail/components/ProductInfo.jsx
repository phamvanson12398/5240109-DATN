import React from 'react';
import { formatVND } from '@/shared/utils/formatCurrency';

/**
 * ProductInfo — tên, rating, giá, mô tả ngắn, benefits.
 * Không chứa logic chọn biến thể hay nút mua — xem ProductActions.
 */
function ProductInfo({ product, discountPercent, originalPrice, soldCount, quantity }) {
  const unitPrice = Number(product?.price || 0);
  const displayPrice = unitPrice * quantity;
  const displayOriginalPrice = Number(originalPrice || 0) * quantity;

  return (
    <div>
      <h1 className="product-title">{product.name}</h1>

      {/* Rating & Sales */}
      <div className="product-meta">
        <div className="rating-section">
          <span className="rating-number">{product.rating?.toFixed(1) || '0.0'}</span>
          <span className="rating-stars">⭐⭐⭐⭐⭐</span>
        </div>
        <span className="meta-divider">|</span>
        <div className="review-count">
          <span>{product.numOfReviews || 0}</span> Đánh giá
        </div>
        <span className="meta-divider">|</span>
        <div className="sold-count">
          <span>{soldCount.toLocaleString()}</span> Đã bán
        </div>
      </div>

      {/* Price */}
      <div className="price-section">
        <span className="current-price">{formatVND(displayPrice)}</span>
        {discountPercent > 0 && (
          <>
            <span className="original-price">{formatVND(displayOriginalPrice)}</span>
            <span className="discount-badge">-{discountPercent}%</span>
          </>
        )}
        {quantity > 1 && (
          <div className="price-breakdown">
            {quantity} x {formatVND(unitPrice)}
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="benefits-section">
        {[
          { title: 'Miễn phí vận chuyển', desc: 'Đơn hàng từ 500.000₫' },
          { title: 'Đổi trả trong 14 ngày', desc: 'Miễn phí đổi size & hoàn tiền' },
          { title: 'Hàng chính hãng 100%', desc: 'Cam kết chất lượng' },
        ].map((b) => (
          <div className="benefit-item" key={b.title}>
            <span className="benefit-icon">✓</span>
            <div className="benefit-text">
              <h4>{b.title}</h4>
              <p>{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductInfo;
