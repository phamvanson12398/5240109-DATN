import React from 'react';

/**
 * ProductReviews — tab đánh giá: rating summary + danh sách review.
 * Pure presentation — nhận props từ parent.
 */
function ProductReviews({ product, reviews = [], totalReviews, ratingDistribution }) {
  const visibleReviews = reviews.length > 0 ? reviews : product?.reviews || [];
  const averageRating = product?.ratings ?? product?.rating ?? 0;

  const formatReviewDate = (dateString) => {
    if (!dateString) return 'Gần đây';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Gần đây';

    return date.toLocaleDateString('vi-VN');
  };

  if (visibleReviews.length === 0) {
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
          <div className="number">{Number(averageRating).toFixed(1) }</div>
          <div className="stars">⭐⭐⭐⭐⭐</div>
          <div className="count">{totalReviews} đánh giá</div>
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
        {visibleReviews.map((review, index) => {
          const reviewerName = review.user_id?.name || review.name || 'Người dùng';
          const avatarUrl = review.user_id?.avatar?.url || review.avatar?.url;

          return (
          <div className="review-item" key={review._id || index}>
            <div className="review-header">
              <div className="reviewer-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={reviewerName} />
                ) : (
                  reviewerName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="reviewer-info">
                <div className="reviewer-name">{reviewerName}</div>
                <div className="review-meta">
                  <span className="stars">{'⭐'.repeat(review.rating)}</span>
                  <span>•</span>
                  <span>{formatReviewDate(review.createdAt)}</span>
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
                  const isVideo = img.resource_type === 'video' || /\.(mp4|webm|ogg|mov)$/i.test(img.url);
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
          );
        })}
      </div>
    </>
  );
}

export default ProductReviews;
