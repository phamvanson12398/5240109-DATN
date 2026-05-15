import UserVoucher from "../models/userVoucherModel.js";
import Voucher from "../models/voucherModel.js";
import User from "../models/userModel.js";
import asyncErrorHandler from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import { validateVoucherClaim } from "../utils/voucherValidator.js";

// 1. [USER] Bấm "Lấy mã" - Claim Voucher
export const claimVoucher = asyncErrorHandler(async (req, res, next) => {
    const { voucherId } = req.params;
    const userId = req.user._id;

    // Tìm voucher hệ thống
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
        return next(new HandleError("Mã giảm giá không tồn tại.", 404));
    }

    // Kiểm tra tính hiệu lực cơ bản (KHÔNG check minOrderAmount ở bước claim)
    const validation = validateVoucherClaim(voucher);
    if (!validation.isValid) {
        return next(new HandleError(validation.message, 400));
    }
    
    // Kiểm tra user đã sở hữu trong ví chưa
    const existingWalletVoucher = await UserVoucher.findOne({ user: userId, voucher: voucherId });
    if (existingWalletVoucher) {
        return next(new HandleError("Bạn đã sở hữu mã giảm giá này trong kho rồi.", 400));
    }

    // Tạo bản ghi UserVoucher
    const newUserVoucher = await UserVoucher.create({
        user: userId,
        voucher: voucherId,
        status: 'available',
        claimedAt: new Date()
    });

    // Tăng claimedCount (lượt phát hành), KHÔNG tăng usedCount (lượt dùng thật trong đơn hàng)
    voucher.claimedCount = (voucher.claimedCount || 0) + 1;
    await voucher.save();

    res.status(201).json({
        success: true,
        message: "Đã lưu mã giảm giá vào kho của bạn!",
        data: newUserVoucher
    });
});

// 2. [USER] Lấy danh sách Voucher đang sở hữu (Kho Voucher)
export const getMyVouchers = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user._id;

    const userVouchers = await UserVoucher.find({ user: userId })
        .populate({
            path: 'voucher',
            select: 'code title discount conditions targeting type usedCount'
        })
        .sort({ claimedAt: -1 });

    // Filter bỏ những voucher đã bị xóa hoặc không hợp lệ (nếu có)
    const validVouchers = userVouchers.filter(uv => uv.voucher);

    res.status(200).json({
        success: true,
        vouchers: validVouchers
    });
});

// 3. [ADMIN] Phát voucher trực tiếp cho User
export const distributeVoucher = asyncErrorHandler(async (req, res, next) => {
    const { voucherId, targetType, userIds } = req.body; // targetType: 'all', 'specific'

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
        return next(new HandleError("Mã giảm giá không tồn tại.", 404));
    }

    let targetUserIds = [];

    if (targetType === 'all') {
        const users = await User.find({ isActive: true }).select('_id');
        targetUserIds = users.map(u => u._id);
    } else if (targetType === 'specific' && Array.isArray(userIds)) {
        targetUserIds = userIds;
    }

    if (targetUserIds.length === 0) {
        return next(new HandleError("Không tìm thấy người dùng phù hợp để phát voucher.", 400));
    }

    // Batch insert: Tránh trùng lặp (trùng cặp user-voucher sẽ bị MongoDB error do Unique Index)
    // Ta lọc qua những user chưa có voucher này trước để tránh lỗi 11000 hàng loạt
    const existingClaims = await UserVoucher.find({
        voucher: voucherId,
        user: { $in: targetUserIds }
    }).select('user');

    const existingUserIdsSet = new Set(existingClaims.map(c => c.user.toString()));
    const newUserIds = targetUserIds.filter(id => !existingUserIdsSet.has(id.toString()));

    if (newUserIds.length === 0) {
         return res.status(200).json({
            success: true,
            message: "Tất cả người dùng được chọn đều đã sở hữu voucher này."
        });
    }

    const records = newUserIds.map(uid => ({
        user: uid,
        voucher: voucherId,
        status: 'available',
        assignedBySystem: true
    }));

    await UserVoucher.insertMany(records, { ordered: false });

    // Tăng claimedCount (lượt phát hành), KHÔNG tăng usedCount (lượt dùng thật)
    voucher.claimedCount = (voucher.claimedCount || 0) + records.length;
    await voucher.save();

    res.status(200).json({
        success: true,
        message: `Đã phát voucher thành công cho ${records.length} người dùng.`
    });
});
