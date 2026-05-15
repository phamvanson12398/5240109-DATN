import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { removeErrors, resetPassword } from "@/features/user/userSlice";

/**
 * useResetPassword — encapsulates reset password form logic.
 */
export function useResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { success, error, loading } = useSelector((s) => s.user);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp", { position: "top-center", autoClose: 3000 });
      return;
    }
    dispatch(resetPassword({ token, userData: { password, confirmPassword } }));
  };

  useEffect(() => {
    if (error) { toast.error(error, { position: "top-center", autoClose: 3000 }); dispatch(removeErrors()); }
  }, [dispatch, error]);

  useEffect(() => {
    if (success) {
      toast.success("Đặt lại mật khẩu thành công", { position: "top-center", autoClose: 3000 });
      navigate("/login");
    }
  }, [dispatch, success, navigate]);

  return { password, setPassword, confirmPassword, setConfirmPassword, loading, handleSubmit };
}