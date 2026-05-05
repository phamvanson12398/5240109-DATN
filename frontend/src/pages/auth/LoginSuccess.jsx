import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
// Giả sử có action loadUser để cập nhật trạng thái sau khi login thành công
import { loaderUser } from '@/features/user/userSlice';

const LoginSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        // Lấy token từ URL (Social Login redirect)
        const params = new URLSearchParams(location.search);
        const urlToken = params.get("token");
        
        if (urlToken) {
            localStorage.setItem("token", urlToken);
        }

        // Gọi loadUser để lấy thông tin user mới nhất và cập nhật Redux
        dispatch(loaderUser());
        
        toast.success("Đăng nhập thành công!");
        
        // Chuyển hướng về trang chủ sau 1 giây
        const timer = setTimeout(() => {
            navigate("/");
        }, 1000);

        return () => clearTimeout(timer);
    }, [navigate, dispatch, location.search]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2>Đang xác thực...</h2>
            <div className="loader"></div>
        </div>
    );
};

export default LoginSuccess;
