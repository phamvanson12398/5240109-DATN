import express from 'express';
import passport from 'passport';
import { registerUser, loginUser, logout, requestPasswordReset, resetPassword, getUserDetails, updatePassword, updateProfile, getUsersList, getSingleUser, updateUserRole, toggleUserStatus } from '../controllers/userController.js';
import { roleBasedAccess, verifyUserAuth } from '../middleware/userAuth.js';

const router = express.Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(logout)

// Social Login Routes

// Google OAuth
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }), (req, res) => {
    const user = req.user;
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login`);

    const token = user.getJWTToken();
    const isProduction = process.env.NODE_ENV === "production";

    const options = {
        expires: new Date(Date.now() + Number(process.env.EXPIRE_COOKIE || 5) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    };
    res.status(200).cookie("token", token, options).redirect(`${process.env.FRONTEND_URL}/login/success?token=${token}`);
});

// Facebook OAuth
router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["public_profile", "email"] }));
router.get("/auth/facebook/callback", passport.authenticate("facebook", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }), (req, res) => {
    const user = req.user;
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login`);

    const token = user.getJWTToken();
    const isProduction = process.env.NODE_ENV === "production";

    const options = {
        expires: new Date(Date.now() + Number(process.env.EXPIRE_COOKIE || 5) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    };
    res.status(200).cookie("token", token, options).redirect(`${process.env.FRONTEND_URL}/login/success?token=${token}`);
});


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