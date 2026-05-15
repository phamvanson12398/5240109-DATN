import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getOrderDetails } from '@/features/orders/orderSlice';

/**
 * useOrderDetails — gom logic fetch chi tiết đơn hàng.
 * OrderDetailsView chỉ còn JSX + exportToPDF.
 */
export function useOrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { loading, error, orderDetails } = useSelector((s) => s.order);
  const { user } = useSelector((s) => s.user);

  useEffect(() => {
    if (id) dispatch(getOrderDetails(id));
  }, [dispatch, id]);

  const formattedDate = orderDetails?.createdAt
    ? new Date(orderDetails.createdAt).toLocaleDateString('vi-VN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return { loading, error, orderDetails, user, formattedDate };
}
