import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { SocialLogin } from "@/features/auth/components/SocialLogin";
import { useRegister } from "@/features/auth/hooks/useRegister";
import BrandLogo from "@/shared/components/BrandLogo";
import { API_V1_BASE_URL } from "@/shared/config/api";

const inputClass =
  "h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#E85D75] focus:ring-4 focus:ring-[#E85D75]/10";

function RegisterView() {
  const { user, avatarPreview, loading, handleDataChange, handleSubmit } = useRegister();
  const { name, email, password } = user;
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const backendUrl = API_V1_BASE_URL;

  const handleGoogleRegister = () => window.open(`${backendUrl}/auth/google`, "_self");
  const handleFacebookRegister = () => window.open(`${backendUrl}/auth/facebook`, "_self");

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
        <section className="grid w-full max-w-[1120px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(17,24,39,0.10)] md:grid-cols-[0.9fr_1fr]">
          <div className="relative hidden min-h-[780px] overflow-hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
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
            <div className="w-full max-w-[460px]">
              <div className="mb-7">
                <BrandLogo size="lg" className="mb-8 md:hidden" />
                <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
                  Tạo tài khoản
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                  Lưu sản phẩm yêu thích, theo dõi đơn hàng và nhận ưu đãi dành riêng cho thành viên.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#E5E7EB] bg-white">
                    <img src={avatarPreview} alt="Xem trước ảnh đại diện" className="h-full w-full object-cover" />
                    <label
                      htmlFor="register-avatar"
                      className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/35 opacity-0 transition-opacity hover:opacity-100"
                    >
                      <Camera className="h-5 w-5 text-white" />
                    </label>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111827]">Ảnh đại diện</p>
                    <p className="mt-1 text-xs text-[#6B7280]">Tùy chọn, có thể cập nhật sau.</p>
                  </div>
                  <label
                    htmlFor="register-avatar"
                    className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#111827] transition-colors hover:bg-[#FAFAFA]"
                  >
                    Chọn ảnh
                  </label>
                  <input
                    id="register-avatar"
                    type="file"
                    name="avatar"
                    className="hidden"
                    accept="image/*"
                    onChange={handleDataChange}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="register-name" className="mb-2 block text-sm font-medium text-[#111827]">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                      <input
                        id="register-name"
                        name="name"
                        type="text"
                        placeholder="Họ và tên của bạn"
                        value={name}
                        onChange={handleDataChange}
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-[#111827]">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                      <input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={handleDataChange}
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="register-phone" className="mb-2 block text-sm font-medium text-[#111827]">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                      <input
                        id="register-phone"
                        type="tel"
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-[#111827]">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                      <input
                        id="register-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={handleDataChange}
                        minLength={8}
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

                  <div>
                    <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium text-[#111827]">
                      Xác nhận
                    </label>
                    <div className="relative">
                      <Check className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                      <input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className={`${inputClass} pl-11 pr-11`}
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
                </div>

                <label className="flex items-start gap-3 text-sm text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#E5E7EB] text-[#E85D75] focus:ring-[#E85D75]/20"
                  />
                  <span>
                    Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của GÓC SÁCH.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#E85D75] px-5 text-sm font-semibold text-white transition-all hover:bg-[#d84f67] focus:outline-none focus:ring-4 focus:ring-[#E85D75]/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Đăng ký</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7">
                <SocialLogin
                  onGoogle={handleGoogleRegister}
                  onFacebook={handleFacebookRegister}
                  label="Hoặc đăng ký với"
                />
              </div>

              <p className="mt-8 text-center text-sm text-[#6B7280]">
                Đã có tài khoản?{" "}
                <Link to="/login" className="font-semibold text-[#E85D75] hover:text-[#c94961]">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white/70">
        <div className="mx-auto flex max-w-[1120px] items-center justify-center px-5 py-5 text-xs text-[#6B7280]">
          © {new Date().getFullYear()} GÓC SÁCH. Đọc hôm nay, trưởng thành ngày mai.
        </div>
      </footer>
    </div>
  );
}

export default RegisterView;
