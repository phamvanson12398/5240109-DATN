import handleAsyncError from "./handleAsyncError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import HandleError from "../utils/handleError.js";


export const verifyUserAuth = handleAsyncError(async (req, res, next) => {
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new HandleError("Xác thực thất bại! Vui lòng đăng nhập để tiếp tục", 401));
    }

    // jwt.verify sẽ throw error nếu token sai/hết hạn
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decodedData);
    
    // Populate role_id to get the role name for authorization checks
    const user = await User.findById(decodedData.id).populate("role_id", "name");
    if (!user) {
        return next(new HandleError("Tài khoản không tồn tại hoặc đã bị xóa", 404));
    }

    // Security Gate: Block deactivated accounts even with valid token
    if (user.isActive === false) {
        return next(new HandleError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để biết thêm chi tiết.", 403));
    }

    req.user = user;
    next();
});


export const roleBasedAccess = (...roles) => {
    return (req, res, next) => {
        // Role Resolution & Normalization: Support both legacy 'role' and new 'role_id'
        const legacyRole = req.user.role ? String(req.user.role).toLowerCase() : "";
        const newRole = req.user.role_id?.name ? String(req.user.role_id.name).toLowerCase() : "";
        
        const userRoleName = newRole || legacyRole;
        
        if (!roles.includes(userRoleName)) {
            return next(new HandleError(`Bạn không có quyền thực hiện hành động này`, 403));
        }
        next();
    };
}

