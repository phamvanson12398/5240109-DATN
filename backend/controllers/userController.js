import handleAsyncError from "../middleware/handleAsyncError.js"
import User from "../models/userModel.js"
import Role from "../models/roleModel.js"
import HandleError from "../utils/handleError.js"
import { sendToken } from "../utils/jwtToken.js"
import { sendEmail } from "../utils/sendEmail.js"
import { getFrontendBaseUrl } from "../config/runtimeConfig.js"
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

const getDefaultAvatar = () => {
    const frontendUrl = getFrontendBaseUrl();
    return {
        public_id: "default-avatar",
        url: `${frontendUrl}/images/profile.png`
    };
};

// Helper: Auto-find or seed the default "user" role
const getDefaultRoleId = async () => {
    let role = await Role.findOne({ name: "user" });
    if (!role) {
        // Auto-seed if not exists (first run)
        role = await Role.create({ name: "user" });
    }
    return role._id;
};

// Đăng ký 
export const registerUser = handleAsyncError(async (req, res, next) => {
    const { name, email, password, avatar } = req.body;
    let avatarData = getDefaultAvatar();

    if (avatar) {
        const myCloud = await cloudinary.uploader.upload(avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })
        avatarData = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    }

    // Auto-assign the default "user" role
    const defaultRoleId = await getDefaultRoleId();

    const user = await User.create({
        name,
        email,
        password,
        avatar: avatarData,
        role_id: defaultRoleId
    })

    sendToken(user, 200, res)
})

// Đăng Nhập 
export const loginUser = handleAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new HandleError(" Vui lòng không để email và password trống "))
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new HandleError(" Email hoặc mật khẩu không đúng", 401));
    }

    // Security Gate: Block deactivated accounts at login
    if (!user.isActive) {
        return next(new HandleError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để biết thêm chi tiết.", 403));
    }

    const isPasswordValid = await user.verifyPassword(password)
    if (!isPasswordValid) {
        return next(new HandleError("Thông tin tài khoản mật khẩu không chính xác", 401))
    }
    sendToken(user, 200, res)
})

// Đăng xuất 
export const logout = handleAsyncError(async (req, res, next) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    })
    res.status(200).json({
        success: true,
        message: "Đăng xuất thành công"
    })
})

// Quên mật khẩu 
export const requestPasswordReset = handleAsyncError(async (req, res, next) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        return next(new HandleError("Người dùng không tồn tại", 400))
    }
    let resetToken;
    try {
        resetToken = user.generatePasswordResetToken()
        await user.save({ validateBeforeSave: false })
    } catch (error) {
        return next(new HandleError("không thể lưu mã thông báo đặt lại, vui lòng thử lại sau"), 500)
    }

    const resetPasswordURL = `${getFrontendBaseUrl()}/password/reset/${resetToken}`;
    const message = `Sử dụng liên kết sau để đặt lại mật khẩu của bạn: ${resetPasswordURL}.\n\nLinên kết sẽ hết hạn sau 30 phút.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua tin nhắn này.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Yêu cầu đặt lại mật khẩu',
            message: message
        })
        res.status(200).json({
            success: true,
            message: `Email gửi tới ${user.email} thành công`
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false })
        return next(new HandleError("không thể gửi email đặt lại mật khẩu, vui lòng thử lại sau"), 500)
    }
})

// Đặt lại mật khẩu 
export const resetPassword = handleAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if (!user) {
        return next(new HandleError("Mã token không hợp lệ hoặc đã hết hạn ", 400))
    }
    const { password, confirmPassword } = req.body
    if (password != confirmPassword) {
        return next(new HandleError("Mật khẩu không khớp", 400))
    }
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()
    res.status(200).json({
        success: true,
        message: "Đặt lại mật khẩu thành công"
    })
})

// Hồ sơ người dùng (kèm thông tin Role)
export const getUserDetails = handleAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate("role_id", "name")
    res.status(200).json({
        success: true,
        user
    })
})

// Cập nhật mật khẩu 
export const updatePassword = handleAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body

    const user = await User.findById(req.user.id).select('+password')
    const checkPasswordMatch = await user.verifyPassword(oldPassword)

    if (!checkPasswordMatch) {
        return next(new HandleError("Mật khẩu cũ không chính xác", 400))
    }
    if (newPassword !== confirmPassword) {
        return next(new HandleError("Mật khẩu không khớp", 400))
    }
    user.password = newPassword
    await user.save()
    sendToken(user, 200, res)
})

// Cập nhật hồ sơ người dùng
export const updateProfile = handleAsyncError(async (req, res, next) => {
    const { name, email, avatar } = req.body
    const updateUserDetails = { name, email }

    if (avatar !== "") {
        const user = await User.findById(req.user.id);
        const imageId = user.avatar.public_id
        await cloudinary.uploader.destroy(imageId)
        const myCloud = await cloudinary.uploader.upload(avatar, {
            folder: 'avatars',
            width: 150,
            crop: 'scale'
        })
        updateUserDetails.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateUserDetails, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        message: "Cập nhật hồ sơ thành công",
        user
    })
})

// Admin - Lấy danh sách tất cả user (kèm Role)
export const getUsersList = handleAsyncError(async (req, res, next) => {
    const users = await User.find().populate("role_id", "name");
    res.status(200).json({
        success: true,
        users
    })
})

// Admin - Lấy thông tin của người dùng đơn lẻ (kèm Role)
export const getSingleUser = handleAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate("role_id", "name")
    if (!user) {
        return next(new HandleError(`Người dùng không tồn tại với id: ${req.params.id}`, 400))
    }
    res.status(200).json({
        success: true,
        user
    })
})

// Admin - Thay đổi vai trò user (nhận role_id hoặc tên role)
export const updateUserRole = handleAsyncError(async (req, res, next) => {
    const { role_id, role: roleName } = req.body

    let newRoleId = role_id;

    // Support updating by role name string for backward compatibility
    if (!newRoleId && roleName) {
        const roleDoc = await Role.findOne({ name: roleName });
        if (!roleDoc) {
            return next(new HandleError(`Không tìm thấy quyền hạn "${roleName}"`, 400));
        }
        newRoleId = roleDoc._id;
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role_id: newRoleId }, {
        new: true,
        runValidators: true
    }).populate("role_id", "name")

    if (!user) {
        return next(new HandleError("Người dùng không tồn tại", 400))
    }
    res.status(200).json({
        success: true,
        user
    })
})

// Admin - Toggle user account status (Soft Delete / Reactivate)
export const toggleUserStatus = handleAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new HandleError("Người dùng không tồn tại", 400))
    }

    // Prevent admin from deactivating themselves
    if (req.user.id === req.params.id) {
        return next(new HandleError("Bạn không thể thay đổi trạng thái tài khoản của chính mình", 400))
    }

    const { reason } = req.body;

    user.isActive = !user.isActive;
    user.blockedAt = user.isActive ? null : new Date();
    user.lockReason = user.isActive ? null : (reason || "Vi phạm chính sách hệ thống");

    await user.save({ validateBeforeSave: false });

    const statusText = user.isActive ? "MỞ KHÓA" : "KHÓA";
    const emailMessage = user.isActive
        ? `Xin chào ${user.name},\n\nTài khoản của bạn đã được MỞ KHÓA bởi Quản trị viên. Bạn có thể đăng nhập và sử dụng hệ thống bình thường.\n\nTrân trọng,\nĐội ngũ Quản trị`
        : `Xin chào ${user.name},\n\nTài khoản của bạn đã bị KHÓA bởi Quản trị viên.\nLý do: ${user.lockReason}\n\nNếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ.\n\nTrân trọng,\nĐội ngũ Quản trị`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Thông báo: Tài khoản của bạn đã bị ${statusText}`,
            message: emailMessage
        });
    } catch (emailError) {
        console.error("Gửi email thông báo thất bại:", emailError.message);
    }

    res.status(200).json({
        success: true,
        message: `Tài khoản đã được ${statusText} thành công`,
        user
    })
})
