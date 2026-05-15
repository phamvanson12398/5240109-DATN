import React from 'react';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import formatVND from '@/shared/utils/formatCurrency.js';

const getStatusMeta = (status) => {
    const normalized = String(status || '').toLowerCase();

    if (normalized.includes('delivered') || normalized.includes('đã giao') || normalized.includes('completed')) {
        return { text: 'Đã giao', className: 'completed' };
    }
    if (normalized.includes('shipped') || normalized.includes('shipping') || normalized.includes('đang giao')) {
        return { text: 'Đang giao', className: 'shipping' };
    }
    if (normalized.includes('cancel') || normalized.includes('hủy')) {
        return { text: 'Đã hủy', className: 'cancelled' };
    }
    if (normalized.includes('processing') || normalized.includes('xử lý')) {
        return { text: 'Đang xử lý', className: 'shipping' };
    }

    return { text: status === 'Pending' ? 'Chờ xử lý' : (status || 'Chờ xử lý'), className: 'pending' };
};

export default function OrdersTable({ orders }) {
    if (!orders || orders.length === 0) {
        return (
            <section className="admin-orders-card empty">
                <p>Chưa có đơn hàng nào.</p>
            </section>
        );
    }

    return (
        <section className="admin-orders-card">
            <div className="admin-orders-header">
                <div>
                    <h3>Đơn hàng gần đây</h3>
                    <p>5 đơn hàng mới nhất cần theo dõi</p>
                </div>
                <button type="button" className="admin-orders-filter">
                    <FilterListOutlinedIcon />
                    <span>Lọc</span>
                </button>
            </div>

            <div className="admin-orders-table-wrap">
                <table className="admin-orders-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Ngày</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th aria-label="Thao tác"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => {
                            

                            const orderId = order.orderId || order._id || `UNKNOWN-${index}`;
                            const dateStr = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit', year: 'numeric' });
                            const customerName = order.user?.name || order.shippingInfo?.fullName || order.customer || 'Khách vãng lai';
                            const status = order.orderStatus || order.status || 'Chờ xử lý';
                            const total = order.totalPrice || order.total || 0;
                            const statusMeta = getStatusMeta(status);
                            
                            return (
                                <tr key={orderId}>
                                    <td>
                                        <span className="admin-order-id">#{String(orderId).substring(0, 8)}</span>
                                    </td>
                                    <td>
                                        <div className="admin-order-customer">
                                            <span>{String(customerName).charAt(0).toUpperCase()}</span>
                                            <strong>{customerName}</strong>
                                        </div>
                                    </td>
                                    <td>{dateStr}</td>
                                    <td>
                                        <strong>{formatVND(total)}</strong>
                                    </td>
                                    <td>
                                        <span className={`admin-status-badge ${statusMeta.className}`}>
                                            {statusMeta.text}
                                        </span>
                                    </td>
                                    <td className="admin-order-actions">
                                        <button type="button" aria-label="Mở thao tác đơn hàng">
                                            <MoreHorizOutlinedIcon />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
