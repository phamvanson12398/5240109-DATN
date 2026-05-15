import React from 'react';

/**
 * ProductActions — chọn màu, size, số lượng, CTA buttons + mobile sticky bar.
 * Nhận tất cả state & handlers từ useProductDetail qua props.
 */
function ProductActions({
  product,
  productColors,
  productSizes,
  selectedColor,
  selectedSize,
  quantity,
  selectionError,
  cartLoading,
  onColorSelect,
  onSizeSelect,
  onIncrease,
  onDecrease,
  onAddToCart,
  onBuyNow,
}) {
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
        {/* Color Selection */}
        {productColors.length > 0 && (
          <div className="selection-group">
            <div className="selection-label">
              Màu sắc {selectedColor !== null && <span>{productColors[selectedColor]?.name}</span>}
            </div>
            <div className="color-options">
              {productColors.map((color, index) => (
                <div
                  key={index}
                  className={`color-swatch ${selectedColor === index ? 'active' : ''}`}
                  style={{ backgroundColor: color.code }}
                  onClick={() => onColorSelect(index)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {productSizes.length > 0 && (
          <div className="selection-group">
            <div className="selection-label">
              Kích thước
              <button className="size-guide">Hướng dẫn chọn size</button>
            </div>
            <div className="size-options">
              {productSizes.map((size, index) => (
                <button
                  key={index}
                  className={`size-btn ${selectedSize === index ? 'active' : ''} ${!size.available ? 'disabled' : ''}`}
                  onClick={() => onSizeSelect(index)}
                  disabled={!size.available}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="quantity-section">
          <span className="quantity-label">Số lượng</span>
          <div className="quantity-controls">
            <button className="qty-btn" onClick={onDecrease} disabled={quantity <= 1}>−</button>
            <input type="text" className="qty-input" value={quantity} readOnly />
            <button className="qty-btn" onClick={onIncrease} disabled={quantity >= product.stock}>+</button>
          </div>
          <span className="stock-info">Còn {product.stock} sản phẩm</span>
        </div>

        {selectionError && (
          <div style={{ color: '#ee4d2d', fontSize: '13px', marginTop: '15px', paddingLeft: '4px' }}>
            Vui lòng chọn Phân loại hàng
          </div>
        )}
      </div>

      {/* CTA buttons */}
      {product.stock > 0 && (
        <div className="cta-section">
          <button className="add-to-cart-btn" onClick={onAddToCart} disabled={cartLoading}>
            🛒 {cartLoading ? 'Đang thêm...' : 'THÊM VÀO GIỎ HÀNG'}
          </button>
          <button className="buy-now-btn" onClick={onBuyNow}>MUA NGAY</button>
        </div>
      )}

      {/* Mobile sticky CTA */}
      {product.stock > 0 && (
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
