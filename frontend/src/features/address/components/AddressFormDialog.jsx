import React, { useState, useEffect } from 'react';
import { Dialog } from '@mui/material';
import { toast } from 'react-toastify';
import { getProvinces, getDistrictsByProvince, getWardsByDistrict } from '@/shared/api/apiAddress';

function AddressFormDialog({ open, handleClose, initialData, onSubmit, loading }) {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        province: '',
        provinceCode: '',
        district: '',
        districtCode: '',
        ward: '',
        wardCode: '',
        streetAddress: '',
        addressLabel: 'Nhà riêng',
        isDefault: false,
        note: '', 
    });

    const [errors, setErrors] = useState({});
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [addressLoading, setAddressLoading] = useState({
        province: false,
        district: false,
        ward: false
    });

    const themeGradient = "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)";

    useEffect(() => {
        if (!open) {
            setErrors({});
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    fullName: initialData.fullName || '',
                    phone: initialData.phone || '',
                    province: initialData.province || '',
                    provinceCode: initialData.provinceCode || '',
                    district: initialData.district || '',
                    districtCode: initialData.districtCode || '',
                    ward: initialData.ward || '',
                    wardCode: initialData.wardCode || '',
                    streetAddress: initialData.streetAddress || '',
                    addressLabel: initialData.addressLabel || 'Nhà riêng',
                    isDefault: initialData.isDefault || false,
                    note: initialData.note || '',
                });
            } else {
                setFormData({
                    fullName: '',
                    phone: '',
                    province: '',
                    provinceCode: '',
                    district: '',
                    districtCode: '',
                    ward: '',
                    wardCode: '',
                    streetAddress: '',
                    addressLabel: 'Nhà riêng',
                    isDefault: false,
                    note: '',
                });
            }
        }
    }, [open, initialData]);

    useEffect(() => {
        const fetchProvinces = async () => {
            setAddressLoading(prev => ({ ...prev, province: true }));
            try {
                const data = await getProvinces();
                setProvinces(data);
            } catch {
                toast.error("Không thể tải danh sách tỉnh/thành");
            } finally {
                setAddressLoading(prev => ({ ...prev, province: false }));
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        const fetchDistricts = async () => {
            if (!formData.provinceCode) {
                setDistricts([]);
                return;
            }
            setAddressLoading(prev => ({ ...prev, district: true }));
            try {
                const data = await getDistrictsByProvince(formData.provinceCode);
                setDistricts(data);
            } catch {
                toast.error("Không thể tải danh sách quận/huyện");
            } finally {
                setAddressLoading(prev => ({ ...prev, district: false }));
            }
        };
        fetchDistricts();
    }, [formData.provinceCode]);

    useEffect(() => {
        const fetchWards = async () => {
            if (!formData.districtCode) {
                setWards([]);
                return;
            }
            setAddressLoading(prev => ({ ...prev, ward: true }));
            try {
                const data = await getWardsByDistrict(formData.districtCode);
                setWards(data);
            } catch {
                toast.error("Không thể tải danh sách phường/xã");
            } finally {
                setAddressLoading(prev => ({ ...prev, ward: false }));
            }
        };
        fetchWards();
    }, [formData.districtCode]);

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case 'fullName':
                if (!value.trim()) error = "Vui lòng nhập họ tên";
                else if (value.trim().length < 2) error = "Họ tên quá ngắn";
                break;
            case 'phone': {
                const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
                if (!value) error = "Vui lòng nhập số điện thoại";
                else if (!phoneRegex.test(value)) error = "Số điện thoại không đúng định dạng VN";
                break;
            }
            case 'streetAddress':
                if (!value.trim()) error = "Vui lòng nhập địa chỉ chi tiết";
                else if (value.trim().length < 5) error = "Địa chỉ chi tiết cần rõ ràng hơn";
                break;
            case 'provinceCode':
                if (!value) error = "Vui lòng chọn Tỉnh/Thành";
                break;
            case 'districtCode':
                if (!value) error = "Vui lòng chọn Quận/Huyện";
                break;
            case 'wardCode':
                if (!value) error = "Vui lòng chọn Phường/Xã";
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
        
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleLabelChange = (label) => {
        setFormData(prev => ({ ...prev, addressLabel: label }));
    };

    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        const provinceName = provinces.find(p => String(p.code) === String(provinceCode))?.name || '';
        
        setFormData(prev => ({ 
            ...prev, 
            province: provinceName, 
            provinceCode,
            district: '',
            districtCode: '',
            ward: '',
            wardCode: ''
        }));

        setErrors(prev => ({ ...prev, provinceCode: '', districtCode: '', wardCode: '' }));
    };

    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        const districtName = districts.find(d => String(d.code) === String(districtCode))?.name || '';
        
        setFormData(prev => ({ 
            ...prev, 
            district: districtName, 
            districtCode,
            ward: '',
            wardCode: ''
        }));

        setErrors(prev => ({ ...prev, districtCode: '', wardCode: '' }));
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const wardName = wards.find(w => String(w.code) === String(wardCode))?.name || '';
        setFormData(prev => ({ ...prev, ward: wardName, wardCode }));
        setErrors(prev => ({ ...prev, wardCode: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const newErrors = {};
        ['fullName', 'phone', 'provinceCode', 'districtCode', 'wardCode', 'streetAddress'].forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        onSubmit(formData);
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: { 
                    borderRadius: '1.5rem', 
                    overflow: 'hidden', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                    margin: { xs: '12px', sm: '24px' },
                    maxHeight: '90vh',
                }
            }}
        >
            <main className="relative w-full bg-white flex flex-col h-full overflow-hidden">
                <header className="px-8 pt-7 pb-4 shrink-0 bg-white border-b border-slate-50 relative z-20">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-1.5 h-8 rounded-full" style={{ background: themeGradient }}></div>
                                <h2 className="text-2xl font-black text-[#1e293b] tracking-tight">
                                    {initialData ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                                </h2>
                            </div>
                            <p className="text-[13px] text-slate-400 font-medium ml-5">
                                {initialData ? 'Chỉnh sửa thông tin nhận hàng của bạn' : 'Cung cấp thông tin để chúng tôi giao hàng tận nơi'}
                            </p>
                        </div>
                        <button 
                            onClick={handleClose}
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-90"
                        >
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-7 custom-scrollbar relative z-10">
                    <form id="address-form" onSubmit={handleSubmit} className="space-y-7">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Họ và tên</label>
                                <div className="relative group">
                                    <input 
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`w-full h-12 px-4 bg-slate-50 border-2 rounded-2xl focus:ring-4 transition-all text-sm font-medium
                                            ${errors.fullName 
                                                ? 'border-red-100 focus:border-red-500 focus:ring-red-50/50 text-red-900 bg-red-50/30' 
                                                : 'border-transparent focus:border-[#ff6b6b] focus:ring-[#ff6b6b]/10 focus:bg-white'}`} 
                                        placeholder="Nhập tên người nhận..." 
                                        type="text"
                                    />
                                    {errors.fullName && <p className="text-[10px] font-bold text-red-500 mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1">{errors.fullName}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Số điện thoại</label>
                                <div className="relative group">
                                    <input 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`w-full h-12 px-4 bg-slate-50 border-2 rounded-2xl focus:ring-4 transition-all text-sm font-medium
                                            ${errors.phone 
                                                ? 'border-red-100 focus:border-red-500 focus:ring-red-50/50 text-red-900 bg-red-50/30' 
                                                : 'border-transparent focus:border-[#ff6b6b] focus:ring-[#ff6b6b]/10 focus:bg-white'}`} 
                                        placeholder="0xxxxxxxxx" 
                                        type="tel"
                                    />
                                    {errors.phone && <p className="text-[10px] font-bold text-red-500 mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <span>Tỉnh / Thành phố</span>
                                    {addressLoading.province && <span className="w-3 h-3 border-2 border-[#ff6b6b] border-t-transparent rounded-full animate-spin"></span>}
                                </label>
                                <div className="relative group">
                                    <select 
                                        value={formData.provinceCode}
                                        onChange={handleProvinceChange}
                                        className={`appearance-none w-full h-12 pl-4 pr-10 bg-white border-2 rounded-2xl focus:ring-4 transition-all text-sm font-semibold cursor-pointer
                                            ${errors.provinceCode ? 'border-red-500 ring-red-50' : 'border-slate-100 focus:border-[#ff6b6b] focus:ring-[#ff6b6b]/10'}`}
                                    >
                                        <option value="" disabled>Chọn Tỉnh/Thành</option>
                                        {provinces.map(p => (
                                            <option key={p.code} value={p.code}>{p.name}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-900 transition-colors text-xl">unfold_more</span>
                                    {errors.provinceCode && <p className="text-[10px] font-bold text-red-500 mt-1.5 ml-1">{errors.provinceCode}</p>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        <span>Quận / Huyện</span>
                                        {addressLoading.district && <span className="w-3 h-3 border-2 border-[#ff6b6b] border-t-transparent rounded-full animate-spin"></span>}
                                    </label>
                                    <div className="relative group">
                                        <select 
                                            value={formData.districtCode}
                                            onChange={handleDistrictChange}
                                            disabled={!formData.provinceCode || addressLoading.district}
                                            className={`appearance-none w-full h-12 pl-4 pr-10 bg-white border-2 rounded-2xl focus:ring-4 transition-all text-sm font-semibold disabled:opacity-50 disabled:bg-slate-50 cursor-pointer
                                                ${errors.districtCode ? 'border-red-500 ring-red-50' : 'border-slate-100 focus:border-[#ff6b6b] focus:ring-[#ff6b6b]/10'}`}
                                        >
                                            <option value="" disabled>Quận/Huyện</option>
                                            {districts.map(d => (
                                                <option key={d.code} value={d.code}>{d.name}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-900 transition-colors text-xl">unfold_more</span>
                                        {errors.districtCode && <p className="text-[10px] font-bold text-red-500 mt-1.5 ml-1">{errors.districtCode}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        <span>Phường / Xã</span>
                                        {addressLoading.ward && <div className="w-3 h-3 border-2 border-[#ff6b6b] border-t-transparent rounded-full animate-spin"></div>}
                                    </label>
                                    <div className="relative group">
                                        <select 
                                            value={formData.wardCode}
                                            onChange={handleWardChange}
                                            disabled={!formData.districtCode || addressLoading.ward}
                                            className={`appearance-none w-full h-12 pl-4 pr-10 bg-white border-2 rounded-2xl focus:ring-4 transition-all text-sm font-semibold disabled:opacity-50 disabled:bg-slate-50 cursor-pointer
                                                ${errors.wardCode ? 'border-red-500 ring-red-50' : 'border-slate-100 focus:border-[#ff6b6b] focus:ring-[#ff6b6b]/10'}`}
                                        >
                                            <option value="" disabled>Phường/Xã</option>
                                            {wards.map(w => (
                                                <option key={w.code} value={w.code}>{w.name}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-900 transition-colors text-xl">unfold_more</span>
                                        {errors.wardCode && <p className="text-[10px] font-bold text-red-500 mt-1.5 ml-1">{errors.wardCode}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ chi tiết</label>
                            <textarea 
                                name="streetAddress"
                                value={formData.streetAddress}
                                onChange={handleChange}
                                className={`w-full p-4 bg-slate-50 border-2 rounded-2xl focus:ring-4 transition-all text-sm font-medium placeholder:text-slate-300 resize-none
                                    ${errors.streetAddress 
                                        ? 'border-red-100 focus:border-red-500 focus:ring-red-50/50 text-red-900 bg-red-50/10' 
                                        : 'border-transparent focus:border-[#ff6b6b] focus:ring-[#ff6b6b]/10 focus:bg-white'}`} 
                                placeholder="Số nhà, tên đường, tòa nhà..." 
                                rows="2"
                            ></textarea>
                            {errors.streetAddress && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.streetAddress}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Ghi chú (Tùy chọn)</label>
                            <textarea 
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#ff6b6b] focus:ring-4 focus:ring-[#ff6b6b]/10 focus:bg-white transition-all text-sm font-medium placeholder:text-slate-300 rounded-2xl resize-none" 
                                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..." 
                                rows="2"
                            ></textarea>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Loại địa chỉ</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Nhà riêng', icon: 'home' },
                                    { label: 'Văn phòng', icon: 'work' },
                                    { label: 'Khác', icon: 'location_on' }
                                ].map((item) => (
                                    <button 
                                        key={item.label}
                                        type="button"
                                        onClick={() => handleLabelChange(item.label)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 gap-2.5
                                            ${formData.addressLabel === item.label 
                                                ? 'text-white border-transparent shadow-lg scale-105' 
                                                : 'border-slate-100 text-slate-400 hover:border-[#ff6b6b]/30'}`}
                                        style={formData.addressLabel === item.label ? { background: themeGradient } : {}}
                                    >
                                        <span className={`material-symbols-outlined text-2xl transition-transform group-active:scale-90 ${formData.addressLabel === item.label ? 'fill-1' : ''}`}>
                                            {item.icon}
                                        </span>
                                        <span className="text-[12px] font-bold tracking-tight">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                            {/* Subtle Background Glow for Light Mode */}
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ff6b6b]/5 blur-3xl rounded-full"></div>
                            
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#ff6b6b]/20" style={{ background: themeGradient }}>
                                    <span className="material-symbols-outlined text-2xl fill-1">verified</span>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-black tracking-tight text-[#1e293b]">Đặt làm mặc định</p>
                                    <p className="text-[11px] text-slate-400 font-medium font-inter">Ưu tiên sử dụng khi mua hàng</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer relative z-10">
                                <input 
                                    type="checkbox" 
                                    name="isDefault"
                                    checked={formData.isDefault}
                                    onChange={handleChange}
                                    className="sr-only peer" 
                                />
                                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${formData.isDefault ? 'shadow-[0_0_15px_rgba(255,107,107,0.3)]' : ''}`}
                                    style={formData.isDefault ? { background: themeGradient } : { backgroundColor: '#e2e8f0' }}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${formData.isDefault ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                            </label>
                        </div>
                    </form>
                </div>

                <footer className="px-8 py-5 shrink-0 bg-white border-t border-slate-50 flex items-center justify-end gap-3 relative z-20">
                    <button 
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        form="address-form"
                        type="submit"
                        disabled={loading}
                        className="min-w-[140px] px-8 py-3 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-900/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none group"
                        style={{ background: themeGradient }}
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span>{initialData ? 'Cập nhật' : 'Lưu địa chỉ'}</span>
                                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </>
                        )}
                    </button>
                </footer>
            </main>
        </Dialog>
    );
}

export default AddressFormDialog;
