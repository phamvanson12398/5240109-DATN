import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import "@/features/user/styles/AccountShared.css";

function AccountSidebar() {
    const location = useLocation();
    const { user } = useSelector((state) => state.user);

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        {
            icon: <PersonOutlineIcon />,
            label: "Tài khoản của tôi",
            path: "/profile",
        },
        {
            icon: <Inventory2OutlinedIcon />,
            label: "Đơn mua",
            path: "/orders/user",
        },
        {
            icon: <LocationOnOutlinedIcon />,
            label: "Địa chỉ",
            path: "/profile/addresses",
        },
        {
            icon: <NotificationsNoneOutlinedIcon />,
            label: "Thông báo",
            path: "/notifications",
            subItems: [
                { label: "Cập nhật đơn hàng", path: "/notifications/order" },
                { label: "Khuyến mãi", path: "/notifications/promotion" },
            ],
        },
        {
            icon: <SellOutlinedIcon />,
            label: "Kho mã giảm giá",
            path: "/vouchers",
        },
    ];

    return (
        <aside className="account-sidebar">
            <div className="sidebar-user">
                <div className="user-avatar">
                    {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt={user.name || "Tài khoản"} />
                    ) : (
                        <div className="avatar-placeholder">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                    )}
                </div>
                <div className="user-info">
                    <div className="user-name">{user?.name || "Tài khoản"}</div>
                    <Link to="/profile/update" className="edit-profile">
                        Sửa hồ sơ
                    </Link>
                </div>
            </div>

            <nav className="sidebar-menu" aria-label="Tài khoản">
                {menuItems.map((item) => {
                    const isParentActive =
                        isActive(item.path) ||
                        item.subItems?.some((sub) => isActive(sub.path));

                    return (
                        <div key={item.path} className="menu-group">
                            <Link
                                to={item.path}
                                className={`menu-item ${isParentActive ? "active" : ""}`}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-label">{item.label}</span>
                            </Link>

                            {item.subItems && (
                                <div className={`sub-menu ${isParentActive ? "expanded" : ""}`}>
                                    {item.subItems.map((subItem) => (
                                        <Link
                                            key={subItem.path}
                                            to={subItem.path}
                                            className={`sub-menu-item ${isActive(subItem.path) ? "active" : ""}`}
                                        >
                                            {subItem.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}

export default AccountSidebar;
