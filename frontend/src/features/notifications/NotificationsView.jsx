/**
 * Trang thông báo tài khoản.
 * Business logic nằm trong notificationSlice; file này chỉ điều phối layout và hiển thị.
 */
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchNotifications,
    markAsRead,
    markAllRead,
    readLocal,
    readAllLocal
} from "@/features/notifications/notificationSlice";
import AccountSidebar from "@/features/user/components/AccountSidebar";
import "@/features/notifications/styles/Notifications.css";
import "@/features/user/styles/AccountShared.css";
import PageTitle from "@/shared/components/PageTitle";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const NOTIFICATION_TABS = [
    {
        type: "all",
        label: "Tất cả",
        path: "/notifications",
        icon: <NotificationsNoneOutlinedIcon />,
    },
    {
        type: "order",
        label: "Đơn hàng",
        path: "/notifications/order",
        icon: <Inventory2OutlinedIcon />,
    },
    {
        type: "promotion",
        label: "Khuyến mãi",
        path: "/notifications/promotion",
        icon: <LocalOfferOutlinedIcon />,
    },
    {
        type: "wallet",
        label: "Ví & Thanh toán",
        path: "/notifications/wallet",
        icon: <AccountBalanceWalletOutlinedIcon />,
    },
    {
        type: "shopee",
        label: "Hệ thống",
        path: "/notifications/shopee",
        icon: <SettingsOutlinedIcon />,
    },
];

const getNotificationIcon = (type) => {
    switch (type) {
        case "promotion":
            return <LocalOfferOutlinedIcon />;
        case "order":
            return <LocalShippingOutlinedIcon />;
        case "wallet":
            return <AccountBalanceWalletOutlinedIcon />;
        case "shopee":
            return <SettingsOutlinedIcon />;
        default:
            return <InfoOutlinedIcon />;
    }
};

const getNotificationTone = (type) => {
    switch (type) {
        case "promotion":
            return "promotion";
        case "order":
            return "order";
        case "wallet":
            return "wallet";
        case "shopee":
            return "system";
        default:
            return "info";
    }
};

const formatTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const NotificationsView = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const [filter, setFilter] = useState("all");

    const { notifications, unreadCount, loading } = useSelector((state) => state.notification);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    // Map path to filter type
    useEffect(() => {
        const path = location.pathname;
        if (path.includes("/notifications/order")) setFilter("order");
        else if (path.includes("/notifications/promotion")) setFilter("promotion");
        else if (path.includes("/notifications/wallet")) setFilter("wallet");
        else if (path.includes("/notifications/shopee")) setFilter("shopee");
        else setFilter("all");
    }, [location]);

    // Filter Logic
    const filteredNotifications = filter === "all"
        ? notifications
        : notifications.filter(item => item.type === filter);

    const handleMarkRead = (id) => {
        dispatch(readLocal(id));
        dispatch(markAsRead(id));
    };

    const handleMarkAllRead = () => {
        dispatch(readAllLocal());
        dispatch(markAllRead());
    };

    const activeTabLabel = NOTIFICATION_TABS.find((tab) => tab.type === filter)?.label || "Tất cả";

    return (
        <>
            <PageTitle title="Thông báo của tôi" />
            <Navbar />

            <main className="notifications-page">
                <div className="notifications-shell">
                    <AccountSidebar />

                    <section className="notifications-main-panel">
                        <div className="notifications-page-header">
                            <div>
                                <span className="notifications-eyebrow">Trung tâm thông báo</span>
                                <h1>Thông báo của tôi</h1>
                                <p>Các cập nhật về đơn hàng, khuyến mãi và tài khoản sẽ hiển thị tại đây.</p>
                            </div>
                            <div className="notifications-header-actions">
                                <div className="notifications-unread-summary">
                                    <span>{unreadCount || 0}</span>
                                    <strong>chưa đọc</strong>
                                </div>
                                <button
                                    type="button"
                                    className="mark-read-btn"
                                    onClick={handleMarkAllRead}
                                    disabled={!unreadCount}
                                >
                                    <CheckCircleOutlineOutlinedIcon />
                                    Đánh dấu đã đọc tất cả
                                </button>
                            </div>
                        </div>

                        <div className="notifications-card">
                            <div className="notifications-card-header">
                                <div>
                                    <h2>{activeTabLabel}</h2>
                                    <p>{filteredNotifications.length} thông báo</p>
                                </div>
                            </div>

                            <nav className="notification-tabs" aria-label="Bộ lọc thông báo">
                                {NOTIFICATION_TABS.map((tab) => (
                                    <Link
                                        key={tab.type}
                                        to={tab.path}
                                        className={`notification-tab ${filter === tab.type ? "active" : ""}`}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </Link>
                                ))}
                            </nav>

                            <div className="notifications-list">
                                {loading ? (
                                    <div className="loading-notifications">
                                        <NotificationsNoneOutlinedIcon />
                                        <span>Đang tải thông báo...</span>
                                    </div>
                                ) : filteredNotifications.length > 0 ? (
                                    filteredNotifications.map((item) => {
                                        const imageSrc = item.image || item.thumbnail || item.imageUrl;

                                        return (
                                            <Link
                                                to={item.link || "#"}
                                                key={item._id}
                                                className={`notification-item ${!item.isRead ? "unread" : "read"}`}
                                                onClick={() => handleMarkRead(item._id)}
                                            >
                                                <div className={`notification-icon-block ${getNotificationTone(item.type)}`}>
                                                    {getNotificationIcon(item.type)}
                                                </div>

                                                <div className="notification-body">
                                                    <div className="notification-title-row">
                                                        <h3>{item.title}</h3>
                                                        {!item.isRead && <span className="notification-unread-dot" />}
                                                    </div>
                                                    <p>{item.message}</p>
                                                    <time>{formatTime(item.createdAt)}</time>
                                                </div>

                                                {imageSrc && (
                                                    <div className="notification-thumb">
                                                        <img src={imageSrc} alt="" />
                                                    </div>
                                                )}
                                            </Link>
                                        );
                                    })
                                ) : (
                                    <div className="no-notifications">
                                        <NotificationsOffOutlinedIcon />
                                        <h3>Bạn chưa có thông báo nào</h3>
                                        <p>Các cập nhật về đơn hàng, khuyến mãi và tài khoản sẽ hiển thị tại đây.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default NotificationsView;
