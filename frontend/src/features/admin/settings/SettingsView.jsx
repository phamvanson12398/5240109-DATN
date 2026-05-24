import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { fetchSettings, updateSettings } from '@/features/admin/state/adminSlice';
import { selectAdminSettings } from '@/features/admin/state/adminSelectors';
import './styles/Settings.css';

function SettingsView() {
    const dispatch = useDispatch();
    const { settings, loading, error } = useSelector(selectAdminSettings);

    const [formData, setFormData] = useState({
        adminName: '',
        email: '',
        companyName: '',
        address: '',
        notifications: {
            newOrders: true,
            lowStock: true,
            newUsers: true,
            newReviews: true
        }
    });

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings) {
            setFormData({
                adminName: settings.adminName || '',
                email: settings.email || '',
                companyName: settings.companyName || '',
                address: settings.address || '',
                notifications: settings.notifications || {
                    newOrders: true,
                    lowStock: true,
                    newUsers: true,
                    newReviews: true
                }
            });
        }
    }, [settings]);

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'top-center',
                autoClose: 3000
            });
        }
    }, [error]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [name]: checked
            }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            await dispatch(updateSettings(formData)).unwrap();

            toast.success('Đã lưu cài đặt thành công!', {
                position: 'top-center',
                autoClose: 2000
            });
        } catch (err) {
            toast.error(err || 'Lưu cài đặt thất bại', {
                position: 'top-center',
                autoClose: 3000
            });
        }
    };

    if (loading && !settings) {
        return (
            <div className="settings-loading">
                <div className="settings-loading-spinner"></div>
                <p>Đang tải cài đặt...</p>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <div className="settings-main">
                <div className="settings-header">
                    {/* <div>
                        <span className="settings-eyebrow">System settings</span>
                        <h2 className="settings-title">Cấu hình hệ thống</h2>
                        <p className="settings-subtitle">
                            Quản lý thông tin cửa hàng và thiết lập cơ bản cho GÓC SÁCH.
                        </p>
                    </div> */}
                </div>

                <div className="settings-tabs" aria-label="Thẻ cài đặt">
                    <button type="button" className="active">Thông tin cửa hàng</button>
                    <button type="button">Thanh toán</button>
                    <button type="button">Vận chuyển</button>
                    <button type="button">Thông báo</button>
                    <button type="button">Bảo mật</button>
                </div>

                <div className="settings-workspace">
                    <form className="settings-form" onSubmit={handleSave}>
                        <div className="settings-section">
                            <div className="section-header">
                                <span className="section-icon">
                                    <StorefrontOutlinedIcon />
                                </span>
                                <div>
                                    <h3 className="section-title">Thông tin chung</h3>
                                    <p>Thông tin hiển thị và liên hệ chính của cửa hàng.</p>
                                </div>
                            </div>

                            <div className="settings-grid">
                                <div className="form-group">
                                    <label htmlFor="companyName">Tên cửa hàng</label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="GÓC SÁCH"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="adminName">Tên quản trị viên</label>
                                    <input
                                        type="text"
                                        id="adminName"
                                        name="adminName"
                                        value={formData.adminName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên quản trị viên"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email liên hệ</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="quantri@sachoi.vn"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="settingsPhone">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        id="settingsPhone"
                                        placeholder="090 000 0000"
                                    />
                                </div>

                                <div className="form-group full">
                                    <label htmlFor="address">Địa chỉ</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="123 Đường ABC, Quận 1, TP.HCM"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="settings-section">
                            <div className="section-header">
                                <span className="section-icon">
                                    <SettingsOutlinedIcon />
                                </span>
                                <div>
                                    <h3 className="section-title">Cấu hình cơ bản</h3>
                                    <p>Các thiết lập hiển thị chung cho hệ thống quản trị.</p>
                                </div>
                            </div>

                            <div className="settings-grid">
                                <div className="form-group">
                                    <label htmlFor="currency">Tiền tệ</label>
                                    <select id="currency" defaultValue="VND">
                                        <option value="VND">VND - Việt Nam Đồng</option>
                                        <option value="USD">USD - Đô la Mỹ</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="timezone">Múi giờ</label>
                                    <select id="timezone" defaultValue="Asia/Ho_Chi_Minh">
                                        <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                                        <option value="UTC">UTC</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="settings-section">
                            <div className="section-header">
                                <span className="section-icon">
                                    <NotificationsOutlinedIcon />
                                </span>
                                <div>
                                    <h3 className="section-title">Thông báo</h3>
                                    <p>Bật hoặc tắt các cảnh báo vận hành gửi đến quản trị viên.</p>
                                </div>
                            </div>

                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <span>
                                        <strong>Đơn hàng mới</strong>
                                        <small>Nhận cảnh báo khi khách hàng tạo đơn.</small>
                                    </span>
                                    <input
                                        type="checkbox"
                                        name="newOrders"
                                        checked={formData.notifications.newOrders}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="settings-toggle" aria-hidden="true"></span>
                                </label>

                                <label className="checkbox-label">
                                    <span>
                                        <strong>Sản phẩm sắp hết hàng</strong>
                                        <small>Cảnh báo khi tồn kho gần chạm ngưỡng thấp.</small>
                                    </span>
                                    <input
                                        type="checkbox"
                                        name="lowStock"
                                        checked={formData.notifications.lowStock}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="settings-toggle" aria-hidden="true"></span>
                                </label>

                                <label className="checkbox-label">
                                    <span>
                                        <strong>Người dùng mới</strong>
                                        <small>Theo dõi tài khoản khách hàng vừa đăng ký.</small>
                                    </span>
                                    <input
                                        type="checkbox"
                                        name="newUsers"
                                        checked={formData.notifications.newUsers}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="settings-toggle" aria-hidden="true"></span>
                                </label>

                                <label className="checkbox-label">
                                    <span>
                                        <strong>Đánh giá mới</strong>
                                        <small>Nhận thông báo khi sản phẩm có đánh giá mới.</small>
                                    </span>
                                    <input
                                        type="checkbox"
                                        name="newReviews"
                                        checked={formData.notifications.newReviews}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="settings-toggle" aria-hidden="true"></span>
                                </label>
                            </div>
                        </div>

                        <div className="settings-actions">
                            <button type="button" className="btn-cancel">
                                Hủy
                            </button>
                            <button type="submit" className="btn-save">
                                <SaveOutlinedIcon />
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>

                    <aside className="settings-side-panel">
                        <div className="settings-side-card">
                            <div className="side-card-icon">
                                <StorefrontOutlinedIcon />
                            </div>
                            <h3>Logo cửa hàng</h3>
                            <p>Cập nhật bộ nhận diện GÓC SÁCH cho các trang bán hàng.</p>
                            <button type="button">Tải logo</button>
                        </div>

                        <div className="settings-side-card status">
                            <span className="status-dot"></span>
                            <h3>Trạng thái cửa hàng</h3>
                            <p>Hệ thống đang hoạt động ổn định.</p>
                        </div>

                        <div className="settings-side-card help">
                            <HelpOutlineOutlinedIcon />
                            <h3>Cần hỗ trợ?</h3>
                            <p>Xem tài liệu cấu hình hoặc liên hệ đội kỹ thuật khi cần thay đổi nâng cao.</p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default SettingsView;
