import React from 'react';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import RemoveShoppingCartOutlinedIcon from '@mui/icons-material/RemoveShoppingCartOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import '@/features/cart/styles/Cart.css';
import PageTitle from '@/shared/components/PageTitle';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { formatVND } from '@/shared/utils/formatCurrency';
import VoucherModal from '@/features/checkout/components/VoucherModal';
import { useCartPage } from '@/features/cart/hooks/useCartPage';

/**
 * CartView - pure layout/presentation layer.
 * All business logic lives in useCartPage hook.
 */
function CartView() {
  const {
    cartItems, loading,
    activeVouchers, vLoading, vError,
    appliedCoupon,
    selectedItems, selectedCartItems, subtotal, discount, shippingCharges, total, allSelected,
    isVoucherModalOpen, setIsVoucherModalOpen,
    getItemKey, toggleSelectAll, toggleItem,
    updateQuantity, deleteItem, deleteSelected,
    checkoutHandler, handleApplyCoupon, handleRemoveCoupon,
    navigate,
  } = useCartPage();

  const selectedCount = selectedCartItems.length;
  const cartItemCount = cartItems.length;
  const displayDiscount = selectedCount === 0 ? 0 : discount;
  const displayShippingCharges = selectedCount === 0 ? 0 : shippingCharges;
  const displayTotal = selectedCount === 0 ? 0 : total;

  return (
    <div className="cart-page">
      <Navbar />
      <PageTitle title="Giỏ Hàng | GÓC SÁCH" />

      <main className="cart-container">
        {cartItems.length === 0 ? (
          <section className="empty-cart-card">
            <div className="empty-cart-icon">
              <RemoveShoppingCartOutlinedIcon />
            </div>
            <h1>Giỏ hàng của bạn còn trống</h1>
            <p>Khám phá những thiết kế mới nhất và thêm sản phẩm yêu thích vào giỏ hàng.</p>
            <Link to="/products" className="primary-cart-button empty-cart-button">
              <ShoppingBagOutlinedIcon />
              Tiếp tục mua sắm
            </Link>
          </section>
        ) : (
          <>
            <section className="cart-hero">
              <div>
                <h1>Giỏ hàng của bạn</h1>
                <p>
                  {cartItemCount} sản phẩm trong giỏ, {selectedCount} sản phẩm đã chọn.
                </p>
              </div>
              <Link to="/products" className="continue-link">
                Tiếp tục mua sắm
                <ArrowForwardIosIcon />
              </Link>
            </section>

            <section className="cart-layout">
              <div className="cart-items-column">
                <div className="cart-selection-bar">
                  <label className="cart-check-label">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="cart-checkbox"
                    />
                    <span>Chọn tất cả ({cartItemCount})</span>
                  </label>
                  <button
                    type="button"
                    onClick={deleteSelected}
                    className="delete-selected-button"
                  >
                    <DeleteOutlineIcon />
                    Xóa đã chọn
                  </button>
                </div>

                <div className="cart-card-list">
                  {cartItems.map((item) => {
                    const key = getItemKey(item);
                    const isSelected = selectedItems?.[key] || false;
                    const lineTotal = item.price * item.quantity;

                    return (
                      <article
                        key={key}
                        className={`cart-item-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="cart-item-select">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItem(item)}
                            className="cart-checkbox"
                            aria-label={`Chọn ${item.name}`}
                          />
                        </div>

                        <button
                          type="button"
                          className="cart-item-image"
                          onClick={() => navigate(`/product/${item.product}`)}
                          aria-label={`Xem ${item.name}`}
                        >
                          <img src={item.image} alt={item.name} />
                        </button>

                        <div className="cart-item-content">
                          <div className="cart-item-main">
                            <button
                              type="button"
                              className="cart-item-name"
                              onClick={() => navigate(`/product/${item.product}`)}
                            >
                              {item.name}
                            </button>
                            <p className="cart-item-variant">
                              Màu: <span>{item.color || 'Mặc định'}</span>
                              <span className="variant-divider" />
                              Size: <span>{item.size || 'Mặc định'}</span>
                            </p>
                            <p className="cart-item-unit-price">{formatVND(item.price)}</p>
                          </div>

                          <div className="cart-item-controls">
                            <div className="quantity-stepper" aria-label="Cập nhật số lượng">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product, -1, item.quantity, item.stock, item.size, item.color)}
                                aria-label="Giảm số lượng"
                              >
                                <RemoveIcon />
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product, 1, item.quantity, item.stock, item.size, item.color)}
                                aria-label="Tăng số lượng"
                              >
                                <AddIcon />
                              </button>
                            </div>

                            <div className="cart-item-total">
                              <span>Thành tiền</span>
                              <strong>{formatVND(lineTotal)}</strong>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteItem(item.product, item.size, item.color)}
                              className="cart-delete-button"
                              aria-label={`Xóa ${item.name}`}
                            >
                              <DeleteOutlineIcon />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <aside className="order-summary-card">
                <div className="summary-header">
                  <h2>Tóm tắt đơn hàng</h2>
                  <span>{selectedCount} sản phẩm</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="summary-voucher-trigger"
                >
                  <span className="summary-voucher-icon">
                    <LocalOfferOutlinedIcon />
                  </span>
                  <span className="summary-voucher-copy">
                    <strong>Mã giảm giá Sách</strong>
                    {appliedCoupon ? (
                      <span>{appliedCoupon.name}</span>
                    ) : (
                      <span>Chọn hoặc nhập mã ưu đãi</span>
                    )}
                  </span>
                  <ArrowForwardIosIcon className="summary-arrow" />
                </button>

                {appliedCoupon && (
                  <div className="applied-coupon-card">
                    <div>
                      <span>Đang áp dụng</span>
                      <strong>{appliedCoupon.name}</strong>
                    </div>
                    <div className="applied-coupon-actions">
                      <button type="button" onClick={() => setIsVoucherModalOpen(true)}>
                        Đổi mã
                      </button>
                      <button type="button" onClick={handleRemoveCoupon}>
                        Gỡ
                      </button>
                    </div>
                  </div>
                )}

                <div className="summary-lines">
                  <div className="summary-line">
                    <span>Tạm tính</span>
                    <strong>{formatVND(subtotal)}</strong>
                  </div>
                  <div className="summary-line">
                    <span>Giảm giá</span>
                    <strong className={displayDiscount > 0 ? 'discount' : ''}>
                      {displayDiscount > 0 ? `-${formatVND(displayDiscount)}` : formatVND(0)}
                    </strong>
                  </div>
                  <div className="summary-line">
                    <span>Vận chuyển</span>
                    <strong className={displayShippingCharges === 0 && selectedCount > 0 ? 'success' : ''}>
                      {selectedCount === 0
                        ? formatVND(0)
                        : displayShippingCharges === 0
                          ? 'Miễn phí'
                          : formatVND(displayShippingCharges)}
                    </strong>
                  </div>
                </div>

                <div className="summary-total">
                  <div>
                    <span>Tổng cộng</span>
                    <p>Đã bao gồm VAT nếu có.</p>
                  </div>
                  <strong>{formatVND(displayTotal)}</strong>
                </div>

                {displayDiscount > 0 && (
                  <p className="summary-saving">Bạn tiết kiệm {formatVND(displayDiscount)} cho đơn hàng này.</p>
                )}

                <button
                  type="button"
                  onClick={checkoutHandler}
                  disabled={selectedCount === 0 || loading}
                  className="primary-cart-button checkout-button"
                >
                  Thanh toán ngay
                </button>

                <Link to="/products" className="secondary-cart-button">
                  Tiếp tục mua sắm
                </Link>
              </aside>
            </section>
          </>
        )}
      </main>

      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        activeVouchers={activeVouchers}
        appliedCouponName={appliedCoupon?.name}
        onApply={handleApplyCoupon}
        onRemove={handleRemoveCoupon}
        vLoading={vLoading}
        serverError={vError}
        subtotal={subtotal}
      />

      <Footer />
    </div>
  );
}

export default CartView;
