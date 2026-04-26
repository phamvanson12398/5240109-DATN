import Order from '../../models/orderModel.js';

/**
 * Validator chuyên sâu cho Voucher - Đồng bộ với Schema v2
 * @param {Object} voucher - Object Voucher từ Database
 * @param {Object} user - Object User hiện tại
 * @param {Number} orderAmount - Tổng tiền đơn hàng chưa giảm
 */
const validateVoucher = async (voucher, user, orderAmount) => {
    // 1. Kiểm tra trạng thái cơ bản
    if (voucher.status !== 'active') {
        return { isValid: false, message: 'Mã giảm giá đã bị vô hiệu hóa.', discount: 0 };
    }

    const now = new Date();
    const startDate = new Date(voucher.conditions.startDate);
    const endDate = new Date(voucher.conditions.endDate);

    // 2. Kiểm tra thời gian hiệu lực
    if (now < startDate) {
        return { isValid: false, message: 'Chương trình ưu đãi chưa bắt đầu.', discount: 0 };
    }
    if (now > endDate) {
        return { isValid: false, message: 'Mã giảm giá đã hết hạn sử dụng.', discount: 0 };
    }

    // 3. Kiểm tra tổng lượt dùng toàn hệ thống
    if (voucher.conditions.usageLimit !== -1 && voucher.usedCount >= voucher.conditions.usageLimit) {
        return { isValid: false, message: 'Rất tiếc, mã giảm giá đã hết lượt sử dụng.', discount: 0 };
    }

    // 4. Kiểm tra giá trị đơn hàng tối thiểu
    if (orderAmount < voucher.conditions.minOrderAmount) {
        return { 
            isValid: false, 
            message: `Đơn hàng chưa đạt giá trị tối thiểu (Yêu cầu từ ${voucher.conditions.minOrderAmount.toLocaleString('vi-VN')}₫).`, 
            discount: 0 
        };
    }

    // 5. Kiểm tra giới hạn sử dụng của từng User (Bằng cách đếm số Đơn Hàng không bị hủy)
    const userUsageCount = await Order.countDocuments({ 
        user_id: user._id, 
        voucher_id: voucher._id,
        orderStatus: { $ne: 'Đã hủy' }
    });

    if (userUsageCount >= voucher.conditions.limitPerUser) {
        return { isValid: false, message: 'Bạn đã đạt giới hạn sử dụng mã này.', discount: 0 };
    }

    // 6. Tính toán số tiền được giảm
    let calculatedDiscount = 0;
    const { type, value, maxAmount } = voucher.discount;

    if (type === 'percentage') {
        calculatedDiscount = (orderAmount * value) / 100;
        // Áp dụng trần giảm giá nếu có
        if (maxAmount && calculatedDiscount > maxAmount) {
            calculatedDiscount = maxAmount;
        }
    } else {
        // fixed amount
        calculatedDiscount = value;
    }

    // Đảm bảo số tiền giảm không vượt quá giá trị đơn hàng
    const finalDiscount = Math.floor(Math.min(calculatedDiscount, orderAmount));

    return { 
        isValid: true, 
        message: 'Áp dụng mã giảm giá thành công!', 
        discount: finalDiscount 
    };
};

export { validateVoucher };