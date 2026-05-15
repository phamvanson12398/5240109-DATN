import Address from "../models/addressModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";

/**
 * 6.1 THÊM ĐỊA CHỈ MỚI
 * Logic:
 * - Nếu là địa chỉ đầu tiên => tự động set isDefault = true
 * - Nếu gửi isDefault = true => reset toàn bộ địa chỉ cũ của user về false
 */
export const addAddress = handleAsyncError(async (req, res, next) => {
    const userId = req.user.id;
    
    // Kiểm tra số lượng địa chỉ hiện tại của user
    const addressCount = await Address.countDocuments({ user_id: userId });

    let isDefault = req.body.isDefault;

    // Quy tắc 3.3: Nếu chưa có địa chỉ nào -> Mặc định cái đầu tiên là True
    if (addressCount === 0) {
        isDefault = true;
    }

    // Quy tắc 3.4: Nếu đặt cái này là Default -> Tắt Default của tất cả cái cũ
    if (isDefault === true) {
        await Address.updateMany({ user_id: userId }, { isDefault: false });
    }

    const address = await Address.create({
        ...req.body,
        user_id: userId,
        isDefault: isDefault || false
    });

    res.status(201).json({
        success: true,
        message: "Thêm địa chỉ thành công",
        address
    });
});

/**
 * 6.2 LẤY DANH SÁCH ĐỊA CHỈ CỦA TÔI
 * Logic:
 * - Sắp xếp: Địa chỉ mặc định lên đầu, sau đó đến mới nhất
 */
export const getMyAddresses = handleAsyncError(async (req, res, next) => {
    const addresses = await Address.find({ user_id: req.user.id })
        .sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
        success: true,
        count: addresses.length,
        addresses
    });
});

/**
 * 6.3 CẬP NHẬT ĐỊA CHỈ
 * Logic:
 * - Kiểm tra quyền sở hữu (Rule 3.7)
 * - Nếu đổi từ thường sang mặc định -> Reset các cái khác (Rule 3.5)
 */
export const updateAddress = handleAsyncError(async (req, res, next) => {
    let address = await Address.findById(req.params.id);

    if (!address) {
        return next(new HandleError("Không tìm thấy địa chỉ", 404));
    }

    // Quy tắc 3.7: Không cho phép sửa địa chỉ người khác
    if (address.user_id.toString() !== req.user.id) {
        return next(new HandleError("Bạn không có quyền chỉnh sửa địa chỉ này", 403));
    }

    // Quy tắc 3.5: Nếu update thành mặc định -> Reset toàn bộ cái cũ
    if (req.body.isDefault === true) {
        await Address.updateMany(
            { user_id: req.user.id, _id: { $ne: req.params.id } }, 
            { isDefault: false }
        );
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        message: "Cập nhật địa chỉ thành công",
        address
    });
});

/**
 * 6.4 XÓA ĐỊA CHỈ
 * Logic:
 * - Kiểm tra quyền sở hữu
 * - Nếu xóa địa chỉ mặc định -> Tự động chọn địa chỉ khác làm mặc định (Rule 3.6)
 */
export const deleteAddress = handleAsyncError(async (req, res, next) => {
    const address = await Address.findById(req.params.id);

    if (!address) {
        return next(new HandleError("Không tìm thấy địa chỉ", 404));
    }

    if (address.user_id.toString() !== req.user.id) {
        return next(new HandleError("Bạn không có quyền xóa địa chỉ này", 403));
    }

    const wasDefault = address.isDefault;

    await address.deleteOne();

    // Quy tắc 3.6: Nếu xóa cái mặc định -> Tìm cái mới nhất còn lại để set làm mặc định
    if (wasDefault) {
        const nextDefault = await Address.findOne({ user_id: req.user.id }).sort({ createdAt: -1 });
        if (nextDefault) {
            nextDefault.isDefault = true;
            await nextDefault.save();
        }
    }

    res.status(200).json({
        success: true,
        message: "Xóa địa chỉ thành công"
    });
});

/**
 * 6.5 ĐẶT ĐỊA CHỈ MẶC ĐỊNH
 */
export const setDefaultAddress = handleAsyncError(async (req, res, next) => {
    const address = await Address.findById(req.params.id);

    if (!address) {
        return next(new HandleError("Không tìm thấy địa chỉ", 404));
    }

    if (address.user_id.toString() !== req.user.id) {
        return next(new HandleError("Bạn không có quyền thao tác trên địa chỉ này", 403));
    }

    // Reset toàn bộ địa chỉ của user về false
    await Address.updateMany({ user_id: req.user.id }, { isDefault: false });

    // Set địa chỉ này thành mặc định
    address.isDefault = true;
    await address.save();

    res.status(200).json({
        success: true,
        message: "Đã đặt làm địa chỉ mặc định",
        address
    });
});
