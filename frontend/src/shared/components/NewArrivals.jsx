import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Product from '@/shared/components/Product';
import '@/shared/components/styles/NewArrivals.css';

const NewArrivals = ({ products, loading }) => {
    const sliderRef = useRef(null);

    const scroll = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = 300;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section id="new-arrivals" className="new-arrivals-section">
            <div className="new-arrivals-container">
                <div className="new-arrivals-header">
                    <div className="na-title-group">
                        <p className="na-subtitle">Vừa Ra Mắt</p>
                        <h2 className="na-title">Hàng Mới Về</h2>
                    </div>

                    <div className="na-actions">
                        <button
                            onClick={() => scroll('left')}
                            aria-label="Trước đó"
                            className="na-nav-btn hover-icon-btn"
                        >
                            <svg className="na-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            aria-label="Tiếp theo"
                            className="na-nav-btn hover-icon-btn"
                        >
                            <svg className="na-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="na-loading-container">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="na-skeleton"></div>
                        ))}
                    </div>
                ) : (
                    <div
                        ref={sliderRef}
                        className="na-products-slider"
                    >
                        {products && products.length > 0 ? (
                            products.map((product) => (
                                <div key={product._id} className="na-product-item">
                                    <Product product={product} />
                                </div>
                            ))
                        ) : (
                            <p>Không có sản phẩm nào.</p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default NewArrivals;

