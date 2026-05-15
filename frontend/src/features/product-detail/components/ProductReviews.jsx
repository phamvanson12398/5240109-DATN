import React from 'react';

/**
 * ProductReviews — tab đánh giá: rating summary + danh sách review.
 * Pure presentation — nhận props từ parent.
 */
function ProductReviews({ product, totalReviews, ratingDistribution }) {
  if (!product?.reviews || product.reviews.length === 0) {
    return (
      <div className="no-reviews">
        <p>Chưa có đánh giá nào cho sản phẩm này.</p>
      </div>
    );
  }

  return (
    <>
      {/* Rating summary */}
      <div className="reviews-summary">
        <div className="rating-big">
          <div className="number">{product.rating?.toFixed(1) || '0.0'}</div>
          <div className="stars">⭐⭐⭐⭐⭐</div>
          <div className="count">{product.numOfReviews} đánh giá</div>
        </div>
        <div className="rating-bars">
          {ratingDistribution.map((item) => (
            <div key={item.stars} className="rating-bar-row">
              <span className="rating-bar-label">{item.stars} ⭐</span>
              <div className="rating-bar">
                <div
                  className="rating-bar-fill"
                  style={{ width: `${totalReviews > 0 ? (item.count / totalReviews) * 100 : 0}%` }}
                />
              </div>
              <span className="rating-bar-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="review-list">
        {product.reviews.map((review, index) => (
          <div className="review-item" key={index}>
            <div className="review-header">
              <div className="reviewer-avatar">
                {review.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="reviewer-info">
                <div className="reviewer-name">{review.name}</div>
                <div className="review-meta">
                  <span className="stars">{'⭐'.repeat(review.rating)}</span>
                  <span>•</span>
                  <span>Gần đây</span>
                  <span>•</span>
                  <span className="verified-badge">✓ Đã mua hàng</span>
                </div>
              </div>
            </div>
            <div className="review-content">{review.comment}</div>

            {/* Review media */}
            {review.images?.length > 0 && (
              <div className="review-images">
                {review.images.map((img, i) => {
                  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(img.url);
                  return isVideo ? (
                    <video
                      key={i}
                      src={img.url}
                      controls
                      className="review-video"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <img
                      key={i}
                      src={img.url}
                      alt={`review-${i}`}
                      onClick={() => window.open(img.url, '_blank')}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default ProductReviews;
