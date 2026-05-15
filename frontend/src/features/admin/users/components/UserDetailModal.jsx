import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const UserDetailModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const downloadUserInfo = () => {
    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user?.role_id?.name || user?.role,
      createdAt: user.createdAt,
      avatar: user.avatar?.url || 'Không có ảnh đại diện'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userInfo, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `user_${user.name.replace(/\s+/g, '_')}_info.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="user-detail-overlay" onClick={onClose}>
      <div className="user-detail-modal" onClick={handleModalContentClick}>
        <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Đóng">
          <CloseOutlinedIcon />
        </button>

        <div className="modal-header">
          <div className="user-avatar-large">
            {user.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name} />
            ) : (
              <span className="avatar-placeholder-large">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="header-info">
            <h2 className="user-full-name">{user.name}</h2>
            <span className={`role-badge ${(user?.role_id?.name || user?.role) === 'admin' ? 'role-admin' : 'role-user'}`}>
              {(user?.role_id?.name || user?.role) === 'admin' ? 'QUẢN TRỊ VIÊN' : 'NGƯỜI DÙNG'}
            </span>
          </div>
        </div>

        <div className="modal-body">
          <div className="info-section">
            <h3><InfoOutlinedIcon /> Thông tin tài khoản</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Mã người dùng</label>
                <span>{user._id}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Ngày tham gia</label>
                <span>{new Date(user.createdAt).toLocaleString('vi-VN')}</span>
              </div>
              <div className="info-item">
                <label>Trạng thái</label>
                <span className={user.isActive === false ? 'status-locked' : 'status-active'}>
                  {user.isActive === false ? 'Bị vô hiệu hóa' : 'Hoạt động'}
                </span>
              </div>
              {user.isActive === false && user.lockReason && (
                <div className="info-item">
                  <label>Lý do khóa</label>
                  <span className="lock-reason-text">{user.lockReason}</span>
                </div>
              )}
              {user.isActive === false && user.blockedAt && (
                <div className="info-item">
                  <label>Ngày khóa</label>
                  <span>{new Date(user.blockedAt).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-download" onClick={downloadUserInfo}>
            <FileDownloadOutlinedIcon />
            Tải thông tin
          </button>
          <button className="btn-close-modal" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
