import express from 'express';
import { getDashboardStats, getRecentOrders ,getRevenueAnalytics} from '../controllers/adminController.js';
import { isAuthenticatedAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Admin Dashboard Statistics
router.get('/dashboard', isAuthenticatedAdmin, getDashboardStats);

router.get('/analytics/revenue', isAuthenticatedAdmin, getRevenueAnalytics);

// Recent Orders
router.get('/orders/recent', isAuthenticatedAdmin, getRecentOrders);

export default router;
