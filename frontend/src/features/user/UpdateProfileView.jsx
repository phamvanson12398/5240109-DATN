import React, { useEffect, useState } from 'react'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import '@/features/user/styles/AccountShared.css'
import '@/features/user/styles/UpdateProfile.css'
import AccountSidebar from '@/features/user/components/AccountSidebar'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeSuccess, updateProfile } from '@/features/user/userSlice';
import { removeErrors } from '@/features/user/userSlice';
import Loader from '@/shared/components/Loader'

function UpdateProfileView() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [avatarPreview, setAvatarPreview] = useState("./images/profile.png");

    const { user, error, success, message, loading } = useSelector(state => state.user)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const profileImageUpdate = (e) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatarPreview(reader.result)
                setAvatar(reader.result)
            }
        }
        reader.onerror = (error) => {
            toast.error('Lỗi tải file', error);
        }
        reader.readAsDataURL(e.target.files[0])
    }

    const updateSubmit = (e) => {
        e.preventDefault();
        const myForm = new FormData()
        myForm.set("name", name)
        myForm.set("email", email)
        myForm.set("avatar", avatar)
        dispatch(updateProfile(myForm))
    }

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'top-center', autoClose: 3000 })
            dispatch(removeErrors())
        }
    }, [dispatch, error])

    useEffect(() => {
        if (success) {
            toast.success(message, { position: 'top-center', autoClose: 3000 })
            dispatch(removeSuccess())
            navigate("/profile")
        }
    }, [dispatch, success, message, navigate])

    useEffect(() => {
        if (user) {
            setName(user.name)
            setEmail(user.email)
            setAvatarPreview(user.avatar?.url || './images/profile.png')
        }
    }, [user])

    return (
        <>
            {loading ? (<Loader />) : (
                <>
                    <Navbar />
                    <main className="account-container update-profile-page">
                        <div className="account-content update-profile-content">
                            <AccountSidebar />

                            <section className="account-main update-profile-main">
                                <div className="update-profile-header">
                                    <div>
                                        <span className="update-profile-eyebrow">Tài khoản của tôi</span>
                                        <h1>Cập nhật hồ sơ</h1>
                                        <p>Chỉnh sửa thông tin cá nhân và ảnh đại diện của bạn.</p>
                                    </div>

                                    <label
                                        htmlFor="update-profile-avatar"
                                        className="update-profile-avatar-upload"
                                    >
                                        <input
                                            id="update-profile-avatar"
                                            type="file"
                                            name="avatar"
                                            accept="image/*"
                                            className="update-profile-file-input"
                                            onChange={profileImageUpdate}
                                        />
                                        <span className="update-profile-avatar-frame">
                                            <img
                                                src={avatarPreview}
                                                alt="Hồ sơ người dùng"
                                                className="update-profile-avatar-image"
                                            />
                                            <span className="update-profile-avatar-button">
                                                <PhotoCameraOutlinedIcon />
                                            </span>
                                        </span>
                                        <span className="update-profile-avatar-text">Đổi ảnh đại diện</span>
                                    </label>
                                </div>

                                <div className="update-profile-card">
                                    <form
                                        className="update-profile-form"
                                        encType='multipart/form-data'
                                        onSubmit={updateSubmit}
                                    >
                                        <div className="update-profile-field">
                                            <label htmlFor="update-profile-name">Họ và tên</label>
                                            <div className="update-profile-input-wrap">
                                                <PersonOutlineIcon />
                                                <input
                                                    id="update-profile-name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    name="name"
                                                    placeholder="VD: Nguyễn Văn A"
                                                />
                                            </div>
                                        </div>

                                        <div className="update-profile-field">
                                            <label htmlFor="update-profile-email">Địa chỉ Email</label>
                                            <div className="update-profile-input-wrap">
                                                <EmailOutlinedIcon />
                                                <input
                                                    id="update-profile-email"
                                                    type="text"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    name="email"
                                                    placeholder="VD: nguyenvana@gmail.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="update-profile-actions">
                                            <button
                                                type="submit"
                                                className="update-profile-submit"
                                            >
                                                Cập nhật hồ sơ
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => navigate('/profile')}
                                                className="update-profile-cancel"
                                            >
                                                Quay lại
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        </div>
                    </main>
                    <Footer />
                </>
            )}
        </>
    )
}

export default UpdateProfileView
