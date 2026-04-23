import asyncErrorHandler from "../middleware/handleAsyncError.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";


export const getDashboardStats = asyncErrorHandler(async (req, res, next) => {
    // Tính toán khoảng thời gian
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

   
    const currentMonthOrders = await Order.find({
        createdAt: { $gte: lastMonth },
        orderStatus: { $ne: 'Cancelled' }
    });

    const currentMonthRevenue = currentMonthOrders.reduce((total, order) => {
        return total + order.totalPrice;
    }, 0);

    // Doanh thu tháng trước
    const previousMonthOrders = await Order.find({
        createdAt: { $gte: twoMonthsAgo, $lt: lastMonth },
        orderStatus: { $ne: 'Cancelled' }
    });

    const previousMonthRevenue = previousMonthOrders.reduce((total, order) => {
        return total + order.totalPrice;
    }, 0);

    // Tính % thay đổi doanh thu
    const revenueChange = previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
        : 0;

    // tổng đơn hàng
    const totalOrders = await Order.countDocuments();
    const ordersChange = previousMonthOrders.length > 0
        ? ((currentMonthOrders.length - previousMonthOrders.length) / previousMonthOrders.length * 100).toFixed(1)
        : 0;

    // tổng sản phẩm 
    const totalProducts = await Product.countDocuments();

    // tổng người dùng
    const totalUsers = await User.countDocuments();
    const currentMonthUsers = await User.countDocuments({ createdAt: { $gte: lastMonth } });
    const previousMonthUsers = await User.countDocuments({ createdAt: { $gte: twoMonthsAgo, $lt: lastMonth } });
    const usersChange = previousMonthUsers > 0
        ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers * 100).toFixed(1)
        : 0;

    // Trả về kết quả
    res.status(200).json({
        success: true,
        stats: {
            totalRevenue: {
                value: Math.round(currentMonthRevenue),
                change: parseFloat(revenueChange)
            },
            totalOrders: {
                value: totalOrders,
                change: parseFloat(ordersChange)
            },
            totalProducts: {
                value: totalProducts,
                change: 0
            },
            totalUsers: {
                value: totalUsers,
                change: parseFloat(usersChange)
            }
        }
    });
});


export const getRecentOrders = asyncErrorHandler(async (req, res, next) => {
    const { limit = 10 } = req.query;

    const orders = await Order.find()
        .populate('user_id', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

    const formattedOrders = orders.map(order => ({
        orderId: order._id,
        customer: order.user_id ? order.user_id.name : 'Unknown',
        email: order.user_id ? order.user_id.email : 'N/A',
        date: order.createdAt,
        total: order.totalPrice,
        status: order.orderStatus
    }));

    res.status(200).json({
        success: true,
        orders: formattedOrders
    });
});
