import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

function HomeMobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.user);
  const { cartItems = [] } = useSelector((state) => state.cart);

  const items = useMemo(
    () => [
      { label: "TRANG CHỦ", to: "/", icon: "home" },
      { label: "MUA SẮM", to: "/products", icon: "search" },
      { label: "GIỎ HÀNG", to: "/cart", icon: "shopping_bag", badge: cartItems.length },
      { label: "TÀI KHOẢN", to: isAuthenticated ? "/profile" : "/login", icon: "person" },
    ],
    [cartItems.length, isAuthenticated]
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-2xl border-t border-slate-100 px-6 pb-8 pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]" aria-label="Điều hướng nhanh trên di động">
      <div className="flex items-center justify-between">
        {items.map((item) => {
          const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);

          return (
            <Link 
              key={item.label} 
              to={item.to} 
              className={`flex flex-col items-center gap-1.5 transition-all duration-500 relative ${isActive ? "text-primary" : "text-slate-400"}`}
            >
              <div className="relative">
                <span 
                  className="material-symbols-outlined !text-[24px] transition-all duration-300" 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-accent text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-black tracking-[0.1em] transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-60 scale-95"}`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-indicator-premium"
                  className="absolute -top-3 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default React.memo(HomeMobileBottomNav);
