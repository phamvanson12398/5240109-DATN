import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Send } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";

const inputClass =
  "h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#E85D75] focus:ring-4 focus:ring-[#E85D75]/10";

function ForgotPasswordView() {
  const { email, setEmail, loading, handleSubmit } = useForgotPassword();

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
          Khôi phục tài khoản
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
          Quên mật khẩu?
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6B7280]">
          Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-[#111827]">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              id="forgot-email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`${inputClass} pl-11`}
              required
            />
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
              <Send size={17} />
              <span>Gửi liên kết đặt lại mật khẩu</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-7 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 text-center text-xs leading-5 text-[#6B7280]">
        Hãy kiểm tra cả hộp thư rác nếu bạn chưa thấy email sau vài phút.
      </p>
    </AuthCard>
  );
}

export default ForgotPasswordView;