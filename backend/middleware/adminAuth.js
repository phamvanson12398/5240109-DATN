import HandleError from "../utils/handleError.js";
import asyncErrorHandler from "./handleAsyncError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * isAuthenticatedAdmin - Middleware bảo vệ routes admin
 * - Kiểm tra user đã đăng nhập chưa
 * - Kiểm tra user có role admin không
 */
export const isAuthenticatedAdmin = asyncErrorHandler(async (req, res, next) => {
    const { token } = req.cookies;

    // Support both Cookie and Bearer token
    let authToken = token;
    if (!authToken && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        authToken = req.headers.authorization.split(" ")[1];
    }

    if (!authToken) {
        return next(new HandleError("Vui lòng đăng nhập để truy cập", 401));
    }

    // Verify token and populate role_id to get role name
    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decodedData.id).populate("role_id", "name");

    if (!req.user) {
        return next(new HandleError("Người dùng không tồn tại", 404));
    }

    // Security Gate: Block deactivated accounts
    if (req.user.isActive === false) {
        return next(new HandleError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để biết thêm chi tiết.", 403));
    }

    // Role Resolution & Normalization: Support both legacy 'role' and new 'role_id'
    const legacyRole = req.user.role ? String(req.user.role).toLowerCase() : "";
    const newRole = req.user.role_id?.name ? String(req.user.role_id.name).toLowerCase() : "";
    
    const roleName = newRole || legacyRole;
    
    // Strict Admin Check
    if (roleName !== "admin" && roleName !== "staff" ) {
        return next(new HandleError("Bạn không có quyền truy cập trang này", 403));
    }

    next();
});
