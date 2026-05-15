import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { login, removeErrors } from "@/features/user/userSlice";
import { API_V1_BASE_URL } from "@/shared/config/api";

/**
 * useLogin — encapsulates all login form logic.
 * Keeps LoginView as a pure presentation component.
 */
export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { error, loading, isAuthenticated } = useSelector((s) => s.user);
  const backendUrl = API_V1_BASE_URL;

  const redirect = location.search ? location.search.split("=")[1] : "/";

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleGoogleLogin = () => window.open(`${backendUrl}/auth/google`, "_self");
  const handleFacebookLogin = () => window.open(`${backendUrl}/auth/facebook`, "_self");

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (isAuthenticated) navigate(redirect);
  }, [isAuthenticated, navigate, redirect]);

  return { email, setEmail, password, setPassword, loading, handleSubmit, handleGoogleLogin, handleFacebookLogin };
}
