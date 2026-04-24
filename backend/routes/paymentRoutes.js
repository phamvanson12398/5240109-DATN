import express from "express";
import { verifyUserAuth } from "../middleware/userAuth.js";
import { createVnpayPayment, vnpayReturn, vnpayIPN } from "../controllers/paymentController.js";

/**
 * ============================================================================
 * PAYMENT ROUTES: VNPay Integration
 * ============================================================================
 * 1. POST /payment/vnpay/create: Tạo URL thanh toán và redirect (Auth required)
 * 2. GET /payment/vnpay/return: Xử lý kết quả trả về trình duyệt (Redirect)
 * 3. GET /payment/vnpay/vnpay_ipn: Xử lý thông báo từ Server VNPay (IPN)
 * ============================================================================
 */
const router = express.Router();

router.route("/payment/vnpay/create").post(verifyUserAuth, createVnpayPayment);
router.route("/payment/vnpay/return").get(vnpayReturn);
router.route("/payment/vnpay/vnpay_ipn").get(vnpayIPN);

export default router;
