import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BrandLogo from "@/shared/components/BrandLogo";

/**
 * Centered auth page wrapper for compact auth flows.
 */
export function AuthCard({ children, maxWidth = "max-w-md" }) {
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
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={`w-full ${maxWidth}`}
        >
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_45px_rgba(17,24,39,0.08)] sm:p-8 md:p-10">
            {children}
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white/70">
        <div className="mx-auto flex max-w-[1120px] items-center justify-center px-5 py-5 text-xs text-[#6B7280]">
          © {new Date().getFullYear()} GÓC SÁCH. Đọc hôm nay, trưởng thành ngày mai.
        </div>
      </footer>
    </div>
  );
}

export default AuthCard;
