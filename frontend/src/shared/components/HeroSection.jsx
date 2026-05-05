import React from 'react';
import { Link } from 'react-router-dom';
import '@/shared/components/styles/HeroSection.css';

const HeroSection = () => {
    return (
        <section className="hero-section">
            <div className="hero-container">
                <div className="hero-grid">
                    {/* Content Left */}
                    <div className="hero-content-left">
                        <div className="fade-up delay-200">
                            <p className="hero-subtitle">Drop 02 — cổ tích</p>
                            <h1 className="hero-title">
                                drop<br />
                                cổ tích
                            </h1>
                        </div>

                        <div className="hero-divider fade-up delay-300"></div>

                        <p className="hero-description fade-up delay-400">
                            Những cuốn sách tốt giúp bạn vươn tầm trong tương lai
                        </p>

                        <div className="hero-buttons fade-up delay-500">
                            <Link to="/products?sort=newest" className="hero-btn hero-btn-primary">
                                <span>Mua Hàng Mới</span>
                            </Link>
                            <Link to="/products?category=accessories" className="hero-btn hero-btn-accent">
                                Khám Phá Phụ Kiện
                            </Link>
                        </div>
                    </div>

                    {/* Image Right */}
                    <div className="hero-content-right">
                        <div className="relative">
                            {/* Main Image */}
                            <div className="hero-image-wrapper fade-up delay-200">
                                <img
                                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
                                    alt="Hero Fashion"
                                    className="hero-image"
                                />
                            </div>

                            {/* Editorial Text Vertical */}
                            <div className="hero-vertical-text fade-up delay-500">
                                <p className="vertical-text-content">Lựa Chọn Biên Tập</p>
                            </div>

                            {/* Drop Badge */}
                            <div className="hero-badge-container fade-up delay-600">
                                <div className="hero-badge">
                                    <p className="badge-subtitle">Có Sẵn Ngay</p>
                                    <p className="badge-title">DROP 02</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;

