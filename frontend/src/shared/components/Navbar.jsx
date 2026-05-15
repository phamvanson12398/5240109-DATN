import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '@/features/user/userSlice';
import { toast } from 'react-toastify';
import BrandLogo from '@/shared/components/BrandLogo';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const { unreadCount = 0 } = useSelector((state) => state.notification);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/products`);
    }
    setSearchQuery("");
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        toast.success("Đăng xuất thành công");
        navigate('/login');
      })
      .catch((err) => {
        toast.error(err.message || "Đăng xuất thất bại");
      });
  };

  const navLinks = [
    
    { name: 'SẢN PHẨM', path: '/products' },
    { name: 'SÁCH VIỆT NAM', path: '/products?category=sach_viet_nam', hasDropdown: true },
    { name: 'FOREGIN BOOKS', path: '/products?category=foregin_book' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-md border-b border-slate-200/60 py-3 shadow-soft" 
            : "bg-white/72 backdrop-blur-xl border-b border-white/60 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <BrandLogo size="lg" className="transition-all duration-300" />

            {/* Desktop Nav */}
            <ul className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={`text-[12px] font-bold tracking-widest transition-all duration-300 relative group flex items-center gap-1 ${
                      isActive(link.path) 
                        ? "text-primary" 
                        : isScrolled
                          ? "text-text-secondary hover:text-primary"
                          : "text-slate-700 hover:text-primary"
                    }`}
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <ExpandMoreIcon className="!text-[14px] transition-transform group-hover:rotate-180" />
                    )}
                    <span className={`absolute -bottom-1 left-0 h-[2px] bg-accent transition-all duration-500 ${
                      isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                    }`} />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-6">
              <div className="hidden md:block relative group">
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sách..."
                    className={`bg-slate-100/50 border border-transparent text-sm py-2 px-4 rounded-pill focus:outline-none focus:bg-white focus:border-accent/30 transition-all duration-300 w-48 focus:w-72 shadow-inner ${
                      isScrolled ? "text-primary" : "text-primary"
                    }`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <SearchIcon className="absolute right-4 text-slate-400 group-focus-within:text-accent transition-colors !text-[20px]" />
                </form>
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  to="/notifications" 
                  className="relative p-2.5 bg-slate-100 hover:bg-accent/10 rounded-full transition-all group text-primary"
                >
                  <NotificationsIcon className="group-hover:text-accent transition-colors !text-[24px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/cart" 
                  className="relative p-2.5 bg-slate-100 hover:bg-accent/10 rounded-full transition-all group text-primary"
                >
                  <ShoppingBagIcon className="group-hover:text-accent transition-colors !text-[24px]" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                      {cartItems.length}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2.5 p-1 pl-1 pr-3 bg-slate-100/80 hover:bg-slate-200 transition-all rounded-full group border border-transparent hover:border-slate-200"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm bg-white">
                        <img 
                          src={user?.avatar?.url || '/images/profile.png'} 
                          alt={user?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="hidden sm:block text-[11px] font-black tracking-widest text-primary uppercase">
                        {user?.name?.split(' ').pop()}
                      </span>
                      {isUserMenuOpen ? (
                        <ExpandLessIcon className="text-slate-400 transition-transform duration-300 !text-[20px] group-hover:text-accent" />
                      ) : (
                        <ExpandMoreIcon className="text-slate-400 transition-transform duration-300 !text-[20px] group-hover:text-accent" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsUserMenuOpen(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-luxury border border-slate-100 p-2 z-20"
                          >
                            <div className="px-4 py-4 border-b border-slate-50 mb-2 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100">
                                <img 
                                  src={user?.avatar?.url || '/images/profile.png'} 
                                  alt={user?.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-primary truncate">{user?.name}</p>
                                <p className="text-[10px] font-medium text-slate-400 truncate">{user?.email}</p>
                              </div>
                            </div>
                            
                            {(user?.role === 'admin' || user?.role_id?.name === 'admin') && (
                              <Link 
                                to="/admin/dashboard" 
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-accent bg-accent/5 hover:bg-accent/10 rounded-xl transition-all mb-1"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <DashboardIcon className="!text-[20px]" />
                                <span>Trang quản trị</span>
                              </Link>
                            )}

                            <Link 
                              to="/profile" 
                              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <PersonIcon className="!text-[20px]" />
                              <span>Hồ sơ cá nhân</span>
                            </Link>

                            <Link 
                              to="/orders/user" 
                              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Inventory2Icon className="!text-[20px]" />
                              <span>Đơn hàng của tôi</span>
                            </Link>

                            <Link 
                              to="/password/update" 
                              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <SettingsIcon className="!text-[20px]" />
                              <span>Đổi mật khẩu</span>
                            </Link>

                            <div className="h-px bg-slate-50 my-2" />

                            <button 
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <LogoutIcon className="!text-[20px]" />
                              <span>Đăng xuất</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="p-2.5 bg-slate-100 hover:bg-accent/10 rounded-full transition-all group text-primary"
                  >
                    <PersonIcon className="group-hover:text-accent transition-colors !text-[24px]" />
                  </Link>
                )}

                <button
                  className="lg:hidden p-2.5 bg-slate-100 rounded-full transition-all text-primary"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <MenuIcon className="!text-[28px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-primary/40 backdrop-blur-md z-[60]"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-[70] shadow-2xl p-10 flex flex-col"
            >
              <div className="flex items-center justify-between mb-16">
                <span className="text-2xl font-black text-primary tracking-tighter">DANH MỤC</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <CloseIcon className="!text-[32px]" />
                </button>
              </div>

              <nav className="flex-1">
                <ul className="space-y-8">
                  {navLinks.map((link) => (
                    <li key={link.path}>
                      <Link 
                        to={link.path} 
                        className={`text-2xl font-black tracking-tight flex items-center justify-between group ${
                          isActive(link.path) ? "text-accent" : "text-primary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          {link.name}
                          {link.hasDropdown && <ExpandMoreIcon className="!text-[20px]" />}
                        </div>
                        <span className="w-8 h-px bg-primary/10 group-hover:bg-accent group-hover:w-12 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="pt-10 border-t border-slate-100 flex flex-col gap-6">
                <Link 
                  to="/notifications" 
                  className="flex items-center justify-between text-primary font-black"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>THÔNG BÁO</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{unreadCount} tin mới</span>
                    <NotificationsIcon className="!text-[20px]" />
                  </div>
                </Link>

                <Link 
                  to="/cart" 
                  className="flex items-center justify-between text-primary font-black"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>GIỎ HÀNG</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{cartItems.length} sản phẩm</span>
                    <ShoppingBagIcon className="!text-[20px]" />
                  </div>
                </Link>
                {isAuthenticated ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img 
                          src={user?.avatar?.url || '/images/profile.png'} 
                          alt={user?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-primary truncate uppercase tracking-wider">{user?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thành viên Sách Ơi</p>
                      </div>
                    </div>
                    {(user?.role === 'admin' || user?.role_id?.name === 'admin') && (
                      <Link 
                        to="/admin/dashboard" 
                        className="w-full py-4 text-sm font-black uppercase tracking-widest text-accent bg-accent/5 border border-accent/20 text-center rounded-xl flex items-center justify-center gap-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <DashboardIcon className="!text-[20px]" />
                        <span>Trang quản trị</span>
                      </Link>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Link 
                        to="/profile" 
                        className="py-4 text-[10px] font-black uppercase tracking-widest text-primary border border-slate-100 text-center rounded-xl hover:bg-slate-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Hồ sơ
                      </Link>
                      <Link 
                        to="/orders/user" 
                        className="py-4 text-[10px] font-black uppercase tracking-widest text-primary border border-slate-100 text-center rounded-xl hover:bg-slate-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Đơn hàng
                      </Link>
                      <Link 
                        to="/password/update" 
                        className="py-4 text-[10px] font-black uppercase tracking-widest text-primary border border-slate-100 text-center rounded-xl hover:bg-slate-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Mật khẩu
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="bg-red-50 text-red-500 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-red-100 transition-colors"
                      >
                        Thoát
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="w-full bg-primary text-white py-5 rounded-none text-xs font-black uppercase tracking-widest text-center shadow-2xl shadow-primary/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập tài khoản
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
