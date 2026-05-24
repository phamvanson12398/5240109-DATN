import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { logout } from '@/features/user/userSlice';

const navItems = [
    { name: 'Tổng quan', icon: <DashboardOutlinedIcon />, path: '/admin/dashboard' },
    { name: 'Sản phẩm', icon: <Inventory2OutlinedIcon />, path: '/admin/products' },
    { name: 'Đơn hàng', icon: <ReceiptLongOutlinedIcon />, path: '/admin/orders' },
    { name: 'Người dùng', icon: <GroupOutlinedIcon />, path: '/admin/users' },
    { name: 'Mã giảm giá', icon: <LocalOfferOutlinedIcon />, path: '/admin/vouchers' },
    { name: 'Danh mục', icon: <CategoryOutlinedIcon  />, path: '/admin/categories' },
    { name: 'Cài đặt', icon: <SettingsOutlinedIcon />, path: '/admin/settings' },
];

export default function Sidebar({ user }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const adminOnlyItems = ["Tổng quan", "Cài đặt", "Người dùng"];
    // const { isAuthenticated, user_id } = useSelector((state) => state.user_id);
    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    return (
        <aside className="admin-sidebar" aria-label="Điều hướng quản trị">
            <Link to="/admin/dashboard" className="admin-sidebar-brand">
                <span className="admin-sidebar-logo">
                    <HomeOutlinedIcon />
                </span>
                <span>
                    <strong>GÓC SÁCH</strong>
                </span>
            </Link>

            {/* <nav className="admin-sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="admin-sidebar-icon">{item.icon}</span>
                        <span className="admin-sidebar-label">{item.name}</span>
                    </NavLink>
                ))}
            </nav> */}



            <nav className="admin-sidebar-nav">
                {navItems
                    .filter((item) => {
                        // Chỉ admin mới được thấy các item này
                        if (adminOnlyItems.includes(item.name)) {
                            return user?.role === "admin";
                        }

                        return true;
                    })
                    .map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `admin-sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="admin-sidebar-icon">{item.icon}</span>
                            <span className="admin-sidebar-label">{item.name}</span>
                        </NavLink>
                    ))}
            </nav>

            <div className="admin-sidebar-footer">
                <Link to="/products" className="admin-sidebar-link secondary">
                    <span className="admin-sidebar-icon"><HomeOutlinedIcon /></span>
                    <span className="admin-sidebar-label">Về cửa hàng</span>
                </Link>

                <button type="button" className="admin-sidebar-link danger" onClick={handleLogout}>
                    <span className="admin-sidebar-icon"><LogoutOutlinedIcon /></span>
                    <span className="admin-sidebar-label">Đăng xuất</span>
                </button>

                <div className="admin-sidebar-profile">
                    <img
                        src={user?.avatar?.url || '/images/profile.png'}
                        alt={user?.name || 'Quản trị viên'}
                    />
                    <div>
                        <strong>{user?.name || 'Quản trị viên'}</strong>

                        <span>
                            {user.role === 'admin'
                                ? 'Quản trị viên'
                                : user.role === 'staff'
                                    ? 'Nhân viên'
                                    : 'Người dùng'}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
