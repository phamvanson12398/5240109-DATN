import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '@/features/address/styles/Addresses.css';
import '@/features/user/styles/AccountShared.css';
import PageTitle from '@/shared/components/PageTitle';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import AccountSidebar from '@/features/user/components/AccountSidebar';
import Loader from '@/shared/components/Loader';
import AddressFormDialog from '@/features/address/components/AddressFormDialog';
import {
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    clearAddressErrors,
    clearAddressSuccess
} from '@/features/address/addressSlice';

function AddressesView() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isAuthenticated } = useSelector(state => state.user);
    const { addresses, loading, error, success, message } = useSelector(state => state.address);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            dispatch(fetchAddresses());
        }
    }, [isAuthenticated, dispatch, navigate]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearAddressErrors());
        }
        if (success) {
            if (message) toast.success(message);
            dispatch(clearAddressSuccess());
            setOpenDialog(false);
            setSelectedAddress(null);
        }
    }, [error, success, message, dispatch]);

    const handleOpenAdd = () => {
        setSelectedAddress(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (address) => {
        setSelectedAddress(address);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedAddress(null);
    };

    const handleFormSubmit = (formData) => {
        if (selectedAddress) {
            dispatch(updateAddress({ id: selectedAddress._id, addressData: formData }));
        } else {
            dispatch(addAddress(formData));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
            dispatch(deleteAddress(id));
        }
    };

    const handleSetDefault = (id) => {
        dispatch(setDefaultAddress(id));
    };

    const getLabelClass = (label) => {
        switch (label) {
            case 'Nhà riêng': return 'label-home';
            case 'Văn phòng': return 'label-company';
            default: return 'label-other';
        }
    };

    return (
        <>
            <PageTitle title="Địa chỉ - Góc Sách" />
            <Navbar />

            <div className="account-container">
                <div className="account-content">
                    <AccountSidebar />

                    <div className="account-main">
                        
                        {/* HERO HEADER - ĐỒNG BỘ GIAO DIỆN */}
                        <div className="account-hero">
                            <div className="hero-content">
                                <span className="hero-badge">Sổ địa chỉ</span>
                                <h1 className="hero-title">
                                    Địa chỉ <br />
                                    <span className="hero-title-highlight">Của tôi</span>
                                </h1>
                                <p className="hero-desc">
                                    Quản lý các địa chỉ nhận hàng để việc đặt hàng trở nên nhanh chóng và thuận tiện hơn. Mỗi địa chỉ đều được bảo mật.
                                </p>
                            </div>
                            <div className="hero-stats">
                                <p className="hero-stats-label">Số địa chỉ lưu</p>
                                <div className="hero-stats-number">
                                    <span className="number">{addresses.length}</span>
                                    <span className="unit">nơi</span>
                                </div>
                            </div>
                            <div className="hero-decoration-1"></div>
                            <div className="hero-decoration-2"></div>
                        </div>

                        <div className="account-card">
                            <div className="addresses-header" style={{marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <h1 className="addresses-heading" style={{margin: 0, fontSize: '20px', fontWeight: 900}}>Địa chỉ của tôi</h1>
                                <button className="add-address-btn" onClick={handleOpenAdd}>
                                    <span style={{ fontSize: '20px' }}>+</span> Thêm địa chỉ mới
                                </button>
                            </div>

                            {loading && addresses.length === 0 ? (
                                <Loader />
                            ) : (
                                <div className="address-list">
                                    {addresses.length === 0 ? (
                                        <div className="empty-addresses">
                                            <span className="empty-icon">📍</span>
                                            <p className="empty-text">Bạn chưa có địa chỉ nào lưu trong sổ địa chỉ.</p>
                                        </div>
                                    ) : (
                                        addresses.map((addr) => (
                                            <div key={addr._id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                                                <div className="address-info">
                                                    <span className={`address-label ${getLabelClass(addr.addressLabel)}`}>
                                                        {addr.addressLabel}
                                                    </span>
                                                    <div className="address-user-info">
                                                        <span className="address-name">{addr.fullName}</span>
                                                        <span className="address-phone">{addr.phone}</span>
                                                    </div>
                                                    <p className="address-detail-text">
                                                        {addr.streetAddress}<br />
                                                        {addr.ward}, {addr.district}, {addr.province}
                                                    </p>
                                                    {addr.isDefault && (
                                                        <span className="address-default-badge">Mặc định</span>
                                                    )}
                                                </div>

                                                <div className="address-actions">
                                                    <div className="action-links">
                                                        <span className="action-link" onClick={() => handleOpenEdit(addr)}>Cập nhật</span>
                                                        {!addr.isDefault && (
                                                            <span className="action-link delete" onClick={() => handleDelete(addr._id)}>Xóa</span>
                                                        )}
                                                    </div>
                                                    {!addr.isDefault && (
                                                        <button 
                                                            className="set-default-btn"
                                                            onClick={() => handleSetDefault(addr._id)}
                                                        >
                                                            Thiết lập mặc định
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AddressFormDialog
                open={openDialog}
                handleClose={handleCloseDialog}
                initialData={selectedAddress}
                onSubmit={handleFormSubmit}
                loading={loading}
            />

            <Footer />
        </>
    );
}

export default AddressesView;
