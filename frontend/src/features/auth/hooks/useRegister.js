import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { register, removeSuccess, removeErrors } from "@/features/user/userSlice";

const DEFAULT_AVATAR = "/images/profile.png";

/**
 * useRegister — encapsulates all registration form logic including avatar upload.
 */
export function useRegister() {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { success, loading, error } = useSelector((s) => s.user);

  const handleDataChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files?.[0];
      if (!file) { setAvatar(""); setAvatarPreview(DEFAULT_AVATAR); return; }
      const reader = new FileReader();
      reader.onload = () => { if (reader.readyState === 2) { setAvatarPreview(reader.result); setAvatar(reader.result); } };
      reader.readAsDataURL(file);
    } else {
      setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user.name || !user.email || !user.password) {
      toast.error("Vui lòng điền đầy đủ thông tin", { position: "top-center", autoClose: 3000 });
      return;
    }
    const form = new FormData();
    form.set("name", user.name);
    form.set("email", user.email);
    form.set("password", user.password);
    if (avatar) form.set("avatar", avatar);
    dispatch(register(form));
  };

  useEffect(() => {
    if (error) { toast.error(error, { position: "top-center", autoClose: 3000 }); dispatch(removeErrors()); }
  }, [dispatch, error]);

  useEffect(() => {
    if (success) {
      toast.success("Đăng ký thành công", { position: "top-center", autoClose: 3000 });
      dispatch(removeSuccess());
      navigate("/login");
    }
  }, [dispatch, success, navigate]);

  return { user, avatarPreview, loading, handleDataChange, handleSubmit };
}
