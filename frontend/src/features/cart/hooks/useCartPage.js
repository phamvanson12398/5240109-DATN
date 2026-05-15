import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addItemsToCart, removeItemFromCart, removeMessage, removeErrors } from '@/features/cart/cartSlice';
import { fetchActiveVouchers, applyVoucher, resetVoucher } from '@/features/vouchers/voucherSlice';

/**
 * useCartPage — encapsulates all Cart page business logic.
 * Keeps CartView as a pure layout component.
 */
export function useCartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const { cartItems, loading, success, message, error } = useSelector((s) => s.cart);
  const { isAuthenticated } = useSelector((s) => s.user);
  const {
    activeVouchers,
    appliedVoucher: serverVoucher,
    loading: vLoading,
    error: vError,
    success: vSuccess,
  } = useSelector((s) => s.voucher);

  // Local state
  const [selectedItems, setSelectedItems] = useState({});
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const getItemKey = (item) => `${item.product}-${item.size || ''}-${item.color || ''}`;

  // ─── Side effects ────────────────────────────────────────────────────────────
  useEffect(() => { dispatch(fetchActiveVouchers()); }, [dispatch]);

  useEffect(() => {
    if (vSuccess && serverVoucher) {
      setAppliedCoupon({
        name: serverVoucher.voucherCode || 'ƯU ĐÃI',
        discount: Number(serverVoucher.discountAmount || serverVoucher.discount || 0),
        desc: serverVoucher.message,
      });
      setIsVoucherModalOpen(false);
      toast.success(serverVoucher.message || 'Áp dụng mã thành công!', {
        position: 'top-center', autoClose: 2000, toastId: 'voucher-success',
      });
    }
  }, [vSuccess, serverVoucher]);

  useEffect(() => {
    if (success && message) {
      toast.success(message, { position: 'top-center', autoClose: 2000, toastId: 'cart-success' });
      dispatch(removeMessage());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'top-center', autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [error, dispatch]);

  // ─── Derived values ──────────────────────────────────────────────────────────
  const selectedCartItems = cartItems.filter((item) => selectedItems[getItemKey(item)]);
  const subtotal = selectedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = appliedCoupon ? Number(appliedCoupon.discount || 0) : 0;
  const shippingCharges = subtotal >= 500000 || appliedCoupon?.name === 'FREESHIP' ? 0 : 30000;
  const total = Math.max(0, subtotal - discount + shippingCharges);
  const allSelected = cartItems.length > 0 && cartItems.every((item) => selectedItems[getItemKey(item)]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const toggleSelectAll = (checked) => {
    const next = {};
    cartItems.forEach((item) => { next[getItemKey(item)] = checked; });
    setSelectedItems(next);
  };

  const toggleItem = (item) => {
    const key = getItemKey(item);
    setSelectedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateQuantity = (productId, change, currentQty, stock, size, color) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (newQty > stock) {
      toast.error(`Số lượng không thể vượt quá ${stock}`, { position: 'top-center', autoClose: 2000 });
      return;
    }
    dispatch(addItemsToCart({ id: productId, quantity: newQty, isUpdate: true, size, color }));
  };

  const deleteItem = (productId, size, color) => {
    dispatch(removeItemFromCart({ product: productId, size, color }));
    toast.success('Đã xóa sản phẩm', { position: 'top-center', autoClose: 2000 });
  };

  const deleteSelected = () => {
    const toDelete = cartItems.filter((item) => selectedItems[getItemKey(item)]);
    if (toDelete.length === 0) {
      toast.error('Vui lòng chọn sản phẩm cần xóa', { position: 'top-center', autoClose: 2000 });
      return;
    }
    toDelete.forEach((item) => {
      dispatch(removeItemFromCart({ product: item.product, size: item.size, color: item.color }));
    });
    toast.success(`Đã xóa ${toDelete.length} sản phẩm`, { position: 'top-center', autoClose: 2000 });
  };

  const checkoutHandler = () => {
    if (selectedCartItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm để đặt hàng', { position: 'top-center', autoClose: 2000 });
      return;
    }
    sessionStorage.removeItem('directBuyItem');
    sessionStorage.setItem('selectedOrderItems', JSON.stringify(selectedCartItems));

    if (serverVoucher && vSuccess) {
      sessionStorage.setItem('appliedVoucher', JSON.stringify({
        voucher_id: serverVoucher.voucher_id,
        voucherCode: serverVoucher.voucherCode,
        voucherType: serverVoucher.voucherType,
        voucherValue: serverVoucher.voucherValue,
        discountAmount: serverVoucher.discountAmount,
      }));
    } else {
      sessionStorage.removeItem('appliedVoucher');
    }

    navigate(isAuthenticated ? '/shipping' : '/login?redirect=/shipping');
  };

  const handleApplyCoupon = (code) => {
    if (subtotal === 0) {
      toast.error('Vui lòng chọn sản phẩm trước khi áp dụng mã', { position: 'top-center' });
      return;
    }
    dispatch(applyVoucher({ voucherCode: code.toUpperCase(), itemPrice: subtotal }));
  };

  const handleRemoveCoupon = () => {
    dispatch(resetVoucher());
    setAppliedCoupon(null);
    toast.info('Đã gỡ mã giảm giá', { position: 'top-center', autoClose: 1500 });
  };

  return {
    // data
    cartItems, loading,
    activeVouchers, vLoading, vError,
    appliedCoupon,
    // derived
    selectedItems,
    selectedCartItems, subtotal, discount, shippingCharges, total, allSelected,
    // modal state
    isVoucherModalOpen, setIsVoucherModalOpen,
    // handlers
    getItemKey, toggleSelectAll, toggleItem,
    updateQuantity, deleteItem, deleteSelected,
    checkoutHandler, handleApplyCoupon, handleRemoveCoupon,
    navigate,
  };
}
