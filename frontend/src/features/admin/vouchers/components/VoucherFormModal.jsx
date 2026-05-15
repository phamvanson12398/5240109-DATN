import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Switch from '@mui/material/Switch';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { createVoucher, updateVoucher } from '@/features/admin/state/adminSlice';
import { toast } from 'react-toastify';

const VoucherFormModal = ({ voucher, onClose }) => {
    const dispatch = useDispatch();
    const isEditMode = !!voucher;

    const [formData, setFormData] = useState({
        code: '',
        type: 'general',
        discountType: 'fixed',
        discountValue: 0,
        maxAmount: 0,
        minOrderAmount: 0,
        usageLimit: 0,
        limitPerUser: 1,
        startDate: '',
        endDate: '',
        isPublic: true,
        description: ''
    });

    useEffect(() => {
        if (voucher) {
            setFormData({
                code: voucher.code || '',
                type: voucher.type || 'general',
                discountType: voucher.discount?.type || 'fixed',
                discountValue: voucher.discount?.value || 0,
                maxAmount: voucher.discount?.maxAmount || 0,
                minOrderAmount: voucher.conditions?.minOrderAmount || 0,
                usageLimit: voucher.conditions?.usageLimit || 0,
                limitPerUser: voucher.conditions?.limitPerUser || 1,
                startDate: voucher.conditions?.startDate ? new Date(voucher.conditions.startDate).toISOString().split('T')[0] : '',
                endDate: voucher.conditions?.endDate ? new Date(voucher.conditions.endDate).toISOString().split('T')[0] : '',
                isPublic: voucher.targeting?.isPublic ?? true,
                description: voucher.description || ''
            });
        }
    }, [voucher]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            code: formData.code.toUpperCase(),
            type: formData.type,
            discount: {
                type: formData.discountType,
                value: Number(formData.discountValue),
                maxAmount: formData.discountType === 'percentage' ? Number(formData.maxAmount) : undefined
            },
            conditions: {
                minOrderAmount: Number(formData.minOrderAmount),
                usageLimit: Number(formData.usageLimit) === 0 ? -1 : Number(formData.usageLimit),
                limitPerUser: Number(formData.limitPerUser),
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined
            },
            targeting: {
                isPublic: formData.isPublic
            },
            description: formData.description
        };

        try {
            if (isEditMode) {
                await dispatch(updateVoucher({ id: voucher._id, voucherData: payload })).unwrap();
                toast.success('Cập nhật mã giảm giá thành công!');
            } else {
                await dispatch(createVoucher(payload)).unwrap();
                toast.success('Tạo mã giảm giá thành công!');
            }
            onClose();
        } catch (error) {
            toast.error(error || 'Có lỗi xảy ra!');
        }
    };

    const fieldClass = 'h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#004ac6] focus:ring-4 focus:ring-[#004ac6]/10 disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]';
    const labelClass = 'text-sm font-semibold text-[#111827]';
    const helperClass = 'mt-1 text-xs leading-5 text-[#6B7280]';
    const sectionClass = 'rounded-2xl border border-[#E5E7EB] bg-white p-5';
    const sectionTitleClass = 'mb-5 flex items-center gap-2 text-xs font-bold uppercase text-[#004ac6]';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Inter']">
            <div
                className="absolute inset-0 bg-[#111827]/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(17,24,39,0.18)]">
                <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-5 md:px-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[#111827]">
                            {isEditMode ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá'}
                        </h2>
                        <p className="mt-1 text-sm text-[#6B7280]">
                            Thiết lập điều kiện, mức giảm và thời gian áp dụng cho mã khuyến mãi.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#6B7280] transition hover:border-[#FCA5A5] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                        aria-label="Đóng modal"
                    >
                        <CloseOutlinedIcon fontSize="small" />
                    </button>
                </div>

                <form
                    id="voucher-form"
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto bg-[#F9FAFB] px-6 py-6 md:px-8"
                >
                    <div className="space-y-5">
                        <section className={sectionClass}>
                            <h3 className={sectionTitleClass}>
                                <span className="h-1.5 w-1.5 rounded-full bg-[#004ac6]" />
                                Thông tin cơ bản
                            </h3>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass} htmlFor="voucher-code">Mã giảm giá *</label>
                                    <div className="relative mt-2">
                                        <input
                                            id="voucher-code"
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            disabled={isEditMode}
                                            required
                                            className={`${fieldClass} pr-11 font-mono uppercase tracking-wider`}
                                            placeholder="GIAMGIA2026"
                                        />
                                        <ConfirmationNumberOutlinedIcon className="pointer-events-none absolute right-3 top-1/2 !h-5 !w-5 -translate-y-1/2 text-[#9CA3AF]" />
                                    </div>
                                    <p className={helperClass}>Mã sẽ được tự động chuyển thành chữ in hoa khi lưu.</p>
                                </div>

                                <div>
                                    <label className={labelClass} htmlFor="voucher-type">Phân nhóm mã giảm giá</label>
                                    <select
                                        id="voucher-type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className={`${fieldClass} mt-2 appearance-none`}
                                    >
                                        <option value="general">Khách hàng phổ thông</option>
                                        <option value="limited">Tài khoản giới hạn</option>
                                        <option value="exclusive">Độc quyền (VIP/Đối tác)</option>
                                    </select>
                                    <p className={helperClass}>Chọn nhóm khách hàng được phép sử dụng mã giảm giá.</p>
                                </div>
                            </div>
                        </section>

                        <section className={sectionClass}>
                            <h3 className={sectionTitleClass}>
                                <span className="h-1.5 w-1.5 rounded-full bg-[#004ac6]" />
                                Cấu hình giảm giá
                            </h3>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Kiểu ưu đãi</label>
                                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, discountType: 'fixed' }))}
                                            className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ${formData.discountType === 'fixed' ? 'bg-[#004ac6] text-white shadow-sm' : 'text-[#6B7280] hover:bg-white hover:text-[#111827]'}`}
                                        >
                                            <PaidOutlinedIcon fontSize="small" />
                                            VND
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, discountType: 'percentage' }))}
                                            className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ${formData.discountType === 'percentage' ? 'bg-[#004ac6] text-white shadow-sm' : 'text-[#6B7280] hover:bg-white hover:text-[#111827]'}`}
                                        >
                                            <PercentOutlinedIcon fontSize="small" />
                                            %
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass} htmlFor="voucher-discount-value">Giá trị giảm giá *</label>
                                    <div className="relative mt-2">
                                        <input
                                            id="voucher-discount-value"
                                            type="number"
                                            name="discountValue"
                                            value={formData.discountValue}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                            className={`${fieldClass} pr-12 text-right text-lg font-bold`}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6B7280]">
                                            {formData.discountType === 'fixed' ? 'đ' : '%'}
                                        </span>
                                    </div>
                                </div>

                                {formData.discountType === 'percentage' && (
                                    <div className="md:col-span-2">
                                        <label className={labelClass} htmlFor="voucher-max-amount">Giảm tối đa</label>
                                        <input
                                            id="voucher-max-amount"
                                            type="number"
                                            name="maxAmount"
                                            value={formData.maxAmount}
                                            onChange={handleChange}
                                            className={`${fieldClass} mt-2`}
                                            placeholder="VD: 50000"
                                        />
                                        <p className={helperClass}>Để 0 nếu không muốn giới hạn số tiền giảm tối đa.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className={sectionClass}>
                            <h3 className={sectionTitleClass}>
                                <span className="h-1.5 w-1.5 rounded-full bg-[#004ac6]" />
                                Điều kiện áp dụng
                            </h3>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                <div>
                                    <label className={labelClass} htmlFor="voucher-min-order">Đơn tối thiểu</label>
                                    <input
                                        id="voucher-min-order"
                                        type="number"
                                        name="minOrderAmount"
                                        value={formData.minOrderAmount}
                                        onChange={handleChange}
                                        className={`${fieldClass} mt-2`}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass} htmlFor="voucher-usage-limit">Tổng lượt phát hành</label>
                                    <input
                                        id="voucher-usage-limit"
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleChange}
                                        className={`${fieldClass} mt-2`}
                                        placeholder="Để 0 nếu vô hạn"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass} htmlFor="voucher-limit-per-user">Lượt mỗi người</label>
                                    <input
                                        id="voucher-limit-per-user"
                                        type="number"
                                        name="limitPerUser"
                                        value={formData.limitPerUser}
                                        onChange={handleChange}
                                        className={`${fieldClass} mt-2`}
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className={sectionClass}>
                            <h3 className={sectionTitleClass}>
                                <CalendarTodayOutlinedIcon className="!h-4 !w-4" />
                                Thời gian
                            </h3>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass} htmlFor="voucher-start-date">Ngày có hiệu lực</label>
                                    <input
                                        id="voucher-start-date"
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className={`${fieldClass} mt-2`}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass} htmlFor="voucher-end-date">Ngày kết thúc</label>
                                    <input
                                        id="voucher-end-date"
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className={`${fieldClass} mt-2`}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className={sectionClass}>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004ac6]/10 text-[#004ac6]">
                                        <VisibilityOutlinedIcon fontSize="small" />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#111827]">Hiển thị công khai</h3>
                                        <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                                            Cho phép khách hàng thấy mã này tại trang thanh toán hoặc khu khuyến mãi.
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    name="isPublic"
                                    checked={formData.isPublic}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#004ac6',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#004ac6',
                                        },
                                    }}
                                />
                            </div>
                        </section>
                    </div>
                </form>

                <div className="flex items-center justify-between gap-3 border-t border-[#E5E7EB] bg-white px-6 py-5 md:px-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-11 rounded-xl border border-[#E5E7EB] bg-white px-5 text-sm font-bold text-[#374151] transition hover:bg-[#F9FAFB]"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        form="voucher-form"
                        className="min-h-11 rounded-xl bg-[#004ac6] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#003ea8]"
                    >
                        {isEditMode ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoucherFormModal;
