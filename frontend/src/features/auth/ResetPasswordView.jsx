import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Save,
} from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";

const inputClass =
  "h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#E85D75] focus:ring-4 focus:ring-[#E85D75]/10";

function ResetPasswordView() {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    handleSubmit,
  } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <AuthCard maxWidth="max-w-md">
      <Link
        to="/login"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111827]"
      >
        <ArrowLeft size={16} />
        Quay lại đăng nhập
      </Link>

      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#E85D75]">
          Bảo mật tài khoản
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
          Cập nhật mật khẩu
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6B7280]">
          Chọn mật khẩu mới để tiếp tục sử dụng tài khoản GÓC SÁCH của bạn.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#111827]">
            Mật khẩu mới
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${inputClass} pl-11 pr-11`}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#FAFAFA] hover:text-[#111827]"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-[#111827]">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <CheckCircle2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={`${inputClass} pl-11 pr-11`}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#FAFAFA] hover:text-[#111827]"
              aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
            >
              {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#E85D75] px-5 text-sm font-semibold text-white transition-all hover:bg-[#d84f67] focus:outline-none focus:ring-4 focus:ring-[#E85D75]/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Save size={17} />
              <span>Cập nhật mật khẩu</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-7 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 text-xs leading-5 text-[#6B7280]">
        Mật khẩu mới nên có ít nhất 8 ký tự và không trùng với mật khẩu cũ.
      </p>
    </AuthCard>
  );
}

export default ResetPasswordView;