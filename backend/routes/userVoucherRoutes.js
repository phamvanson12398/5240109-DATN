import express from 'express';
import { verifyUserAuth, roleBasedAccess } from '../middleware/userAuth.js';
import { 
    claimVoucher, 
    getMyVouchers, 
    distributeVoucher 
} from '../controllers/userVoucherController.js';

const router = express.Router();

// Route cho User
router.use(verifyUserAuth); // Tất cả route user-voucher đều cần login

router.route('/claim/:voucherId').post(claimVoucher);
router.route('/me').get(getMyVouchers);

// Route cho Admin
router.route('/admin/distribute').post(roleBasedAccess('admin'), distributeVoucher);

export default router;
