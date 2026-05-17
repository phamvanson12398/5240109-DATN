
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
        orderStatus: { $ne: 'Đã hủy' }
    });

    const currentMonthRevenue = currentMonthOrders.reduce((total, order) => {
        return total + order.totalPrice;
    }, 0);

    // Doanh thu tháng trước
    const previousMonthOrders = await Order.find({
        createdAt: { $gte: twoMonthsAgo, $lt: lastMonth },
        orderStatus: { $ne: 'Đã hủy' }
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

export const getRevenueAnalytics = asyncErrorHandler(async (req, res, next) => {
    const now = new Date();
    
    // 1. Helper function để lấy start date
    const getStartDate = (days) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        date.setHours(0, 0, 0, 0);
        return date;
    };

    const startOfWeek = getStartDate(6); // 7 ngày bao gồm hôm nay
    const startOfMonth = getStartDate(29); // 30 ngày
    const startOfYear = new Date(now.getFullYear(), 0, 1); // Từ đầu năm

    // 2. Aggregation Pipeline Template
    const getPipeline = (startDate, groupFormat, sortField) => [
        {
            $match: {
                orderStatus: 'Đã giao',
                deliveredAt: { $gte: startDate }
            }
        },
        {
            $project: {
                revenue: { $subtract: ["$totalPrice", { $ifNull: ["$shippingPrice", 0] }] },
                deliveredAt: 1
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: groupFormat, date: "$deliveredAt" } },
                amount: { $sum: "$revenue" }
            }
        },
        { $sort: { _id: 1 } }
    ];

    // 3. Thực hiện các truy vấn
    const [weekData, monthData, yearData] = await Promise.all([
        Order.aggregate(getPipeline(startOfWeek, "%Y-%m-%d")),
        Order.aggregate(getPipeline(startOfMonth, "%Y-%m-%d")),
        Order.aggregate(getPipeline(startOfYear, "%Y-%m"))
    ]);

    // 4. Helper to fill missing dates (để biểu đồ không bị đứt quãng)
    const formatData = (data, startDate, days, formatType) => {
        const result = [];
        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            let label, key;
            if (formatType === 'day') {
                key = date.toISOString().split('T')[0];
                const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                label = daysOfWeek[date.getDay()];
                if (days > 7) label = `${date.getDate()}/${date.getMonth() + 1}`;
            } else if (formatType === 'month') {
                date.setMonth(i);
                key = `${now.getFullYear()}-${(i + 1).toString().padStart(2, '0')}`;
                label = `Thg ${i + 1}`;
            }

            const match = data.find(d => d._id === key);
            result.push({
                label,
                amount: match ? Math.round(match.amount) : 0
            });
        }
        return result;
    };

    // Format Year data riêng vì nó theo tháng
    const formatYearData = (data) => {
        const result = [];
        for (let i = 1; i <= 12; i++) {
            const key = `${now.getFullYear()}-${i.toString().padStart(2, '0')}`;
            const match = data.find(d => d._id === key);
            result.push({
                label: `Thg ${i}`,
                amount: match ? Math.round(match.amount) : 0
            });
        }
        return result;
    };

    res.status(200).json({
        success: true,
        analytics: {
            week: formatData(weekData, startOfWeek, 6, 'day'),
            month: formatData(monthData, startOfMonth, 29, 'day'),
            year: formatYearData(yearData)
        }
    });
});
