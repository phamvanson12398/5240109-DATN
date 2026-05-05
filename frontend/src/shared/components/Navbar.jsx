import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '@/shared/components/styles/Navbar.css';
import { useSelector } from 'react-redux';

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();

    const { isAuthenticated } = useSelector(state => state.user);
    const { cartItems } = useSelector(state => state.cart);
    const navigate = useNavigate();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        document.body.classList.remove('menu-open');
    }, [location]);

    // Handle body scroll lock when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

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

    return (
        <>
            <nav className="navbar" role="navigation" aria-label="Main navigation">
                <div className="navbar-container">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo" aria-label="ToBi Shop Home">
                        ToBi Shop
                    </Link>

                    {/* Desktop Navigation Links */}
                    <ul className="navbar-nav">
                        <li>
                            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                                Trang chủ
                            </Link>
                        </li>
                        <li>
                            <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
                                Sản phẩm
                            </Link>
                        </li>
                        <li>
                            <Link to="/about-us" className={`nav-link ${isActive('/about-us') ? 'active' : ''}`}>
                                Về chúng tôi
                            </Link>
                        </li>
                        <li>
                            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
                                Liên hệ
                            </Link>
                        </li>
                    </ul>

                    {/* Search Section */}
                    <div className="navbar-search-zone">
                        <div className="search-container">
                            <form className="search-form" onSubmit={handleSearchSubmit}>
                                <span className="search-icon-left">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label="Search products"
                                />
                                <button type="submit" className="search-submit-btn" aria-label="Submit search">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Actions (Cart, Account, Mobile Menu) */}
                    <div className="navbar-actions">
                        {/* Cart */}
                        <Link to="/cart" className="nav-icon-btn" aria-label="Shopping cart">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartItems.length > 0 && (
                                <span className="cart-badge">{cartItems.length}</span>
                            )}
                        </Link>

                        {/* Account/Register */}
                        {!isAuthenticated && (
                            <Link to="/register" className="nav-icon-btn" aria-label="Register account">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="mobile-menu-btn"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle mobile menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            />

            {/* Mobile Menu Drawer */}
            <aside className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`} role="dialog" aria-label="Mobile navigation">
                <div className="mobile-menu-header">
                    <div className="mobile-menu-logo">ToBi Shop</div>
                    <button
                        className="mobile-close-btn"
                        onClick={closeMobileMenu}
                        aria-label="Close mobile menu"
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Search */}
                <div className="mobile-search-section">
                    <form className="mobile-search-form" onSubmit={(e) => { handleSearchSubmit(e); closeMobileMenu(); }}>
                        <input
                            type="text"
                            className="mobile-search-input"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search products"
                        />
                        <button type="submit" className="mobile-search-submit" aria-label="Submit search">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>
                </div>

                {/* Mobile Navigation Links */}
                <ul className="mobile-nav-list">
                    <li className="mobile-nav-item">
                        <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMobileMenu}>
                            Trang chủ
                        </Link>
                    </li>
                    <li className="mobile-nav-item">
                        <Link to="/products" className={`mobile-nav-link ${isActive('/products') ? 'active' : ''}`} onClick={closeMobileMenu}>
                            Sản phẩm
                        </Link>
                    </li>
                    <li className="mobile-nav-item">
                        <Link to="/about-us" className={`mobile-nav-link ${isActive('/about-us') ? 'active' : ''}`} onClick={closeMobileMenu}>
                            Về chúng tôi
                        </Link>
                    </li>
                    <li className="mobile-nav-item">
                        <Link to="/contact" className={`mobile-nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={closeMobileMenu}>
                            Liên hệ
                        </Link>
                    </li>
                </ul>

                {/* Mobile Actions */}
                <div className="mobile-actions">
                    <Link to="/cart" className="mobile-action-btn" onClick={closeMobileMenu}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Giỏ hàng ({cartItems.length})
                    </Link>
                    {!isAuthenticated && (
                        <Link to="/register" className="mobile-action-btn" onClick={closeMobileMenu}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Đăng ký
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}

export default Navbar;