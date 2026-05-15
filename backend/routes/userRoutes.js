/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Định tuyến cho Người dùng (Express Router for Users).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý toàn bộ các luồng liên quan đến tài khoản người dùng: Đăng ký, Đăng nhập, Đăng xuất.
 *    - Xử lý đăng nhập bằng mạng xã hội (Google, Facebook) thông qua Passport.js.
 *    - Cung cấp các đường dẫn để người dùng cập nhật hồ sơ, đổi mật khẩu và khôi phục mật khẩu khi quên.
 *    - Cung cấp các công cụ cho Admin để quản lý danh sách và quyền hạn của người dùng.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Xác thực (Authentication), Luồng Hồ sơ cá nhân (User Profile) & Luồng Quản trị (Admin).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Passport.js: Thư viện xác thực mạnh mẽ hỗ trợ OAuth 2.0 (Google/Facebook).
 *    - JWT (JSON Web Token): Tạo mã định danh sau khi đăng nhập thành công.
 *    - Cookie Management: Lưu trữ Token an toàn trong trình duyệt với các cờ `httpOnly`, `secure`.
 *    - Express Router: Tổ chức các route theo nhóm (Public, Private, Admin).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin đăng nhập, Email khôi phục, hoặc yêu cầu từ các mạng xã hội.
 *    - Output: Điều hướng Request đến Controller hoặc thực hiện chuyển hướng (Redirect) về Frontend sau khi xác thực.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `:token`: Dùng trong URL khôi phục mật khẩu.
 *    - `:id`: ID của người dùng mà Admin muốn quản lý.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Đăng nhập/Đăng ký truyền thống.
 *    - Đăng nhập Google/Facebook: `/auth/google`, `/auth/facebook`.
 *    - Quản lý Profile: `/profile`, `/profile/update`.
 *    - Quản lý Admin: Xem danh sách, sửa quyền, xóa người dùng.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: User gửi yêu cầu đăng nhập.
 *    - Bước 2: Router chuyển đến Controller để kiểm tra thông tin.
 *    - Bước 3: Nếu đúng, Controller trả về Token. Router này cũng chứa logic Callback để nhận dữ liệu từ Google/Facebook rồi cấp Token.
 *    - Bước 4: Token được gắn vào Cookie và Frontend nhận thông báo thành công.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - User -> API -> Controller/Passport -> MongoDB -> Cookie/Token -> Client.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Phân quyền theo nhiều cấp độ: Route công khai, Route cần đăng nhập (`verifyUserAuth`), và Route chỉ dành cho Admin (`roleBasedAccess('admin')`).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Logic callback của mạng xã hội xử lý các thao tác bất đồng bộ như lấy thông tin từ Google API và tạo Token.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Social Login Callback: Lưu ý phần `redirect`. Sau khi đăng nhập thành công qua mạng xã hội, backend sẽ điều hướng về trang `/login/success` của Frontend kèm theo token.
 *    - Bảo mật Cookie: Cờ `secure: true` chỉ hoạt động trên HTTPS (Production). Trong môi trường phát triển (Local), nó được đặt là `false` để có thể nhận cookie.
 */
import express from 'express';
import passport from 'passport';
import { registerUser, loginUser, logout, requestPasswordReset, resetPassword, getUserDetails, updatePassword, updateProfile, getUsersList, getSingleUser, updateUserRole, toggleUserStatus } from '../controllers/userController.js';
import { roleBasedAccess, verifyUserAuth } from '../middleware/userAuth.js';
import { getFrontendBaseUrl } from '../config/runtimeConfig.js';

const router = express.Router();

const authenticateOAuthCallback = (strategy) => (req, res, next) => {
    passport.authenticate(strategy, {
        session: false,
        failureRedirect: `${getFrontendBaseUrl()}/login`
    })(req, res, next);
};

const handleOAuthSuccess = (req, res) => {
    const user = req.user;
    const frontendUrl = getFrontendBaseUrl();

    if (!user) return res.redirect(`${frontendUrl}/login`);

    const token = user.getJWTToken();
    const isProduction = process.env.NODE_ENV === "production";

    const options = {
        expires: new Date(Date.now() + Number(process.env.EXPIRE_COOKIE || 5) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    };

    res.status(200).cookie("token", token, options).redirect(`${frontendUrl}/login/success?token=${encodeURIComponent(token)}`);
};

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(logout)

// Social Login Routes

// Google OAuth
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback/", authenticateOAuthCallback("google"), handleOAuthSuccess);

// Facebook OAuth
// router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["public_profile", "email"] }));
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);
router.get("/auth/facebook/callback", authenticateOAuthCallback("facebook"), handleOAuthSuccess);


router.route("/password/forgot").post(requestPasswordReset)
router.route("/reset/:token").post(resetPassword)
router.route("/profile").get(verifyUserAuth, getUserDetails)
router.route("/password/update").put(verifyUserAuth, updatePassword)
router.route("/profile/update").put(verifyUserAuth, updateProfile)
router.route("/admin/users").get(verifyUserAuth, roleBasedAccess('admin'), getUsersList)
router.route("/admin/users/:id")
    .get(verifyUserAuth, roleBasedAccess('admin'), getSingleUser)
    .put(verifyUserAuth, roleBasedAccess('admin'), updateUserRole)
router.route("/admin/users/:id/toggle-status")
    .put(verifyUserAuth, roleBasedAccess('admin'), toggleUserStatus)







export default router;
