import React from 'react';

/**
 * ProductActions — chọn màu, size, số lượng, CTA buttons + mobile sticky bar.
 * Nhận tất cả state & handlers từ useProductDetail qua props.
 */
function ProductActions({
  product,
  quantity,
  maxAvailableQuantity,
  selectionError,
  cartLoading,
  onIncrease,
  onDecrease,
  onAddToCart,
  onBuyNow,
}) {
  const availableQuantity = maxAvailableQuantity ?? product.stock ?? 0;
  const isPurchasable = availableQuantity > 0;

  return (
    <>
      {/* Variant selection wrapper with error highlight */}
      <div style={{
        backgroundColor: selectionError ? '#fff5f5' : 'transparent',
        padding: selectionError ? '15px' : '0',
        margin: selectionError ? '15px -15px' : '0',
        borderRadius: '4px',
        transition: 'all 0.3s ease',
      }}>
       
        {/* Quantity */}
        <div className="quantity-section">
          <span className="quantity-label">Số lượng</span>
          <div className="quantity-controls">
            <button className="qty-btn" onClick={onDecrease} disabled={quantity <= 1}>−</button>
            <input type="text" className="qty-input" value={quantity} readOnly />
            <button className="qty-btn" onClick={onIncrease} disabled={quantity >= availableQuantity}>+</button>
          </div>
          <span className="stock-info">Còn {availableQuantity} sản phẩm</span>
        </div>

        {selectionError && (
          <div style={{ color: '#ee4d2d', fontSize: '13px', marginTop: '15px', paddingLeft: '4px' }}>
            Vui lòng chọn Phân loại hàng
          </div>
        )}
      </div>

      {/* CTA buttons */}
      {isPurchasable && (
        <div className="cta-section">
          <button className="add-to-cart-btn" onClick={onAddToCart} disabled={cartLoading}>
            🛒 {cartLoading ? 'Đang thêm...' : 'THÊM VÀO GIỎ HÀNG'}
          </button>
          <button className="buy-now-btn" onClick={onBuyNow}>MUA NGAY</button>
        </div>
      )}

      {/* Mobile sticky CTA */}
      {isPurchasable && (
        <div className="mobile-sticky-cta">
          <button className="add-to-cart-btn" onClick={onAddToCart} disabled={cartLoading}>
            🛒 THÊM VÀO GIỎ
          </button>
          <button className="buy-now-btn" onClick={onBuyNow}>MUA NGAY</button>
        </div>
      )}
    </>
  );
}

export default ProductActions;
