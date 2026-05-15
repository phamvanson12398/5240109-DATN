import React, { useState, useEffect } from 'react';
import { formatVND } from '@/shared/utils/formatCurrency';

/**
 * VoucherModal Component - Shopee Style Redesign
 * @param {boolean} isOpen - Trạng thái đóng/mở modal
 * @param {function} onClose - Hàm đóng modal
 * @param {array} activeVouchers - Danh sách voucher khả dụng
 * @param {string} appliedCouponName - Tên voucher hiện đang được áp dụng
 * @param {function} onApply - Hàm xử lý áp dụng voucher
 * @param {function} onRemove - Hàm xử lý gỡ voucher
 * @param {boolean} vLoading - Trạng thái loading khi gọi API
 * @param {string} serverError - Lỗi từ phía server (nếu có)
 * @param {number} subtotal - Tổng giá trị đơn hàng hiện tại
 */
const VoucherModal = ({
  isOpen,
  onClose,
  activeVouchers,
  appliedCouponName,
  onApply,
  onRemove,
  vLoading,
  serverError,
  subtotal = 0
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [localError, setLocalError] = useState('');

  // Đồng bộ lỗi từ server hoặc reset lỗi local
  useEffect(() => {
    if (serverError) {
      setLocalError(serverError);
    } else {
      setLocalError('');
    }
  }, [serverError]);

  // Đóng modal khi nhấn Esc
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleLocalApply = (code = couponCode) => {
    const finalCode = code || couponCode;
    if (!finalCode.trim()) {
      setLocalError('Vui lòng nhập mã');
      return;
    }
    setLocalError('');
    onApply(finalCode.toUpperCase());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Custom Style for Ticket Semi-circles */}
      <style>{`
        .voucher-ticket::before,
        .voucher-ticket::after {
          content: "";
          position: absolute;
          left: 118px;
          width: 14px;
          height: 14px;
          background: #f5f5f5;
          border-radius: 9999px;
          transform: translateX(-50%);
          z-index: 2;
        }
        .voucher-ticket::before { top: -7px; }
        .voucher-ticket::after { bottom: -7px; }
      `}</style>

      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" 
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-[720px] rounded-sm shadow-[0_3px_10px_rgba(0,0,0,0.14)] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-[20px] font-medium text-[#222]">Chọn mã giảm giá Sách</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#ff5a5f] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Input Manual Section */}
        <div className="px-6 py-4 border-b border-gray-100 bg-[#fafafa]">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                if (localError) setLocalError('');
              }}
              className="flex-1 h-11 border border-gray-300 rounded-sm px-4 text-[14px] text-[#222] placeholder:text-gray-400 focus:outline-none focus:border-[#ff5a5f]"
            />
            <button
              onClick={() => handleLocalApply()}
              disabled={vLoading || !couponCode.trim()}
              className="h-11 px-6 bg-[#ff5a5f] text-white text-[14px] font-medium rounded-sm hover:brightness-95 transition disabled:bg-gray-300"
            >
              {vLoading ? 'Đang áp dụng...' : 'Áp dụng'}
            </button>
          </div>
          {localError && <p className="mt-2 text-[12px] text-red-500">{localError}</p>}
        </div>

        {/* Voucher List Section */}
        <div className="overflow-y-auto bg-[#f5f5f5] p-6 space-y-4 flex-grow scroll-smooth">
          <div className="text-[13px] font-medium text-[#222]">Mã giảm giá có thể dùng</div>
          
          {activeVouchers && activeVouchers.length > 0 ? (
            activeVouchers.map((v) => {
              const isSelected = appliedCouponName === v.code;
              const minOrderValue = Number(v.conditions?.minOrderAmount || 0);
              const isInsufficient = subtotal < minOrderValue;
              const discountValue = Number(v.discount?.value || 0);
              const isPercentage = v.discount?.type === 'percentage';

              return (
                <div 
                  key={v._id} 
                  className={`voucher-ticket relative flex bg-white border rounded-sm overflow-hidden transition-all
                    ${isSelected ? 'border-[#ff5a5f]' : isInsufficient ? 'bg-[#fafafa] border-gray-200 opacity-70' : 'border-gray-200 hover:border-[#ff5a5f]'}`}
                >
                  {/* Left part */}
                  <div className={`w-[118px] flex-shrink-0 flex flex-col items-center justify-center px-3 py-4 text-center border-r border-dashed
                    ${isSelected || !isInsufficient ? 'bg-[#fff4f1] border-[#f2c7bd]' : 'bg-gray-100 border-gray-300'}`}>
                    <div className={`text-[13px] font-semibold leading-5 ${isSelected || !isInsufficient ? 'text-[#ff5a5f]' : 'text-gray-500'}`}>
                      Mã giảm giá Sách
                    </div>
                    <div className={`mt-1 text-[12px] ${isSelected || !isInsufficient ? 'text-[#ff5a5f]' : 'text-gray-500'}`}>
                      {isPercentage ? `Giảm ${discountValue}%` : `Giảm ${formatVND(discountValue)}`}
                    </div>
                  </div>

                  {/* Right part */}
                  <div className="flex-1 px-4 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-medium text-[#222] leading-5 truncate">
                        Giảm {isPercentage ? `${discountValue}%` : formatVND(discountValue)} 
                        {minOrderValue > 0 && ` cho đơn từ ${formatVND(minOrderValue)}`}
                      </h3>
                      <p className="mt-1 text-[12px] text-gray-500">
                        HSD: {v.conditions?.endDate ? new Date(v.conditions.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                      </p>
                      
                      {isSelected ? (
                        <p className="mt-2 inline-block text-[12px] text-[#ff5a5f] bg-[#fff4f1] px-2 py-1 rounded-sm font-medium">
                          Đang được chọn
                        </p>
                      ) : isInsufficient ? (
                        <p className="mt-2 text-[12px] text-red-500 font-medium">
                          Chưa đạt điều kiện tối thiểu
                        </p>
                      ) : null}
                    </div>

                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <button
                          type="button"
                          onClick={() => onRemove()}
                          className="min-w-[88px] h-9 px-4 bg-[#ff5a5f] text-white text-[13px] font-medium rounded-sm active:scale-95 transition-all"
                        >
                          Đã chọn
                        </button>
                      ) : isInsufficient ? (
                        <button
                          type="button"
                          disabled
                          className="min-w-[120px] h-9 px-4 bg-gray-200 text-gray-500 text-[13px] font-medium rounded-sm cursor-not-allowed"
                        >
                          Không đủ điều kiện
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleLocalApply(v.code)}
                          className="min-w-[88px] h-9 px-4 border border-[#ff5a5f] text-[#ff5a5f] text-[13px] font-medium rounded-sm hover:bg-[#fff4f1] transition-colors active:scale-95"
                        >
                          Áp dụng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-sm px-6 py-10 text-center">
               <div className="text-[14px] text-gray-500">Hiện chưa có mã giảm giá khả dụng</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 text-[14px] text-[#555] border border-gray-300 rounded-sm hover:bg-gray-50 transition"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-6 bg-[#ff5a5f] text-white text-[14px] font-medium rounded-sm hover:brightness-95 transition active:scale-95"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;
