import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { loaderUser } from "@/features/user/userSlice";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import BrandLogo from "@/shared/components/BrandLogo";

const LoginSuccessView = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      localStorage.setItem("token", urlToken);
    }
    dispatch(loaderUser());
    toast.success("Đăng nhập thành công!", { position: "top-center", autoClose: 2000 });
    const timer = setTimeout(() => {
      navigate("/");
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate, dispatch, location.search]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans flex flex-col">
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-[#FAFAFA]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-5">
          <BrandLogo size="md" />
          <Link
            to="/"
            className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111827]"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_18px_45px_rgba(17,24,39,0.08)] sm:p-10"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16A34A]/10 text-[#16A34A]">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <h1 className="mt-7 text-3xl font-semibold tracking-tight text-[#111827]">
            Đăng nhập thành công
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            Tài khoản của bạn đã được xác thực. Chúng tôi đang đưa bạn về trang chủ.
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-[#6B7280]">
            <Loader2 className="h-4 w-4 animate-spin text-[#E85D75]" />
            Đang chuyển hướng...
          </div>

          <Link
            to="/"
            className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#E85D75] px-5 text-sm font-semibold text-white transition-all hover:bg-[#d84f67] focus:outline-none focus:ring-4 focus:ring-[#E85D75]/20"
          >
            Về trang chủ
            <ArrowRight size={17} />
          </Link>
        </motion.section>
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white/70">
        <div className="mx-auto flex max-w-[1120px] items-center justify-center px-5 py-5 text-xs text-[#6B7280]">
          © {new Date().getFullYear()} GÓC SÁCH. Đọc hôm nay, trưởng thành ngày mai.
        </div>
      </footer>
    </div>
  );
};

export default LoginSuccessView;
