import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { SocialLogin } from "@/features/auth/components/SocialLogin";
import { useLogin } from "@/features/auth/hooks/useLogin";
import BrandLogo from "@/shared/components/BrandLogo";

const inputClass =
  "h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#E85D75] focus:ring-4 focus:ring-[#E85D75]/10";

function LoginView() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleSubmit,
    handleGoogleLogin,
    handleFacebookLogin,
  } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

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

      <main className="flex flex-1 items-center justify-center px-5 py-10 md:py-14">
        <section className="grid w-full max-w-[1120px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(17,24,39,0.10)] md:grid-cols-[0.95fr_1fr]">
          <div className="relative hidden min-h-[720px] overflow-hidden md:block">
            <img
              src="https://images.pexels.com/photos/31608284/pexels-photo-31608284.jpeg?_gl=1*6dzyo5*_ga*MTY1MjM4NTQ2LjE3Nzk2MjE4NDI.*_ga_8JE65Q40S6*czE3Nzk2MjE4NDEkbzEkZzAkdDE3Nzk2MjE4NDEkajYwJGwwJGgw"
              alt="Bộ sưu tập sách nổi bật"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 flex flex-col justify-between p-10 text-white lg:p-12">
              <BrandLogo size="lg" tone="light" />
              <div className="max-w-sm">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                  KHÔNG GIAN TRI THỨC
                </p>
                <h2 className="text-4xl font-semibold leading-tight tracking-tight">
                  Khơi nguồn cảm hứng từ từng trang sách
                </h2>
                <p className="mt-5 text-base leading-7 text-white/80">
                  Khám phá kho sách hiện đại, tinh tế và đầy cảm hứng cùng GÓC SÁCH.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="w-full max-w-[420px]">
              <div className="mb-8">
                <BrandLogo size="lg" className="mb-8 md:hidden" />
                <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
                  Đăng nhập
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                  Chào mừng bạn quay lại. Tiếp tục hành trình khám phá tri thức cùng những cuốn sách truyền cảm hứng mỗi ngày.                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-[#111827]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      id="login-email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className={`${inputClass} pl-11`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-[#111827]">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={`${inputClass} pl-11 pr-11`}
                      required
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

                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#E5E7EB] text-[#E85D75] focus:ring-[#E85D75]/20"
                    />
                    Ghi nhớ tôi
                  </label>
                  <Link
                    to="/password/forgot"
                    className="text-sm font-semibold text-[#E85D75] transition-colors hover:text-[#c94961]"
                  >
                    Quên mật khẩu?
                  </Link>
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
                      <span>Đăng nhập</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7">
                <SocialLogin
                  onGoogle={handleGoogleLogin}
                  onFacebook={handleFacebookLogin}
                  label="Hoặc đăng nhập với"
                />
              </div>

              <p className="mt-8 text-center text-sm text-[#6B7280]">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="font-semibold text-[#E85D75] hover:text-[#c94961]">
                  Đăng ký
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white/70">
        <div className="mx-auto flex max-w-[1120px] items-center justify-center px-5 py-5 text-xs text-[#6B7280]">
          © {new Date().getFullYear()} GÓC SÁCH. khám phá kho sách hiện đại, tinh tế và đầy cảm hứng cùng GÓC SÁCH.
        </div>
      </footer>
    </div>
  );
}

export default LoginView;
