import express from 'express';
import { getDashboardStats, getRecentOrders } from '../controllers/adminController.js';
import { isAuthenticatedAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Admin Dashboard Statistics
router.get('/dashboard', isAuthenticatedAdmin, getDashboardStats);

// Recent Orders
router.get('/orders/recent', isAuthenticatedAdmin, getRecentOrders);

export default router;
