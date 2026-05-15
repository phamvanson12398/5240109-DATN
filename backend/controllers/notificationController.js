import Notification from '../models/notificationModel.js';
import asyncErrorHandler from "../middleware/handleAsyncError.js";

// 1. Lấy tất cả thông báo của User (Bao gồm thông báo cá nhân và thông báo chung)
export const getMyNotifications = asyncErrorHandler(async (req, res, next) => {
    const notifications = await Notification.find({
        $or: [
            { userId: req.user._id },
            { userId: null }
        ]
    }).sort({ createdAt: -1 }).limit(20);

    const unreadCount = await Notification.countDocuments({
        $or: [
            { userId: req.user._id },
            { userId: null }
        ],
        isRead: false
    });

    res.status(200).json({
        success: true,
        notifications,
        unreadCount
    });
});

// 2. Đánh dấu thông báo đã đọc
export const markNotificationAsRead = asyncErrorHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: 'Không tìm thấy thông báo'
        });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
        success: true
    });
});

// 3. Đánh dấu tất cả đã đọc
export const markAllNotificationsAsRead = asyncErrorHandler(async (req, res, next) => {
    await Notification.updateMany(
        {
            $or: [
                { userId: req.user._id },
                { userId: null }
            ],
            isRead: false
        },
        { isRead: true }
    );

    res.status(200).json({
        success: true
    });
});
