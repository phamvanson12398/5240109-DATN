import React, { useState , useEffect} from 'react'
import '@/pages/auth/styles/Register.css'
import {Link, useNavigate} from "react-router-dom"
import { toast } from 'react-toastify'

import {useSelector, useDispatch} from 'react-redux'
import { register, removeSuccess } from '@/features/user/userSlice'
import { removeErrors } from '@/features/user/userSlice'

const DEFAULT_AVATAR_PREVIEW = '/images/profile.png'

function Register() {

    const [user, setUser] = useState({
        name:'',
        email:'',
        password:''
    })
    const [avatar, setAvatar] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR_PREVIEW)
     const {name, email, password} = user
    const {success, loading, error} = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const registerDataChange= (e) => {
        if(e.target.name === 'avatar') {
           const file = e.target.files?.[0]
           if(!file) {
                setAvatar("")
                setAvatarPreview(DEFAULT_AVATAR_PREVIEW)
                return
           }
           const reader=  new FileReader()
           reader.onload = () => {
            if(reader.readyState === 2) {
                setAvatarPreview(reader.result)
                setAvatar(reader.result)
            }
           }
           reader.readAsDataURL(file)
        }else{
            setUser({...user,[e.target.name]:e.target.value})
        }
    }
    const registerSubmit = (e) => {
        e.preventDefault();
        if(!name || !email || !password) {
            toast.error('Vui lòng điền đầy đủ thông tin',
                {position:'top-center', autoClose:3000}
            )
            return;
        }
        const myForm = new FormData();
        myForm.set('name', name);
        myForm.set('email', email);
        myForm.set('password', password);
        if(avatar) {
            myForm.set('avatar', avatar);
        }
        dispatch(register(myForm))

    }
    useEffect(() => {
              if(error) {
                toast.error(error, {position: 'top-center' , autoClose:3000});
                dispatch(removeErrors())

              }
            }, [dispatch, error])

    useEffect(() => {
              if(success) {
                toast.success("Đăng ký thành công", {position: 'top-center' , autoClose:3000});
                dispatch(removeSuccess())
                navigate('/login')
              }
            }, [dispatch, success])

  return (
    <main className="register-page">
        <section className="register-card">
            <div className="register-card-body">
                <div className="register-header">
                    <h1>Tạo tài khoản</h1>
                    <p>Tham gia cộng đồng của chúng tôi ngay hôm nay</p>
                </div>

                <form className="register-form" onSubmit={registerSubmit} encType='multipart/form-data'>
                    <div className="register-avatar-block">
                        <input
                            id="register-avatar"
                            type="file"
                            name="avatar"
                            className="register-file-input"
                            accept="image/*"
                            onChange={registerDataChange}
                        />

                        <label htmlFor="register-avatar" className="register-avatar-picker hover-scale-up">
                            <div className="register-avatar-shell">
                                <img
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    className="register-avatar-image"
                                />
                                <div className="register-avatar-hover">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                        <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18A2.25 2.25 0 004.5 20.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.72 47.72 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.19 2.19 0 00-1.736-1.039 48.56 48.56 0 00-5.232 0 2.19 2.19 0 00-1.736 1.039l-.821 1.316z" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="register-avatar-badge" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </div>
                        </label>

                        <div className="register-avatar-copy">
                            <p>Tải ảnh đại diện</p>
                        </div>
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-name">Tên người dùng</label>
                        <div className="register-input-wrap">
                            <span className="register-input-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <input
                                id="register-name"
                                type="text"
                                name="name"
                                placeholder="Nhập tên người dùng"
                                value={name}
                                onChange={registerDataChange}
                            />
                        </div>
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-email">Email</label>
                        <div className="register-input-wrap">
                            <span className="register-input-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M21.75 7.5v9A2.25 2.25 0 0119.5 18.75h-15A2.25 2.25 0 012.25 16.5v-9m19.5 0A2.25 2.25 0 0019.5 5.25h-15A2.25 2.25 0 002.25 7.5m19.5 0l-8.69 5.527a2.25 2.25 0 01-2.12 0L2.25 7.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <input
                                id="register-email"
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={registerDataChange}
                            />
                        </div>
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-password">Mật khẩu</label>
                        <div className="register-input-wrap">
                            <span className="register-input-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0119.5 12.75v6A2.25 2.25 0 0117.25 21h-10.5A2.25 2.25 0 014.5 18.75v-6A2.25 2.25 0 016.75 10.5z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <input
                                id="register-password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={registerDataChange}
                            />
                            {/* <button
                                type="button"
                                className="register-password-toggle"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? 'An mat khau' : 'Hien mat khau'}
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                        <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M10.585 10.587a2 2 0 102.828 2.828" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.878 5.09A9.77 9.77 0 0112 4.875c6.75 0 9.75 7.125 9.75 7.125a15.708 15.708 0 01-4.054 5.138M6.61 6.61C4.123 8.312 2.25 12 2.25 12S5.25 19.125 12 19.125a9.84 9.84 0 004.056-.86" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                        <path d="M2.25 12S5.25 5.25 12 5.25 21.75 12 21.75 12 18.75 18.75 12 18.75 2.25 12 2.25 12z" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button> */}
                        </div>
                    </div>

                    <button className="register-submit-btn hover-btn-gradient">
                        {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                    </button>

                    <p className="register-login-link">
                        Đã có tài khoản?
                        <Link to="/login" className="hover-link-slide">Đăng nhập</Link>
                    </p>
                </form>
            </div>
        </section>
    </main>
  )
}

export default Register
