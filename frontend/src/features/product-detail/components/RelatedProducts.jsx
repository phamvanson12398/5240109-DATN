import React from 'react';
import { Link } from 'react-router-dom';
import { formatVND } from '@/shared/utils/formatCurrency';

/**
 * RelatedProducts — grid sản phẩm liên quan.
 * TODO: Thay mockRelatedProducts bằng API thực khi có endpoint.
 */
function RelatedProducts({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="related-section">
      <h2>Sản phẩm liên quan</h2>
      <div className="related-grid">
        {items.map((item) => (
          <Link to={`/product/${item.id}`} className="related-card" key={item.id}>
            <div className="related-card-image">
              {item.badge && (
                <span className={`related-badge ${item.badge.toLowerCase()}`}>
                  {item.badge}
                </span>
              )}
              <img src={item.image} alt={item.name} />
            </div>
            <div className="related-card-info">
              <div className="related-card-name">{item.name}</div>
              <div className="related-card-price">
                <span className="current">{formatVND(item.price)}</span>
                {item.originalPrice && (
                  <span className="original">{formatVND(item.originalPrice)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
