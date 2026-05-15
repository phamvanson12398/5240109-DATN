import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { forgotPassword, removeErrors, removeMessage } from "@/features/user/userSlice";

/**
 * useForgotPassword — encapsulates forgot password form logic.
 */
export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { error, message, loading } = useSelector((s) => s.user);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) { toast.error("Vui lòng nhập email", { position: "top-center", autoClose: 3000 }); return; }
    dispatch(forgotPassword({ email }));
  };

  useEffect(() => {
    if (error) { toast.error(error, { position: "top-center", autoClose: 3000 }); dispatch(removeErrors()); }
    if (message) { toast.success(message, { position: "top-center", autoClose: 3000 }); dispatch(removeMessage()); }
  }, [dispatch, error, message]);

  return { email, setEmail, loading, handleSubmit };
}