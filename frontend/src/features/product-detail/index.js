/**
 * features/product-detail — Public barrel exports.
 * Consumers import from "@/features/product-detail".
 */

// View (route-level)
export { default as ProductDetailView } from './ProductDetailView';

// Sub-components
export { default as ProductImages } from './components/ProductImages';
export { default as ProductInfo } from './components/ProductInfo';
export { default as ProductActions } from './components/ProductActions';
export { default as ProductReviews } from './components/ProductReviews';
export { default as RelatedProducts } from './components/RelatedProducts';

// Hook
export { useProductDetail, COLOR_MAP } from './hooks/useProductDetail';
