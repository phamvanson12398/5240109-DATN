import React from 'react';
import Product from '@/shared/components/Product';
import '@/shared/components/styles/RelatedProductsSection.css';

/**
 * Related Products Section - Displays suggestions when no results match the search/filter
 */
const RelatedProductsSection = ({ products, title = "SẢN PHẨM LIÊN QUAN" }) => {
    if (!products || products.length === 0) return null;

    return (
        <div className="related-products-section">
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
                <p className="section-subtitle">Dưới đây là một số sản phẩm liên quan bạn có thể quan tâm.</p>
                <div className="section-divider"></div>
            </div>
            
            <div className="products-grid">
                {products.map((product) => (
                    <Product key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default RelatedProductsSection;
