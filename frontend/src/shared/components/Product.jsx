import React, { useState } from 'react'
import '@/shared/components/styles/Product.css'
import { Link } from 'react-router-dom'
import Rating from '@/shared/components/Rating'
import { formatVND } from '@/shared/utils/formatCurrency'

function Product({ product }) {

    const [rating, setRating] = useState(0)
    const handleRatingChange = (newRating) => {
        setRating(rating)
        console.log(`rating changed to : ${newRating}`);

    }


    // Tính % giảm giá
    const discountPercent = product.originalPrice && product.originalPrice > product.price
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    return (
        <Link to={`/product/${product._id}`} className="product_id">
            <div className="product-card">
                {/* Image Container */}
                <div className="product-card__image-wrapper">
                    <img
                        src={product.images?.[0]?.url || "/public/ao/ao_khoac.jpg"}
                        alt={product.name}
                        className="product-image-card hover-scale-up"
                    />

                    {/* Wishlist Button */}
                    <button
                        className="product-card__wishlist hover-icon-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // TODO: Add to wishlist logic
                        }}
                        aria-label="Yêu thích"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                        <span className="product-card__badge">-{discountPercent}%</span>
                    )}
                </div>

                {/* Product Info */}
                <div className="product-details">
                    {/* Category */}
                    {product.category && (
                        <p className="product-card__category">
                            {typeof product.category === 'object' 
                                ? (product.category.level3 || product.category.level2 || product.category.level1) 
                                : product.category}
                        </p>
                    )}

                    {/* Name */}
                    <h3 className="product-title hover-link-slide text-black pb-1 mb-1">{product.name}</h3>

                    {/* Price Row */}
                    <div className="product-card__price-row">
                        <p className="home-price">{formatVND(product.price)}</p>
                        {product.originalPrice > 0 && product.originalPrice > product.price && (
                            <span className="product-card__original-price">
                                {formatVND(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Rating + Review Count */}
                    <div className="product-card__rating-row">
                        <div className="rating_container">
                            <Rating
                                value={product.ratings}
                                onRatingChange={handleRatingChange}
                                disabled={true}
                            />
                        </div>
                        {product.numOfReviews > 0 && (
                            <span className="product-card__review-count">
                                ({product.numOfReviews})
                            </span>
                        )}
                        {product.sold > 0 && (
                            <>
                                <span className="product-card__review-count">|</span>
                                <span className="product-card__sold">
                                    Đã bán {product.sold >= 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default Product