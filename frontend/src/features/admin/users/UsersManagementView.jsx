import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAllUsers, updateUserRole, toggleUserStatus } from '@/features/admin/state/adminSlice';
import { selectAdminUsers } from '@/features/admin/state/adminSelectors';
import UserDetailModal from '@/features/admin/users/components/UserDetailModal';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import './styles/UsersManagement.css';

const getUserRole = (user) => user?.role_id?.name || user?.role;

const getUserInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

function UsersManagementView() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector(selectAdminUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lockReasonInput, setLockReasonInput] = useState('');
  const [showLockModal, setShowLockModal] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRoleChange = async (id, newRole) => {
    try {
      await dispatch(updateUserRole({ id, role: newRole })).unwrap();
      toast.success('Cập nhật quyền thành công!');
    } catch (err) {
      toast.error(err || 'Cập nhật thất bại');
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.isActive) {
      setShowLockModal(user._id);
      setLockReasonInput('');
    } else {
      if (window.confirm(`Bạn có chắc muốn mở khóa tài khoản "${user.name}"?`)) {
        try {
          await dispatch(toggleUserStatus({ id: user._id })).unwrap();
          toast.success('Mở khóa tài khoản thành công!');
        } catch (err) {
          toast.error(err || 'Thao tác thất bại');
        }
      }
    }
  };

  const handleConfirmLock = async (userId) => {
    try {
      await dispatch(toggleUserStatus({
        id: userId,
        reason: lockReasonInput || 'Vi phạm chính sách hệ thống'
      })).unwrap();
      toast.success('Khóa tài khoản thành công!');
      setShowLockModal(null);
      setLockReasonInput('');
    } catch (err) {
      toast.error(err || 'Thao tác thất bại');
    }
  };

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const userRole = getUserRole(user);
    const matchesRole = roleFilter === 'all' || userRole === roleFilter;

    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'active' && user.isActive !== false)
      || (statusFilter === 'locked' && user.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((user) => user.isActive !== false).length || 0;
  const lockedUsers = users?.filter((user) => user.isActive === false).length || 0;
  const adminUsers = users?.filter((user) => getUserRole(user) === 'admin').length || 0;

  const statsCards = [
    {
      label: 'Tổng người dùng',
      value: totalUsers,
      icon: <GroupOutlinedIcon />,
      tone: 'neutral',
    },
    {
      label: 'Người dùng hoạt động',
      value: activeUsers,
      icon: <PersonAddAltOutlinedIcon />,
      tone: 'success',
    },
    {
      label: 'Người dùng bị khóa',
      value: lockedUsers,
      icon: <PersonOffOutlinedIcon />,
      tone: 'danger',
    },
    {
      label: 'Quản trị viên',
      value: adminUsers,
      icon: <AdminPanelSettingsOutlinedIcon />,
      tone: 'info',
    },
  ];

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h2 className="users-title">Quản lý người dùng</h2>
          <p className="users-subtitle">Quản lý tài khoản, quyền hạn và trạng thái người dùng</p>
        </div>
        <div className="users-header-meta">
          <GroupOutlinedIcon />
          <span>{filteredUsers?.length || 0} người dùng đang hiển thị</span>
        </div>
      </div>

      <div className="users-stats-grid">
        {statsCards.map((stat) => (
          <div key={stat.label} className={`users-stat-card ${stat.tone}`}>
            <div className="users-stat-icon">{stat.icon}</div>
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="users-table-card">
        <div className="users-toolbar">
          <div className="users-search-field">
            <SearchOutlinedIcon />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="users-clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Xóa tìm kiếm"
              >
                <ClearOutlinedIcon />
              </button>
            )}
          </div>

          <div className="users-filter-group">
            <select
              className="users-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả quyền</option>
              <option value="user">Người dùng</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <select
              className="users-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="locked">Bị khóa</option>
            </select>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tham gia</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const userRole = getUserRole(user);

                  return (
                    <tr key={user._id} className={user.isActive === false ? 'row-locked' : ''}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.avatar?.url ? (
                              <img src={user.avatar.url} alt={user.name} />
                            ) : (
                              <span className="avatar-placeholder">
                                {getUserInitials(user.name)}
                              </span>
                            )}
                          </div>
                          <div className="user-details">
                            <div className="user-name">{user.name}</div>
                            <div className="user-id">ID: {user._id?.slice(-8).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="user-contact">
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`role-select ${userRole === 'admin' ? 'role-admin' : 'role-user'}`}
                          value={userRole}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        >
                          <option value="user">Người dùng</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive === false ? 'status-locked' : 'status-active'}`}>
                          {user.isActive === false ? 'Bị vô hiệu hóa' : 'Hoạt động'}
                        </span>
                      </td>
                      <td className="user-date">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <div className="users-action-buttons">
                          <button
                            className="users-icon-button view"
                            onClick={() => handleViewDetail(user)}
                            title="Xem chi tiết"
                            type="button"
                          >
                            <VisibilityOutlinedIcon />
                          </button>
                          <button
                            className={`users-icon-button ${user.isActive === false ? 'unlock' : 'lock'}`}
                            onClick={() => handleToggleStatus(user)}
                            title={user.isActive === false ? 'Mở khóa' : 'Khóa tài khoản'}
                            type="button"
                          >
                            {user.isActive === false ? <LockOpenOutlinedIcon /> : <LockOutlinedIcon />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="no-users">
                    <div className="users-empty-state">
                      <SearchOffOutlinedIcon />
                      <strong>Không tìm thấy người dùng nào</strong>
                      <span>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="users-table-footer">
          <span>Hiển thị {filteredUsers?.length || 0} / {users?.length || 0} người dùng</span>
        </div>
      </div>

      {showLockModal && (
        <div className="lock-modal-overlay" onClick={() => setShowLockModal(null)}>
          <div className="lock-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lock-modal-header">
              <span><LockOutlinedIcon /></span>
              <div>
                <h3>Khóa tài khoản</h3>
                <p>Nhập lý do khóa tài khoản (tùy chọn):</p>
              </div>
            </div>
            <textarea
              className="lock-reason-input"
              value={lockReasonInput}
              onChange={(e) => setLockReasonInput(e.target.value)}
              placeholder="Ví dụ: Vi phạm chính sách, spam, v.v..."
              rows={3}
            />
            <div className="lock-modal-actions">
              <button
                className="btn-confirm-lock"
                onClick={() => handleConfirmLock(showLockModal)}
              >
                Xác nhận khóa
              </button>
              <button
                className="btn-cancel-lock"
                onClick={() => setShowLockModal(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default UsersManagementView;
