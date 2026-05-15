import { useDispatch, useSelector } from 'react-redux';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { setGlobalSearchQuery } from '@/features/admin/state/adminSlice';
import { selectAdminGlobalSearchQuery } from '@/features/admin/state/adminSelectors';

const getRoleLabel = (role) => {
    if (role === 'admin') return 'Quản trị viên';
    if (role === 'manager') return 'Quản lý';
    if (role === 'user') return 'Người dùng';
    return role || 'Quản lý';
};

export default function Header({ user }) {
    const dispatch = useDispatch();
    const globalSearchQuery = useSelector(selectAdminGlobalSearchQuery);
    const roleLabel = getRoleLabel(user?.role_id?.name || user?.role);

    return (
        <header className="admin-topbar">
            <div className="admin-topbar-search">
                <SearchOutlinedIcon />
                <input
                    placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
                    type="text"
                    value={globalSearchQuery}
                    onChange={(e) => dispatch(setGlobalSearchQuery(e.target.value))}
                />
            </div>

            <div className="admin-topbar-actions">
                <button type="button" className="admin-topbar-icon-button" aria-label="Tin nhắn">
                    <MailOutlineOutlinedIcon />
                </button>
                <button type="button" className="admin-topbar-icon-button has-dot" aria-label="Thông báo">
                    <NotificationsNoneOutlinedIcon />
                </button>
                <div className="admin-topbar-user">
                    <img
                        src={user?.avatar?.url || '/images/profile.png'}
                        alt={user?.name || 'Quản trị viên'}
                    />
                    <div>
                        <strong>{user?.name || 'Quản trị viên'}</strong>
                        <span>{roleLabel}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
