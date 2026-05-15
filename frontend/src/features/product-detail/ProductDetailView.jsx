import React from 'react';
import PageTitle from '@/shared/components/PageTitle';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import Loader from '@/shared/components/Loader';
import { useProductDetail } from '@/features/product-detail/hooks/useProductDetail';
import ProductImages from '@/features/product-detail/components/ProductImages';
import ProductInfo from '@/features/product-detail/components/ProductInfo';
import ProductActions from '@/features/product-detail/components/ProductActions';
import ProductReviews from '@/features/product-detail/components/ProductReviews';
import RelatedProducts from '@/features/product-detail/components/RelatedProducts';
import '@/features/product-detail/styles/ProductDetail.css';

/**
 * ProductDetailView — layout / orchestration layer.
 * All business logic lives in useProductDetail hook.
 */
function ProductDetailView() {
  const {
    // state
    activeTab, setActiveTab,
    selectedImage, setSelectedImage,
    selectedColor, selectedSize, selectionError,
    quantity,
    // redux
    loading, error, product, cartLoading,
    // derived
    productImages, productColors, productSizes,
    originalPrice, discountPercent, soldCount,
    totalReviews, ratingDistribution, mockRelatedProducts,
    // handlers
    increaseQuantity, decreaseQuantity,
    addToCart, handleBuyNow,
    handleColorSelect, handleSizeSelect,
  } = useProductDetail();

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <Loader />
        <Footer />
      </>
    );
  }

  // ─── Error / not found state ────────────────────────────────────────────────
  if (error || !product) {
    return (
      <>
        <PageTitle title="Chi tiết sản phẩm" />
        <Navbar />
        <main className="product-details-page">
          <div className="product-details-container">
            <p>Không tìm thấy sản phẩm</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── Tab labels ─────────────────────────────────────────────────────────────
  const TABS = ['Mô tả', `Đánh giá (${product.numOfReviews || 0})`];

  return (
    <>
      <PageTitle title={`${product.name} - Chi tiết`} />
      <Navbar />

      <main className="product-details-page">
        <div className="product-details-container">

          {/* ── Main product section ─────────────────────────────────────── */}
          <div className="product-main-grid">
            {/* Gallery */}
            <ProductImages
              images={productImages}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
              productName={product.name}
            />

            {/* Info + actions */}
            <div className="product-info-section">
              <ProductInfo
                product={product}
                discountPercent={discountPercent}
                originalPrice={originalPrice}
                soldCount={soldCount}
                quantity={quantity}
              />
              <ProductActions
                product={product}
                productColors={productColors}
                productSizes={productSizes}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                quantity={quantity}
                selectionError={selectionError}
                cartLoading={cartLoading}
                onColorSelect={handleColorSelect}
                onSizeSelect={handleSizeSelect}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onAddToCart={addToCart}
                onBuyNow={handleBuyNow}
              />
            </div>
          </div>

          {/* ── Tabs section ─────────────────────────────────────────────── */}
          <div className="tabs-section">
            {/* Tab headers */}
            <div className="tabs-header" role="tablist">
              {TABS.map((tab, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === index}
                  className={`tab-btn ${activeTab === index ? 'active' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="tab-content">
              {/* Description tab */}
              <div className={`tab-panel ${activeTab === 0 ? 'active' : ''}`} role="tabpanel">
                <div className="description-content">
                  <p>{product.description}</p>
                </div>
              </div>

              {/* Details tab */}
              

              {/* Reviews tab */}
              <div className={`tab-panel ${activeTab === 2 ? 'active' : ''}`} role="tabpanel">
                <ProductReviews
                  product={product}
                  totalReviews={totalReviews}
                  ratingDistribution={ratingDistribution}
                />
              </div>
            </div>
          </div>

          {/* ── Related products ─────────────────────────────────────────── */}
          <RelatedProducts items={mockRelatedProducts} />

        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetailView;
