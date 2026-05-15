
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAllOrders, generateTrackingCode, updateOrderStatus } from '@/features/admin/state/adminSlice';
import { selectAdminOrders } from '@/features/admin/state/adminSelectors';
import { formatVND } from '@/shared/utils/formatCurrency';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    Button,
    Typography,
    Box
} from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import './styles/OrdersManagement.css';

const ORDER_STATUS_OPTIONS = ['Chờ xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];

const STATUS_TABS = [
    { value: 'all', label: 'Tất cả' },
    ...ORDER_STATUS_OPTIONS.map((status) => ({ value: status, label: status })),
];

const getCustomerInitial = (name) => (name?.trim()?.charAt(0) || 'K').toUpperCase();

const getPaymentIcon = (method = 'COD') => {
    const normalizedMethod = method.toLowerCase();

    if (normalizedMethod.includes('cod') || normalizedMethod.includes('nhận')) {
        return <PaymentsOutlinedIcon />;
    }

    if (normalizedMethod.includes('vnpay') || normalizedMethod.includes('wallet')) {
        return <AccountBalanceWalletOutlinedIcon />;
    }

    return <CreditCardOutlinedIcon />;
};

const getOrderPaymentMethod = (order) => (
    order?.paymentMethod ||
    order?.paymentInfo?.method ||
    order?.paymentInfo?.provider ||
    'COD'
);

const getPaymentLabel = (method = 'COD') => {
    const normalizedMethod = method.toLowerCase();

    if (normalizedMethod.includes('vnpay')) return 'VNPay';
    if (normalizedMethod.includes('cod') || normalizedMethod.includes('nhận')) return 'COD';

    return method;
};

/**
 * OrdersManagement - Trang quản lý đơn hàng
 */
function OrdersManagementView() {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector(selectAdminOrders);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isGeneratingTrackingCode, setIsGeneratingTrackingCode] = useState(false);

    // State cho Modal cập nhật thông tin bổ sung
    const [openModal, setOpenModal] = useState(false);
    const [modalData, setModalData] = useState({
        orderId: '',
        status: '',
        trackingNumber: '',
        cancellationReason: ''
    });

    // Fetch orders khi component mount
    useEffect(() => {
        dispatch(fetchAllOrders());
    }, [dispatch]);

    // Hiển thị error
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Xử lý khi chọn trạng thái từ dropdown
    const handleStatusChange = (id, newStatus) => {
        const order = orders.find(o => o._id === id);
        
        if (newStatus === "Đang giao") {
            setModalData({
                orderId: id,
                status: newStatus,
                trackingNumber: order.trackingNumber || '',
                cancellationReason: ''
            });
            setOpenModal(true);
        } else if (newStatus === "Đã hủy") {
            setModalData({
                orderId: id,
                status: newStatus,
                trackingNumber: '',
                cancellationReason: order.cancellationReason || ''
            });
            setOpenModal(true);
        } else {
            // Các trạng thái khác cập nhật trực tiếp
            executeStatusUpdate(id, newStatus);
        }
    };

    // Thực thi cập nhật thực sự
    const executeStatusUpdate = async (id, status, extra = {}) => {
        try {
            await dispatch(updateOrderStatus({ id, status, ...extra })).unwrap();
            toast.success(`Đã chuyển đơn hàng sang trạng thái "${status}"`);
            setOpenModal(false);
        } catch (err) {
            toast.error(err || 'Cập nhật thất bại');
        }
    };

    const normalizeTrackingCode = (value = '') => value.trim().toUpperCase();

    const isTrackingCodeDuplicate = (trackingCode, orderId) => {
        const normalizedCode = normalizeTrackingCode(trackingCode);

        if (!normalizedCode) {
            return false;
        }

        return orders.some((order) => (
            order?._id !== orderId &&
            normalizeTrackingCode(order?.trackingNumber || '') === normalizedCode
        ));
    };

    const handleGenerateTrackingCode = async () => {
        try {
            setIsGeneratingTrackingCode(true);
            const trackingCode = await dispatch(generateTrackingCode()).unwrap();
            setModalData((prev) => ({
                ...prev,
                trackingNumber: trackingCode,
            }));
            toast.success('Tạo mã vận đơn thành công');
        } catch (err) {
            toast.error(err || 'Không thể tạo mã vận đơn');
        } finally {
            setIsGeneratingTrackingCode(false);
        }
    };

    // Xử lý gửi từ Modal
    const handleModalSubmit = () => {
        const { orderId, status, trackingNumber, cancellationReason } = modalData;
        const normalizedTrackingCode = normalizeTrackingCode(trackingNumber);

        if (status === "Đang giao" && !normalizedTrackingCode) {
            return toast.warning('Vui lòng nhập mã vận đơn để khách hàng theo dõi!');
        }

        if (status === "Đang giao" && isTrackingCodeDuplicate(normalizedTrackingCode, orderId)) {
            return toast.error('Mã vận đơn đã tồn tại. Vui lòng tạo mã khác.');
        }

        if (status === "Đã hủy" && !cancellationReason.trim()) {
            return toast.warning('Vui lòng nhập lý do hủy đơn hàng!');
        }

        executeStatusUpdate(orderId, status, { trackingNumber: normalizedTrackingCode, cancellationReason });
    };


    // Filter orders
    const filteredOrders = useMemo(() => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();

        return [...(orders || [])]
            .sort((a, b) => {
                const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bTime - aTime;
            })
            .filter((order) => {
                if (!order) return false;

                const matchesSearch =
                    normalizedSearchTerm === '' ||
                    (order.orderCode && order.orderCode.toLowerCase().includes(normalizedSearchTerm)) ||
                    (order._id && order._id.toLowerCase().includes(normalizedSearchTerm)) ||
                    order.user_id?.name?.toLowerCase().includes(normalizedSearchTerm);

                const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

                return matchesSearch && matchesStatus;
            });
    }, [orders, searchTerm, statusFilter]);

    const statusCounts = useMemo(() => {
        const counts = ORDER_STATUS_OPTIONS.reduce((acc, status) => {
            acc[status] = 0;
            return acc;
        }, { all: orders?.length || 0 });

        (orders || []).forEach((order) => {
            if (Object.prototype.hasOwnProperty.call(counts, order?.orderStatus)) {
                counts[order.orderStatus] += 1;
            }
        });

        return counts;
    }, [orders]);

    const statsCards = [
        {
            label: 'Tổng đơn',
            value: statusCounts.all,
            icon: <ReceiptLongOutlinedIcon />,
            tone: 'neutral',
        },
        {
            label: 'Chờ xử lý',
            value: statusCounts['Chờ xử lý'],
            icon: <PendingActionsOutlinedIcon />,
            tone: 'warning',
        },
        {
            label: 'Đang giao',
            value: statusCounts['Đang giao'],
            icon: <LocalShippingOutlinedIcon />,
            tone: 'info',
        },
        {
            label: 'Đã giao',
            value: statusCounts['Đã giao'],
            icon: <CheckCircleOutlineIcon />,
            tone: 'success',
        },
        {
            label: 'Đã hủy',
            value: statusCounts['Đã hủy'],
            icon: <CancelOutlinedIcon />,
            tone: 'danger',
        },
    ];

    // Get status badge class
    const getStatusClass = (status) => {
        switch (status) {
            case 'Chờ xử lý': return 'status-processing';
            case 'Đang giao': return 'status-shipped';
            case 'Đã giao': return 'status-delivered';
            case 'Đã hủy': return 'status-cancelled';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-header">
                <div>
                    <h2 className="orders-title">Quản lý đơn hàng</h2>
                    <p className="orders-subtitle">Theo dõi và cập nhật trạng thái vận hành của cửa hàng.</p>
                </div>
                <div className="orders-header-meta">
                    <ReceiptLongOutlinedIcon />
                    <span>{filteredOrders.length} đơn đang hiển thị</span>
                </div>
            </div>

            <div className="orders-stats-grid">
                {statsCards.map((stat) => (
                    <div key={stat.label} className={`orders-stat-card ${stat.tone}`}>
                        <div className="orders-stat-icon">{stat.icon}</div>
                        <div>
                            <span>{stat.label}</span>
                            <strong>{stat.value}</strong>
                        </div>
                    </div>
                ))}
            </div>

            <div className="orders-status-tabs" aria-label="Lọc trạng thái đơn hàng">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        className={`orders-status-tab ${statusFilter === tab.value ? 'active' : ''}`}
                        onClick={() => setStatusFilter(tab.value)}
                    >
                        <span>{tab.label}</span>
                        <strong>{statusCounts[tab.value] || 0}</strong>
                    </button>
                ))}
            </div>

            <div className="orders-table-card">
                <div className="orders-toolbar">
                    <div className="orders-search-field">
                        <SearchOutlinedIcon />
                        <input
                            type="text"
                            placeholder="Tìm mã đơn hoặc khách hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className="orders-clear-search"
                                onClick={() => setSearchTerm('')}
                                aria-label="Xóa tìm kiếm"
                            >
                                <ClearOutlinedIcon />
                            </button>
                        )}
                    </div>

                    <div className="orders-filter-select">
                        <FilterListOutlinedIcon />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            {ORDER_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Sản phẩm</th>
                                <th>Tổng tiền</th>
                                <th>Mã vận đơn</th>
                                <th>Thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Ngày</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders && filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => {
                                    const customerName = order.user_id?.name || 'Khách vãng lai';
                                    const paymentMethod = getOrderPaymentMethod(order);
                                    const visibleItems = order.orderItems?.slice(0, 2) || [];
                                    const hiddenItems = Math.max((order.orderItems?.length || 0) - visibleItems.length, 0);

                                    return (
                                        <tr key={order._id}>
                                            <td className="order-id">
                                                <span className="code-highlight">
                                                    {order.orderCode || `#${order._id.slice(-8).toUpperCase()}`}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="customer-cell">
                                                    <span className="customer-avatar">{getCustomerInitial(customerName)}</span>
                                                    <div>
                                                        <div className="customer-name">{customerName}</div>
                                                        {order.user_id?.email && (
                                                            <div className="customer-email">{order.user_id.email}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="order-products">
                                                    {visibleItems.length > 0 ? (
                                                        visibleItems.map((item, index) => (
                                                            <div key={`${item.name}-${index}`} className="order-product-line">
                                                                <span>{item.name || 'Sản phẩm'}</span>
                                                                <strong>x{item.quantity || 1}</strong>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="order-product-line muted">
                                                            <span>Chưa có sản phẩm</span>
                                                        </div>
                                                    )}
                                                    {hiddenItems > 0 && (
                                                        <div className="order-products-more">+{hiddenItems} sản phẩm khác</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="order-total">{formatVND(order.totalPrice || 0)}</td>
                                            <td>
                                                {order.trackingNumber ? (
                                                    <span className="tracking-badge" title={order.trackingNumber}>{order.trackingNumber}</span>
                                                ) : (
                                                    <span className="tracking-empty">Chưa có</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="payment-method">
                                                    {getPaymentIcon(paymentMethod)}
                                                    {getPaymentLabel(paymentMethod)}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    className={`status-select ${getStatusClass(order.orderStatus)}`}
                                                    value={order.orderStatus}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                >
                                                    {ORDER_STATUS_OPTIONS.map((status) => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                                {order.orderStatus === 'Đã hủy' && order.cancellationReason && (
                                                    <div className="cancel-reason-hint" title={order.cancellationReason}>
                                                        Lý do: {order.cancellationReason.slice(0, 15)}{order.cancellationReason.length > 15 ? '...' : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="order-date">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <Link to={`/order/${order._id}`} className="btn-view" title="Xem chi tiết">
                                                        <VisibilityOutlinedIcon />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9" className="no-orders">
                                        <div className="orders-empty-state">
                                            <SearchOffOutlinedIcon />
                                            <strong>Không tìm thấy đơn hàng nào</strong>
                                            <span>Thử thay đổi từ khóa tìm kiếm hoặc trạng thái lọc.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="orders-table-footer">
                    <span>Hiển thị {filteredOrders.length} / {orders?.length || 0} đơn hàng</span>
                </div>
            </div>

            {/* Modal Nhập thông tin bổ sung (Mã vận đơn / Lý do hủy) */}
            <Dialog 
                open={openModal} 
                onClose={() => setOpenModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ className: 'orders-modal-paper' }}
            >
                <DialogTitle className="orders-modal-title">
                    <span className={modalData.status === "Đang giao" ? 'modal-title-icon shipping' : 'modal-title-icon danger'}>
                        {modalData.status === "Đang giao" ? <LocalShippingOutlinedIcon /> : <CancelOutlinedIcon />}
                    </span>
                    {modalData.status === "Đang giao" ? 'Thông tin vận chuyển' : 'Xác nhận hủy đơn'}
                </DialogTitle>
                <DialogContent className="orders-modal-content">
                    <Box className="orders-modal-body">
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Đơn hàng: <strong>#{modalData.orderId.slice(-6).toUpperCase()}</strong>
                        </Typography>
                        
                        {modalData.status === "Đang giao" ? (
                            <Box className="orders-tracking-field-row">
                                <TextField
                                    label="Mã vận đơn (Tracking Number)"
                                    fullWidth
                                    variant="outlined"
                                    value={modalData.trackingNumber}
                                    onChange={(e) => setModalData({
                                        ...modalData,
                                        trackingNumber: e.target.value.toUpperCase()
                                    })}
                                    placeholder="VD20260424A8K2P9"
                                    autoFocus
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleGenerateTrackingCode}
                                    disabled={isGeneratingTrackingCode}
                                    className="orders-generate-code-btn"
                                >
                                    {isGeneratingTrackingCode ? 'Đang tạo...' : 'Tạo mã'}
                                </Button>
                            </Box>
                        ) : (
                            <TextField
                                label="Lý do hủy"
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                margin="normal"
                                value={modalData.cancellationReason}
                                onChange={(e) => setModalData({...modalData, cancellationReason: e.target.value})}
                                placeholder="VD: Khách hàng yêu cầu hủy / Hết hàng..."
                                autoFocus
                            />
                        )}
                        
                        <Typography className="orders-modal-note" variant="caption">
                            <InfoOutlinedIcon />
                            Hệ thống sẽ tự động gửi Email thông báo trạng thái này cho khách hàng.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions className="orders-modal-actions">
                    <Button className="orders-modal-cancel" onClick={() => setOpenModal(false)} color="inherit">Hủy bỏ</Button>
                    <Button 
                        onClick={handleModalSubmit} 
                        variant="contained" 
                        className={modalData.status === "Đang giao" ? 'orders-modal-confirm' : 'orders-modal-confirm danger'}
                    >
                        Xác nhận cập nhật
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Pagination can be added here */}
        </div>
    );
}

export default OrdersManagementView;
