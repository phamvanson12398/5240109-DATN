import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyOrders, cancelOrder, removeSuccess, removeErrors } from '@/features/orders/orderSlice';
import { toast } from 'react-toastify';

/**
 * normalizeStatus — map bất kỳ chuỗi trạng thái backend sang key chuẩn.
 */
const normalizeStatus = (status) => {
  if (!status) return 'pending';
  const s = status.toLowerCase().trim();
  if (s.includes('chờ') || s.includes('pending') || s === 'chờ xử lý') return 'pending';
  if (s.includes('đang giao') || s.includes('shipping')) return 'shipping';
  if (s.includes('đã giao') || s.includes('delivered') || s.includes('hoàn thành')) return 'delivered';
  if (s.includes('đã hủy') || s.includes('cancelled')) return 'cancelled';
  return 'pending';
};

/**
 * useMyOrders — gom toàn bộ logic list/filter/cancel orders.
 * MyOrdersView là pure layout component.
 */
export function useMyOrders() {
  const dispatch = useDispatch();

  const [currentTab, setCurrentTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewOrderId, setReviewOrderId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCancelOrderId, setSelectedCancelOrderId] = useState(null);

  const { orders = [], loading, error, cancelSuccess } = useSelector((s) => s.order);
  const { user } = useSelector((s) => s.user);

  // Fetch on mount
  useEffect(() => { dispatch(getMyOrders()); }, [dispatch]);

  // Handle error / cancel success
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(removeErrors());
    }
    if (cancelSuccess) {
      toast.success('Hủy đơn hàng thành công!');
      setIsCancelModalOpen(false);
      setSelectedCancelOrderId(null);
      dispatch(removeSuccess());
      dispatch(getMyOrders());
    }
  }, [dispatch, error, cancelSuccess]);

  // Derived: filtered + sorted orders
  const filteredOrders = useMemo(() => {
    let result = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (currentTab !== 'all') {
      result = result.filter((o) => normalizeStatus(o.orderStatus) === currentTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          (o.orderCode && o.orderCode.toLowerCase().includes(q)) ||
          o._id?.toLowerCase().includes(q) ||
          o.orderItems?.some((item) => item.name?.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, currentTab, searchQuery]);

  // Handlers
  const handleCancelOrder = (id) => {
    setSelectedCancelOrderId(id);
    setIsCancelModalOpen(true);
  };

  const confirmCancelOrder = (reason) => {
    if (selectedCancelOrderId) dispatch(cancelOrder({ id: selectedCancelOrderId, reason }));
  };

  const openReview = (order) => {
    const firstItem = order.orderItems?.[0];
    if (!firstItem) return;
    setReviewProduct({
      _id: firstItem.productId || firstItem.product || firstItem._id,
      name: firstItem.name,
      images: firstItem.images || (firstItem.image ? [{ url: firstItem.image }] : []),
      category: firstItem.category || '',
    });
    setReviewOrderId(order._id);
  };

  const closeReview = () => {
    setReviewProduct(null);
    setReviewOrderId(null);
  };

  return {
    // data
    orders, filteredOrders, loading, error, user,
    // tab / search
    currentTab, setCurrentTab,
    searchQuery, setSearchQuery,
    // review
    reviewProduct, reviewOrderId,
    openReview, closeReview,
    // cancel modal
    isCancelModalOpen, selectedCancelOrderId,
    handleCancelOrder,
    confirmCancelOrder,
    closeCancelModal: () => { setIsCancelModalOpen(false); setSelectedCancelOrderId(null); },
    // helpers
    normalizeStatus,
    dispatch,
    getMyOrders,
  };
}
