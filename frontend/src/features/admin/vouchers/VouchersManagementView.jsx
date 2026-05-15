import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Tooltip,
    IconButton,
    Switch
} from '@mui/material';
import {
    AddOutlined as AddIcon,
    AllInclusive as AllIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    ChevronLeftOutlined as ChevronLeftOutlinedIcon,
    ChevronRightOutlined as ChevronRightOutlinedIcon,
    ConfirmationNumberOutlined as ConfirmationNumberIcon,
    ContentCopyOutlined as CopyIcon,
    DateRange as DateIcon,
    DeleteOutlineOutlined as DeleteIcon,
    EditOutlined as EditIcon,
    EventBusyOutlined as EventBusyIcon,
    FileDownloadOutlined as DownloadIcon,
    FilterListOutlined as FilterIcon,
    RedeemOutlined as RedeemIcon,
    SearchOffOutlined as SearchOffIcon,
    SearchOutlined as SearchIcon,
    TableChart as TableIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

import {
    fetchAllAdminVouchers,
    deleteVoucher,
    toggleVoucherStatus
} from '@/features/admin/state/adminSlice';
import { formatVND } from '@/shared/utils/formatCurrency';
import { formatDateTime, formatDateOnly } from '@/shared/utils/formatDate';
import VoucherFormModal from '@/features/admin/vouchers/components/VoucherFormModal';
import VoucherFilterDrawer from '@/features/admin/vouchers/components/VoucherFilterDrawer';
import VoucherExportRangeModal from '@/features/admin/vouchers/components/VoucherExportRangeModal';
import { useVoucherFilters } from '@/features/admin/vouchers/hooks/useVoucherFilters';
import { selectAdminVouchers } from '@/features/admin/state/adminSelectors';
import './styles/VouchersManagement.css';

const VouchersManagementView = () => {
    const dispatch = useDispatch();
    const {
        vouchers,
        totalVouchers,
        totalPages,
        currentPage,
        loading,
        error
    } = useSelector(selectAdminVouchers);

    const [showModal, setShowModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);

    // Search state với debounce
    const [searchQuery, setSearchQuery] = useState('');

    // Logic cho Bộ lọc & Phân trang
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { filters, activeCount, updateFilters, resetFilters } = useVoucherFilters();

    // Logic cho Menu Xuất Excel
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);

    // Effect: Load dữ liệu khi filters hoặc pagination thay đổi
    useEffect(() => {
        dispatch(fetchAllAdminVouchers(filters));
    }, [dispatch, filters]);

    // Effect: Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ search: searchQuery, page: 1 });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, updateFilters]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleApplyFilter = (newFilters) => {
        updateFilters({ ...newFilters, page: 1 });
    };

    const handleResetFilter = () => {
        resetFilters();
        setSearchQuery('');
    };

    const handlePageChange = (newPage) => {
        updateFilters({ page: newPage });
    };

    const handleRowsPerPageChange = (e) => {
        updateFilters({ limit: parseInt(e.target.value), page: 1 });
    };

    const handleCloseExportMenu = () => {
        setAnchorEl(null);
    };

    // --- LOGIC XUẤT EXCEL ---
    const transformVoucherToExcel = (v, index) => {
        const status = getVoucherStatus(v);
        return {
            "STT": index + 1,
            "Mã giảm giá": v.code,
            "Giá trị giảm giá": v.discount.type === 'percentage' ? `${v.discount.value}%` : formatVND(v.discount.value),
            "Giảm tối đa": v.discount.maxAmount ? formatVND(v.discount.maxAmount) : "Không có",
            "Loại mã": v.type === 'exclusive' ? 'Độc quyền' : v.type === 'limited' ? 'Giới hạn' : 'Phổ thông',
            "Trạng thái": status.label,
            "Ngày tạo": formatDateTime(v.createdAt),
            "Ngày hết hạn": formatDateOnly(v.conditions.endDate),
            "Số lần đã dùng": v.usedCount || 0,
            "Số lần tối đa": v.conditions.usageLimit === -1 ? "Vô hạn" : v.conditions.usageLimit,
            "Đối tượng": v.targeting.isPublic ? "Công khai" : `Giới hạn (${v.targeting.exclusiveUsers?.length || 0} người)`,
            "Ghi chú": v.description || ""
        };
    };

    const generateExcelFile = (data, fileName) => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Mã giảm giá");

            const wscols = [
                { wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
                { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
                { wch: 25 }, { wch: 30 }
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Xuất file Excel thành công!");
        } catch (err) {
            console.error(err);
            toast.error("Format dữ liệu thất bại!");
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportCurrent = () => {
        if (!vouchers || vouchers.length === 0) return toast.warning("Không có dữ liệu để xuất");
        setExportLoading(true);
        const data = vouchers.map((v, i) => transformVoucherToExcel(v, i));
        generateExcelFile(data, "Danh_sach_ma_giam_gia_hien_tai");
        setAnchorEl(null);
    };

    const handleExportAll = async () => {
        setExportLoading(true);
        setAnchorEl(null);
        try {
            const result = await dispatch(fetchAllAdminVouchers({ limit: 1000 })).unwrap();
            const data = result.vouchers.map((v, i) => transformVoucherToExcel(v, i));
            generateExcelFile(data, "Danh_sach_tat_ca_ma_giam_gia");
        } catch {
            toast.error("Không thể lấy toàn bộ dữ liệu");
            setExportLoading(false);
        }
    };

    const handleExportRange = (range) => {
        setExportLoading(true);
        const rangeFilters = {
            startDate: range.startDate,
            endDate: range.endDate,
            limit: 1000
        };

        dispatch(fetchAllAdminVouchers(rangeFilters)).unwrap().then(result => {
            const data = result.vouchers.map((v, i) => transformVoucherToExcel(v, i));
            generateExcelFile(data, `Danh_sach_ma_giam_gia_tu_${range.startDate}_den_${range.endDate}`);
        }).catch(() => {
            toast.error("Lỗi khi lấy dữ liệu theo thời gian");
            setExportLoading(false);
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa mã giảm giá này? Người dùng sẽ không thể sử dụng mã này nữa.')) {
            try {
                await dispatch(deleteVoucher(id)).unwrap();
                toast.success('Xóa mã giảm giá thành công!');
            } catch (err) {
                toast.error(err || 'Xóa thất bại');
            }
        }
    };

    const handleToggleStatus = (id) => {
        dispatch(toggleVoucherStatus(id));
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.info(`Đã sao chép mã: ${code}`, { autoClose: 2000 });
    };

    const getVoucherStatus = (v) => {
        const now = new Date();
        const start = new Date(v.conditions.startDate);
        const end = new Date(v.conditions.endDate);
        const used = v.usedCount || 0;
        const limit = v.conditions.usageLimit;

        if (v.status === 'disabled') return { label: 'Đã vô hiệu', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' };
        if (limit !== -1 && used >= limit) return { label: 'Hết lượt', color: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' };
        if (now > end) return { label: 'Hết hạn', color: 'bg-red-50 text-red-700', dot: 'bg-red-500' };
        if (now < start) return { label: 'Chờ lịch', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' };

        const isNearEnd = (end - now) < (3 * 24 * 60 * 60 * 1000); // Còn dưới 3 ngày
        if (isNearEnd) return { label: 'Sắp hết hạn', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' };

        return { label: 'Hoạt động', color: 'bg-green-50 text-green-700', dot: 'bg-green-500' };
    };

    const getVoucherStatusClass = (label) => {
        switch (label) {
            case 'Hoạt động': return 'active';
            case 'Sắp hết hạn': return 'warning';
            case 'Hết hạn': return 'expired';
            case 'Hết lượt': return 'used-up';
            case 'Chờ lịch': return 'scheduled';
            case 'Đã vô hiệu': return 'disabled';
            default: return 'disabled';
        }
    };

    const getVoucherTypeLabel = (type) => {
        if (type === 'exclusive') return 'Độc quyền';
        if (type === 'limited') return 'Giới hạn';
        return 'Phổ thông';
    };

    const activeVoucherCount = vouchers?.filter((v) => {
        const status = getVoucherStatus(v).label;
        return status === 'Hoạt động' || status === 'Sắp hết hạn';
    }).length || 0;
    const expiredVoucherCount = vouchers?.filter((v) => {
        const status = getVoucherStatus(v).label;
        return status === 'Hết hạn' || status === 'Hết lượt';
    }).length || 0;
    const totalUsedCount = vouchers?.reduce((sum, v) => sum + (v.usedCount || 0), 0) || 0;
    const statCards = [
        {
            icon: <ConfirmationNumberIcon />,
            label: 'Tổng mã giảm giá',
            value: totalVouchers || 0,
            tone: 'neutral',
        },
        {
            icon: <CheckCircleOutlineIcon />,
            label: 'Đang hoạt động',
            value: activeVoucherCount,
            tone: 'success',
        },
        {
            icon: <EventBusyIcon />,
            label: 'Hết hạn / Hết lượt',
            value: expiredVoucherCount,
            tone: 'danger',
        },
        {
            icon: <RedeemIcon />,
            label: 'Tổng lượt dùng',
            value: totalUsedCount,
            tone: 'warning',
        },
    ];

    // Insight Logic - Lấy Top Voucher dựa trên usedCount
    const topVouchers = vouchers ? [...vouchers].sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0)).slice(0, 1) : [];
    const bestVoucher = topVouchers[0];

    return (
        <div className="vouchers-page">
            <div className="vouchers-header">
                <div>
                    <h1 className="vouchers-title">Quản lý mã giảm giá</h1>
                    <p className="vouchers-subtitle">Xem, tạo và quản lý các chương trình khuyến mãi của cửa hàng.</p>
                </div>

                <div className="vouchers-header-actions">
                    <button
                        type="button"
                        className="vouchers-export-button"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                        {exportLoading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                        Xuất Excel
                    </button>
                    <button
                        type="button"
                        className="vouchers-create-button"
                        onClick={() => { setSelectedVoucher(null); setShowModal(true); }}
                    >
                        <AddIcon />
                        Tạo mã giảm giá
                    </button>
                </div>

                <Menu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={handleCloseExportMenu}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem onClick={handleExportCurrent} disabled={exportLoading}>
                        <ListItemIcon>
                            <TableIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Xuất trang hiện tại</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleExportAll} disabled={exportLoading}>
                        <ListItemIcon>
                            <AllIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Xuất tất cả</ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setIsRangeModalOpen(true);
                            handleCloseExportMenu();
                        }}
                        disabled={exportLoading}
                    >
                        <ListItemIcon>
                            <DateIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Xuất theo thời gian</ListItemText>
                    </MenuItem>
                </Menu>
            </div>

            <div className="vouchers-stats-grid">
                {statCards.map((stat) => (
                    <VoucherStatCard key={stat.label} {...stat} />
                ))}
            </div>

            <div className="vouchers-table-card">
                <div className="vouchers-toolbar">
                    <div>
                        <h2 className="vouchers-section-title">
                            <TableIcon />
                            Danh sách mã giảm giá
                        </h2>
                        <p className="vouchers-section-subtitle">Hiển thị {vouchers?.length || 0} / {totalVouchers || 0} mã giảm giá</p>
                    </div>

                    <div className="vouchers-toolbar-actions">
                        <button
                            type="button"
                            className={`vouchers-filter-button ${activeCount > 0 ? 'active' : ''}`}
                            onClick={() => setIsFilterOpen(true)}
                        >
                            <FilterIcon />
                            Bộ lọc
                            {activeCount > 0 && <span>{activeCount}</span>}
                        </button>
                        {activeCount > 0 && (
                            <button type="button" className="vouchers-reset-button" onClick={handleResetFilter}>
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </div>

                <div className="vouchers-search-row">
                    <div className="vouchers-search-field">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã giảm giá hoặc tên chiến dịch..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="vouchers-table-scroll">
                    <table className="vouchers-table">
                        <thead>
                            <tr>
                                <th>Mã giảm giá</th>
                                <th>Giá trị / Loại</th>
                                <th>Cấu hình sử dụng</th>
                                <th>Thời hạn</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && !vouchers ? (
                                <tr>
                                    <td colSpan="6" className="vouchers-loading-cell">
                                        <CircularProgress className="vouchers-loading-spinner" size={38} thickness={4} />
                                        <span>Đang đồng bộ dữ liệu từ server...</span>
                                    </td>
                                </tr>
                            ) : vouchers?.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="vouchers-empty-cell">
                                        <div className="vouchers-empty-state">
                                            <SearchOffIcon />
                                            <strong>Không tìm thấy mã giảm giá nào</strong>
                                            <span>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</span>
                                            <button type="button" onClick={handleResetFilter}>Xóa bộ lọc</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                vouchers.map((v) => {
                                    const status = getVoucherStatus(v);
                                    const limit = v.conditions.usageLimit;
                                    const used = v.usedCount || 0;
                                    const usagePercent = limit > 0 ? Math.round((used / limit) * 100) : 0;
                                    const usageWidth = `${Math.min(usagePercent, 100)}%`;
                                    const isUsageHigh = usagePercent > 90;

                                    return (
                                        <tr key={v._id}>
                                            <td>
                                                <div className="voucher-code-cell">
                                                    <div className="voucher-code-badge">
                                                        <code>{v.code}</code>
                                                        <Tooltip title="Copy mã">
                                                            <IconButton size="small" onClick={() => handleCopyCode(v.code)}>
                                                                <CopyIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                    <span>ID: ...{v._id.slice(-6)}</span>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="voucher-value-cell">
                                                    <strong>
                                                        {v.discount.type === 'percentage' ? `${v.discount.value}%` : formatVND(v.discount.value)}
                                                    </strong>
                                                    <span>{getVoucherTypeLabel(v.type)}</span>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="voucher-usage-cell">
                                                    <div className="voucher-usage-meta">
                                                        <span>{used}/{limit === -1 ? '∞' : limit} lượt</span>
                                                        <strong className={isUsageHigh ? 'danger' : ''}>{usagePercent}%</strong>
                                                    </div>
                                                    <div className="voucher-progress-track">
                                                        <div
                                                            className={`voucher-progress-fill ${isUsageHigh ? 'danger' : ''}`}
                                                            style={{ width: usageWidth }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="voucher-date-cell">
                                                    <span>
                                                        <i className="start" />
                                                        {formatDateOnly(v.conditions.startDate)}
                                                    </span>
                                                    <strong className={status.label === 'Sắp hết hạn' ? 'warning' : ''}>
                                                        <i className={status.label === 'Sắp hết hạn' ? 'warning' : 'end'} />
                                                        {formatDateOnly(v.conditions.endDate)}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`voucher-status-badge ${getVoucherStatusClass(status.label)}`}>
                                                    <i />
                                                    {status.label}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="voucher-actions">
                                                    <Tooltip title={v.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                                                        <Switch
                                                            size="small"
                                                            checked={v.status === 'active'}
                                                            onChange={() => handleToggleStatus(v._id)}
                                                            color="primary"
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Chỉnh sửa">
                                                        <IconButton
                                                            size="small"
                                                            className="voucher-icon-button edit"
                                                            onClick={() => { setSelectedVoucher(v); setShowModal(true); }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Xóa">
                                                        <IconButton
                                                            size="small"
                                                            className="voucher-icon-button delete"
                                                            onClick={() => handleDelete(v._id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="vouchers-pagination">
                    <div className="vouchers-pagination-info">
                        <span>Hiển thị <strong>{vouchers?.length || 0}</strong> trên <strong>{totalVouchers || 0}</strong> mã giảm giá</span>
                        <label>
                            Bản ghi mỗi trang:
                            <select value={filters.limit} onChange={handleRowsPerPageChange}>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </label>
                    </div>

                    <div className="vouchers-page-buttons">
                        <button
                            type="button"
                            disabled={currentPage === 1 || loading}
                            onClick={() => handlePageChange(currentPage - 1)}
                            aria-label="Trang trước"
                        >
                            <ChevronLeftOutlinedIcon />
                        </button>

                        {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => handlePageChange(page)}
                                className={currentPage === page ? 'active' : ''}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            disabled={currentPage === totalPages || totalPages === 0 || loading}
                            onClick={() => handlePageChange(currentPage + 1)}
                            aria-label="Trang sau"
                        >
                            <ChevronRightOutlinedIcon />
                        </button>
                    </div>
                </div>
            </div>

            <div className="vouchers-insight-grid">
                <div className="vouchers-insight-card">
                    <div>
                        <span className="vouchers-insight-kicker">Gợi ý</span>
                        <h3>Tối ưu hiệu quả mã giảm giá</h3>
                        <p>
                            {bestVoucher
                                ? `Mã "${bestVoucher.code}" đang dẫn đầu với ${bestVoucher.usedCount || 0} lượt dùng. Hãy cân nhắc gia hạn hoặc tung thêm các mã tương tự.`
                                : 'Bắt đầu triển khai các chiến dịch mới để theo dõi hiệu quả sử dụng mã giảm giá của khách hàng.'}
                        </p>
                    </div>
                    <button type="button" onClick={() => setIsFilterOpen(true)}>
                        Mở bộ lọc
                    </button>
                </div>

                <div className="vouchers-filter-card">
                    <div className="vouchers-filter-card-icon">
                        <FilterIcon />
                    </div>
                    <h4>Tìm kiếm nâng cao</h4>
                    <p>Sử dụng bộ lọc để phân tích theo mức phí, thời gian hoặc trạng thái sử dụng.</p>
                    <button type="button" onClick={() => setIsFilterOpen(true)}>
                        Mở bộ lọc
                    </button>
                </div>
            </div>

            {showModal && (
                <VoucherFormModal
                    voucher={selectedVoucher}
                    onClose={() => setShowModal(false)}
                />
            )}

            <VoucherFilterDrawer
                open={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                currentFilters={filters}
                onApply={handleApplyFilter}
                onReset={handleResetFilter}
            />

            <VoucherExportRangeModal
                open={isRangeModalOpen}
                onClose={() => setIsRangeModalOpen(false)}
                onConfirm={handleExportRange}
            />
        </div>
    );
};

const VoucherStatCard = ({ icon, label, value, tone }) => (
    <div className={`voucher-stat-card ${tone}`}>
        <div className="voucher-stat-icon">{icon}</div>
        <div>
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    </div>
);

export default VouchersManagementView;
