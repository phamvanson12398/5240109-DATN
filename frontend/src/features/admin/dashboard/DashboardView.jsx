import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import {
    fetchDashboardStats,
    fetchRecentOrders,
    fetchAllProducts,
    fetchRevenueAnalytics
} from '@/features/admin/state/adminSlice';

import { selectAdminDashboard } from '@/features/admin/state/adminSelectors';

import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

import KPISection from '@/features/admin/dashboard/components/KPISection';
import RevenueChart from '@/features/admin/dashboard/components/RevenueChart';
import OrdersTable from '@/features/admin/dashboard/components/OrdersTable';

import '@/features/admin/dashboard/styles/Dashboard.css';

function DashboardView() {
    const dispatch = useDispatch();

    const dateInputRef = useRef(null);

    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const [selectingStep, setSelectingStep] = useState('start');

    const { isAuthenticated, user } = useSelector(state => state.user);

    const {
        stats,
        recentOrders,
        revenueAnalytics,
        loading,
        error
    } = useSelector(selectAdminDashboard);

    const products = useSelector(state => state.admin.products);

    const userRole = user?.role_id?.name || user?.role;

    const bestSellingProducts = useMemo(() => {
        const productSource =
            Array.isArray(products) && products.length > 0
                ? products
                : Array.isArray(stats?.products)
                    ? stats.products
                    : [];

        return [...productSource]
            .sort((a, b) => Number(b?.sold || 0) - Number(a?.sold || 0))
            .slice(0, 3);
    }, [products, stats]);

    const formatCompactPrice = (price) => {
        const amount = Number(price || 0);

        if (amount >= 1000000) {
            return `${Number((amount / 1000000).toFixed(1))}tr`;
        }

        return `${Math.round(amount / 1000)}k`;
    };

    const formatSoldCount = (sold) => {
        const value = Number(sold || 0);

        if (value >= 1000) {
            return `${Number((value / 1000).toFixed(1))}k`;
        }

        return value;
    };

    const formatDateRangeLabel = () => {
        const { startDate, endDate } = dateRange;

        if (!startDate && !endDate) return 'Chọn khoảng ngày';

        const format = (date) => new Date(date).toLocaleDateString('vi-VN');

        if (startDate && endDate) {
            return `${format(startDate)} - ${format(endDate)}`;
        }

        return `Từ ${format(startDate)} - chọn ngày kết thúc`;
    };

    const handleOpenDatePicker = () => {
        if (dateInputRef.current?.showPicker) {
            dateInputRef.current.showPicker();
        } else {
            dateInputRef.current?.click();
        }
    };

    const handleDateChange = (e) => {
        const selectedValue = e.target.value;

        if (!selectedValue) return;

        if (selectingStep === 'start') {
            setDateRange({
                startDate: selectedValue,
                endDate: ''
            });

            setSelectingStep('end');

            setTimeout(() => {
                if (dateInputRef.current?.showPicker) {
                    dateInputRef.current.showPicker();
                } else {
                    dateInputRef.current?.click();
                }
            }, 150);

            return;
        }

        const nextRange = {
            ...dateRange,
            endDate: selectedValue
        };

        if (new Date(nextRange.startDate) > new Date(nextRange.endDate)) {
            toast.error('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu');

            setDateRange({
                startDate: '',
                endDate: ''
            });

            setSelectingStep('start');
            return;
        }

        setDateRange(nextRange);
        setSelectingStep('start');

        dispatch(fetchDashboardStats(nextRange));
        dispatch(fetchRevenueAnalytics(nextRange));
    };

    const handleResetDateRange = () => {
        setDateRange({
            startDate: '',
            endDate: ''
        });

        setSelectingStep('start');

        if (dateInputRef.current) {
            dateInputRef.current.value = '';
        }

        dispatch(fetchDashboardStats());
        dispatch(fetchRevenueAnalytics());
    };

    useEffect(() => {
        if (isAuthenticated && userRole === 'admin') {
            dispatch(fetchDashboardStats());
            dispatch(fetchRecentOrders(5));
            dispatch(fetchAllProducts());
            dispatch(fetchRevenueAnalytics());
        }
    }, [dispatch, isAuthenticated, userRole]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && userRole !== 'admin' && userRole !== 'staff') {
        toast.error('Bạn không có quyền truy cập trang này');
        return <Navigate to="/" replace />;
    }

    if (loading && !stats) {
        return (
            <div className="admin-dashboard-loading">
                <div className="admin-spinner" />
            </div>
        );
    }

    const exportToPDF = async () => {
        const element = document.getElementById('dashboard-content');

        if (!element) {
            toast.error('Không tìm thấy vùng dữ liệu để xuất PDF');
            return;
        }

        const toastId = toast.loading('Đang khởi tạo PDF...');

        try {
            const style = document.createElement('style');

            style.id = 'hide-scrollbar-style';
            style.innerHTML = `
                *::-webkit-scrollbar { display: none !important; }
                * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
                .overflow-x-auto { overflow: visible !important; }
                #dashboard-content { background-color: #ffffff !important; }
                .bg-slate-50, .bg-slate-100, .bg-gray-50 { background-color: #ffffff !important; }
                .border { border-color: #e2e8f0 !important; }
            `;

            document.head.appendChild(style);

            const dataUrl = await toJpeg(element, {
                quality: 0.98,
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                cacheBust: true,
                skipFonts: false,
                imagePlaceholder:
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                filter: (node) => !node?.classList?.contains('no-print'),
                style: {
                    fontFamily: 'sans-serif',
                    margin: '0',
                    padding: '40px',
                    width: '1280px',
                    maxWidth: 'none'
                }
            });

            document.head.removeChild(style);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pdfWidth - margin * 2;

            const imgProps = pdf.getImageProperties(dataUrl);
            const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

            let heightLeft = contentHeight;
            let position = 0;
            const pageHeight = pdfHeight - margin * 2;

            pdf.addImage(dataUrl, 'JPEG', margin, margin, contentWidth, contentHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - contentHeight + margin;
                pdf.addPage();
                pdf.addImage(dataUrl, 'JPEG', margin, position, contentWidth, contentHeight);
                heightLeft -= pageHeight;
            }

            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();

            const filename = `Dashboard_${day}_${month}_${year}.pdf`;

            pdf.save(filename);

            toast.update(toastId, {
                render: 'Đã xuất PDF thành công!',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
        } catch (err) {
            console.error(err);

            toast.update(toastId, {
                render: 'Lỗi trong quá trình xuất PDF!',
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    return (
        <div id="dashboard-content" className="dashboard-content">
            <div className="admin-dashboard-header">
                <div>
                    <h2>Tổng Quan Cửa Hàng</h2>
                    <p>
                        Chào mừng trở lại, {user?.name || 'Quản trị viên'}.
                        Đây là tình hình vận hành hôm nay.
                    </p>
                </div>

                <div className="admin-dashboard-actions">
                    <div className="admin-date-picker-wrapper">
                        <button
                            type="button"
                            className="admin-dashboard-action secondary"
                            onClick={handleOpenDatePicker}
                        >
                            <CalendarMonthOutlinedIcon />
                            {formatDateRangeLabel()}
                        </button>

                        <input
                            ref={dateInputRef}
                            type="date"
                            value={
                                selectingStep === 'start'
                                    ? dateRange.startDate
                                    : dateRange.endDate
                            }
                            min={selectingStep === 'end' ? dateRange.startDate : undefined}
                            onChange={handleDateChange}
                            className="admin-hidden-date-input"
                        />
                    </div>

                    {(dateRange.startDate || dateRange.endDate) && (
                        <button
                            type="button"
                            className="admin-dashboard-action secondary no-print"
                            onClick={handleResetDateRange}
                        >
                            Xóa lọc
                        </button>
                    )}

                    <button
                        type="button"
                        className="admin-dashboard-action primary no-print"
                        onClick={exportToPDF}
                    >
                        <FileDownloadOutlinedIcon />
                        Xuất PDF
                    </button>
                </div>
            </div>

            {stats && <KPISection stats={stats} />}

            <div className="admin-dashboard-grid">
                <RevenueChart
                    analyticsData={revenueAnalytics}
                    loading={loading}
                />

                <aside className="admin-bestseller-card">
                    <div className="admin-bestseller-header">
                        <h4>Sách bán chạy</h4>
                        <Link to="/admin/products">Tất cả</Link>
                    </div>

                    <div className="admin-bestseller-list">
                        {bestSellingProducts.length > 0 ? (
                            bestSellingProducts.map((product) => (
                                <Link
                                    to="/admin/products"
                                    className="admin-bestseller-item"
                                    key={product._id || product.id || product.name}
                                >
                                    <img
                                        src={product.images?.[0]?.url || '/placeholder.png'}
                                        alt={product.name || 'Sản phẩm'}
                                    />

                                    <div className="admin-bestseller-info">
                                        <strong>
                                            {product.name || 'Sản phẩm chưa đặt tên'}
                                        </strong>
                                        <span>
                                            Đã bán: {formatSoldCount(product.sold)} · Kho:{' '}
                                            {product.stock ?? 0}
                                        </span>
                                    </div>

                                    <b>{formatCompactPrice(product.price)}</b>
                                </Link>
                            ))
                        ) : (
                            <div className="admin-bestseller-empty">
                                Chưa có dữ liệu sản phẩm bán chạy.
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <div className="admin-dashboard-orders">
                <OrdersTable orders={recentOrders} />
            </div>
        </div>
    );
}

export default DashboardView;