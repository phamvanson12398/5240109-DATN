import React, { useEffect, useState } from 'react'
import '@/pages/auth/styles/Login.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { login, removeSuccess } from '@/features/user/userSlice'
import { toast } from 'react-toastify'
import { removeErrors } from '@/features/user/userSlice'

function Login() {

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const {error, loading, isAuthenticated,success} = useSelector(state=> state.user)
    const location = useLocation();

    let redirect = new URLSearchParams(location.search).get("redirect") || "/";
    if (redirect !== "/" && !redirect.startsWith("/")) {
        redirect = `/${redirect}`;
    }
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const loginSubmit = (e) => {
        e.preventDefault();

        dispatch(login({
            email: loginEmail,
            password: loginPassword
        }))
    }

    useEffect(() => {
        if(error) {
            toast.error(error, {position:'top-center',autoClose:3000})

            dispatch(removeErrors())
        }
    },[dispatch, error])

    useEffect(() => {
        if(isAuthenticated) {
            navigate(redirect)
        }
    },[isAuthenticated, navigate, redirect])

    useEffect(() => {
        if(success) {
            toast.success("Đăng nhập thành công", {position: 'top-center' , autoClose:3000});
            dispatch(removeSuccess())
        }
    },[dispatch, success])
  return (
    <div className="login-page">
        <div className="login-background">
            <div className="login-background-orb login-background-orb-left" />
            <div className="login-background-orb login-background-orb-right" />
        </div>

        <div className="login-card">
            <div className="login-card-header">
                <div className="login-logo">
                    <svg className="login-logo-icon" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor" />
                        <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd" />
                    </svg>
                </div>
                <h1 className="login-title">Chào mừng trở lại</h1>
                <p className="login-subtitle">Vui lòng nhập thông tin để đăng nhập</p>
            </div>

            <form className="login-form" onSubmit={loginSubmit}>
                <div className="login-field">
                    <label className="login-label" htmlFor="login-email">
                        Địa chỉ Email
                    </label>
                    <div className="login-input-group">
                        <span className="login-input-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M21.75 7.5v9A2.25 2.25 0 0119.5 18.75h-15A2.25 2.25 0 012.25 16.5v-9m19.5 0A2.25 2.25 0 0019.5 5.25h-15A2.25 2.25 0 002.25 7.5m19.5 0l-8.69 5.527a2.25 2.25 0 01-2.12 0L2.25 7.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            placeholder="name@company.com"
                            value={loginEmail}
                            onChange={(e) => {setLoginEmail(e.target.value)}}
                            className="login-input"
                        />
                    </div>
                </div>

                <div className="login-field">
                    <div className="login-field-header">
                        <label className="login-label" htmlFor="login-password">
                            Mật khẩu
                        </label>
                        <Link to="/password/forgot" className="login-forgot-link hover-link-slide">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <div className="login-input-group">
                        <span className="login-input-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0119.5 12.75v6A2.25 2.25 0 0117.25 21h-10.5A2.25 2.25 0 014.5 18.75v-6A2.25 2.25 0 016.75 10.5z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <input
                            id="login-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => {setLoginPassword(e.target.value)}}
                            className="login-input login-input-password"
                        />
                        {/* <button className="login-password-toggle" type="button" aria-label="Toggle password visibility">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <path d="M2.25 12S5.25 5.25 12 5.25 21.75 12 21.75 12 18.75 18.75 12 18.75 2.25 12 2.25 12z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button> */}
                    </div>
                </div>

                <div className="login-remember-row">
                    <input className="login-checkbox" id="remember" name="remember" type="checkbox" />
                    <label className="login-remember-label" htmlFor="remember">
                        Ghi nhớ đăng nhập 30 ngày
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`login-submit-btn hover-btn-gradient ${loading ? 'login-submit-btn-loading' : ''}`}
                >
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>

                <div className="login-divider">
                    <div className="login-divider-line" />
                    <span className="login-divider-text">HOẶC TIẾP TỤC VỚI</span>
                    <div className="login-divider-line" />
                </div>

                <div className="login-social-grid">
                    <button 
                        className="login-social-btn hover-scale-up" 
                        type="button"
                        onClick={() => {
                            const rawApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");
                            const backendUrl = (rawApiUrl?.endsWith("/api/v1") ? rawApiUrl.slice(0, -7) : rawApiUrl) || 'http://localhost:8000';
                            
                            if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
                                toast.error("Cấu hình API URL bị thiếu. Vui lòng kiểm tra biến môi trường VITE_API_URL.");
                                return;
                            }
                            window.location.href = `${backendUrl}/api/v1/auth/google`;
                        }}
                    >
                        <svg className="login-social-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button 
                        className="login-social-btn hover-scale-up" 
                        type="button"
                        onClick={() => {
                            const rawApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");
                            const backendUrl = (rawApiUrl?.endsWith("/api/v1") ? rawApiUrl.slice(0, -7) : rawApiUrl) || 'http://localhost:8000';

                            if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
                                toast.error("Cấu hình API URL bị thiếu. Vui lòng kiểm tra biến môi trường VITE_API_URL.");
                                return;
                            }
                            window.location.href = `${backendUrl}/api/v1/auth/facebook`;
                        }}
                    >
                        <svg className="login-social-icon login-social-icon-fill" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.024 4.388 11.018 10.125 11.927V15.563H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.931-1.956 1.887v2.254h3.328l-.532 3.49h-2.796V24C19.612 23.091 24 18.097 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                </div>
            </form>

            <div className="login-card-footer">
                <p className="login-footer-text">
                    Chưa có tài khoản?
                    <Link to="/register" className="login-register-link hover-link-slide">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    </div>
  )
}

export default Login
