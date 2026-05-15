import React, { useEffect } from 'react'
import '@/features/user/styles/AccountShared.css'
import '@/features/user/styles/Profile.css'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageTitle from '@/shared/components/PageTitle'
import Loader from '@/shared/components/Loader'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import AccountSidebar from '@/features/user/components/AccountSidebar'

function ProfileView() {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user)
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate])

  const joinedDate = user?.createdAt ? String(user.createdAt).substring(0, 10) : 'Không có dữ liệu'
  const avatarSrc = user?.avatar?.url || '/images/profile.png'

  return (
    <>
      <PageTitle title={`${user?.name || 'Người dùng'} - Hồ sơ cá nhân`} />
      <Navbar />

      {loading ? (<Loader />) : (
        <main className="account-container profile-account-page">
          <div className="account-content">
            <AccountSidebar />

            <div className="account-main profile-main">
              <div className="profile-card">
                <div className="profile-page-header">
                  <div>
                    <h1>Hồ sơ của tôi</h1>
                    <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                  </div>
                  <Link to="/profile/update" className="profile-primary-button">
                    Sửa hồ sơ
                  </Link>
                </div>

                <div className="profile-body">
                  <div className="profile-info">
                    <div className="profile-info-item">
                      <label>Họ tên</label>
                      <p>{user?.name || 'Không có dữ liệu'}</p>
                    </div>

                    <div className="profile-info-item">
                      <label>Email</label>
                      <p>{user?.email || 'Không có dữ liệu'}</p>
                    </div>

                    <div className="profile-info-item">
                      <label>Tham gia</label>
                      <p>{joinedDate}</p>
                    </div>

                    <div className="profile-info-item profile-membership-item">
                      <label>Thành viên</label>
                      <p>Khách hàng thân thiết</p>
                    </div>

                    <div className="profile-actions">
                      <Link to="/orders/user">Đơn hàng</Link>
                      <Link to="/password/update">Đổi mật khẩu</Link>
                    </div>
                  </div>

                  <div className="profile-avatar-card">
                    <img src={avatarSrc} alt={user?.name || 'Ảnh đại diện'} />
                    <p>Ảnh đại diện</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      <Footer />
    </>
  )
}

export default ProfileView
