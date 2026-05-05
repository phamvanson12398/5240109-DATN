import React, { useEffect, useState } from 'react';
import '@/pages/public/styles/Products.css';
import PageTitle from '@/shared/components/PageTitle';
import Navbar from '@/shared/components/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import Footer from '@/shared/components/Footer';
import { getProduct, removeErrors } from '@/features/products/productSlice';
import { toast } from 'react-toastify';
import Product from '@/shared/components/Product';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Loader from '@/shared/components/Loader';
import Pagination from '@/shared/components/Pagination';
import NoProducts from '@/shared/components/NoProducts';
import RelatedProductsSection from '@/shared/components/RelatedProductsSection';

function Products() {
  // Redux state
  const { loading, error, products, productCount, hasResults, relatedProducts } = useSelector(state => state.product);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // URL params
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get("keyword");
  const categoryFromURL = searchParams.get("category");
  const pageFromURL = parseInt(searchParams.get("page"), 10) || 1;

  // Component state
  const [currentPage, setCurrentPage] = useState(pageFromURL);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState(categoryFromURL ? [categoryFromURL] : []);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 30000000 }); // UI input values (VND)
  const [appliedPrice, setAppliedPrice] = useState(null); // Actual filter sent to API
  const [priceError, setPriceError] = useState(''); // Validation error message
  const [selectedRating, setSelectedRating] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');


  const ratings = [5, 4, 3, 2, 1];
  const PRICE_MIN = 0;
  const PRICE_MAX = 30000000; // 30 triệu VND

  // Preset price ranges (Shopee-style chips)
  const pricePresets = [
    { label: 'Dưới 100k', min: 0, max: 100000 },
    { label: '100k - 500k', min: 100000, max: 500000 },
    { label: '500k - 1tr', min: 500000, max: 1000000 },
    { label: 'Trên 1tr', min: 1000000, max: PRICE_MAX },
  ];

  // Helper: format giá VND
  

  // Close drawer when route changes
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location]);

  // Handle body scroll lock
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isMobileDrawerOpen]);

  // Fetch products — chỉ gọi khi appliedPrice thay đổi (nhấn Áp dụng / click chip)
  useEffect(() => {
    const category = selectedCategories.length > 0 ? selectedCategories[0] : null;

    dispatch(getProduct({
      keyword,
      page: currentPage,
      category,
      price: appliedPrice,
      sort: sortBy,
      ratings: selectedRating
        ? { gte: selectedRating, lt: selectedRating + 1 }
        : null,
      inStock: inStockOnly,
    }));
  }, [dispatch, currentPage, selectedCategories, keyword, appliedPrice, sortBy, selectedRating, inStockOnly]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error.message, { position: 'top-center', autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  // Pagination handler
  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      const newSearchParams = new URLSearchParams(location.search);
      if (page === 1) {
        newSearchParams.delete('page');
      } else {
        newSearchParams.set('page', page);
      }
      navigate(`?${newSearchParams.toString()}`);
    }
  };

  // Category filter handler
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        // For now, only allow single category selection (backend limitation)
        return [category];
      }
    });
    setCurrentPage(1);
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete('page');
    if (selectedCategories.includes(category)) {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', category);
    }
    navigate(`?${newSearchParams.toString()}`);
  };

  // Price input handler — validate trước khi apply
  const handleApplyPrice = () => {
    if (priceRange.min > 0 && priceRange.max > 0 && priceRange.min > priceRange.max) {
      setPriceError('Khoảng giá không hợp lệ');
      return;
    }
    setPriceError('');
    // Tạo filter thực sự → trigger useEffect gọi API
    const newPrice =
      (priceRange.min > PRICE_MIN || priceRange.max < PRICE_MAX)
        ? { gte: priceRange.min, lte: priceRange.max }
        : null;
    setAppliedPrice(newPrice);
    setCurrentPage(1);
  };

  // Preset chip click handler
  const handlePresetClick = (preset) => {
    setPriceRange({ min: preset.min, max: preset.max });
    // Chip = áp dụng ngay, gửi API luôn
    setAppliedPrice({ gte: preset.min, lte: preset.max });
    setPriceError('');
    setCurrentPage(1);
  };

  // Rating filter handler
  const handleRatingChange = (rating) => {
    setSelectedRating(rating === selectedRating ? null : rating);
    setCurrentPage(1);
  };


  // Sort handler
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCategories([]);
    setPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
    setAppliedPrice(null);
    setSelectedRating(null);
    setInStockOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
    navigate('/products');
  };


  // Calculate active filter count
  const activeFilterCount =
    selectedCategories.length +
    (appliedPrice ? 1 : 0) +
    (selectedRating ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  // Render filter section (reusable for desktop and mobile)
  const renderFilters = (isMobile = false) => {
    const renderCategoryLink = (label, filterValue, isBold = false) => {
      const isActive = selectedCategories.includes(filterValue);
      return (
        <button
          className={`hover-link-slide text-left inline-block ${isActive || isBold ? 'font-medium text-black active' : 'text-gray-600'}`}
          onClick={(e) => { e.preventDefault(); handleCategoryToggle(filterValue); }}
        >
          {label}
        </button>
      );
    };

    return (
      <>
        <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
          .heading-serif { font-family: 'Playfair+Display', serif; }
        `}
        </style>

        {/* Category Filter */}
        <div className="filter-section">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Khám Phá Danh Mục</h2>
          <div className="space-y-8">
            {/* Men's Section */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center justify-between group cursor-pointer">NAM</h3>
              <ul className="space-y-4 pl-1 text-sm text-gray-600">
                <li>
                  <span className="block font-medium text-black mb-2">Áo</span>
                  <ul className="pl-3 space-y-2 border-l border-gray-100">
                    <li>{renderCategoryLink('Thun', 'Áo thun nam')}</li>
                    <li>{renderCategoryLink('Sơ mi', 'Áo sơ mi nam')}</li>
                    <li>{renderCategoryLink('Hoodie', 'Áo hoodie nam')}</li>
                    <li>{renderCategoryLink('Khoác', 'Áo khoác nam')}</li>
                    <li>{renderCategoryLink('Polo', 'Áo polo nam')}</li>
                  </ul>
                </li>
                <li>
                  <span className="block font-medium text-black mb-2">Quần</span>
                  <ul className="pl-3 space-y-2 border-l border-gray-100">
                    <li>{renderCategoryLink('Jean', 'Quần jean nam')}</li>
                    <li>{renderCategoryLink('Short', 'Quần short nam')}</li>
                    <li>{renderCategoryLink('Kaki', 'Quần kaki nam')}</li>
                    <li>{renderCategoryLink('Jogger', 'Quần jogger nam')}</li>
                  </ul>
                </li>
              </ul>
            </div>
            {/* Women's Section */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center justify-between group cursor-pointer">NỮ</h3>
              <ul className="space-y-4 pl-1 text-sm text-gray-600">
                <li>
                  <span className="block font-medium text-black mb-2">Áo</span>
                  <ul className="pl-3 space-y-2 border-l border-gray-100">
                    <li>{renderCategoryLink('Thun', 'Áo thun nữ')}</li>
                    <li>{renderCategoryLink('Sơ mi', 'Áo sơ mi nữ')}</li>
                    <li>{renderCategoryLink('Kiểu', 'Áo kiểu nữ')}</li>
                    <li>{renderCategoryLink('Khoác', 'Áo khoác nữ')}</li>
                  </ul>
                </li>
                <li>
                  <span className="block font-medium text-black mb-2">Váy</span>
                  <ul className="pl-3 space-y-2 border-l border-gray-100">
                    <li>{renderCategoryLink('Ngắn', 'Váy ngắn nữ')}</li>
                    <li>{renderCategoryLink('Dài', 'Váy dài nữ')}</li>
                    <li>{renderCategoryLink('Body', 'Váy body nữ')}</li>
                  </ul>
                </li>
                <li>{renderCategoryLink('Quần', 'Quần nữ', true)}</li>
              </ul>
            </div>
            {/* Unisex Section */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center justify-between group cursor-pointer">UNISEX</h3>
              <ul className="space-y-3 pl-1 text-sm text-gray-600">
                <li>{renderCategoryLink('Áo thun', 'Áo thun unisex')}</li>
                <li>{renderCategoryLink('Hoodie', 'Hoodie unisex')}</li>
                <li>{renderCategoryLink('Áo khoác', 'Áo khoác unisex')}</li>
              </ul>
            </div>
            {/* Accessories & Shoes Section */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center justify-between group cursor-pointer">PHỤ KIỆN & GIÀY DÉP</h3>
              <ul className="space-y-4 pl-1 text-sm text-gray-600">
                <li>
                  <span className="block font-medium text-black mb-2">Giày dép</span>
                  <ul className="pl-3 space-y-2 border-l border-gray-100">
                    <li>{renderCategoryLink('Giày dép nam', 'Giày dép nam')}</li>
                    <li>{renderCategoryLink('Giày dép nữ', 'Giày dép nữ')}</li>
                    <li>{renderCategoryLink('Giày dép unisex', 'Giày dép unisex')}</li>
                  </ul>
                </li>
                <li>
                  <span className="block font-medium text-black mb-2">Phụ kiện Nam</span>
                  <ul className="pl-3 space-y-2 border-l border-gray-100">
                    <li>{renderCategoryLink('Mũ', 'Mũ nam')}</li>
                    <li>{renderCategoryLink('Thắt lưng', 'Thắt lưng nam')}</li>
                    <li>{renderCategoryLink('Ví', 'Ví nam')}</li>
                    <li>{renderCategoryLink('Kính', 'Kính nam')}</li>
                    <li>{renderCategoryLink('Trang sức', 'Trang sức nam')}</li>
                  </ul>
                </li>
                <li>
                  <span className="block font-medium text-black mb-2">Phụ kiện Nữ</span>
                  <ul className="pl-3 space-y-2 border-l border-gray-100">
                    <li>{renderCategoryLink('Túi xách', 'Túi xách nữ')}</li>
                    <li>{renderCategoryLink('Mũ', 'Mũ nữ')}</li>
                    <li>{renderCategoryLink('Kính', 'Kính nữ')}</li>
                    <li>{renderCategoryLink('Trang sức', 'Trang sức nữ')}</li>
                    <li>{renderCategoryLink('Khăn', 'Khăn nữ')}</li>
                  </ul>
                </li>
                <li>{renderCategoryLink('Phụ kiện unisex', 'Phụ kiện unisex')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Price Range — Shopee-style Input Fields */}
        <div className="filter-section">
          <h3>Khoảng giá</h3>

          {/* Min/Max Input Row */}
          <div className="price-inputs-row">
            <div className="price-input-wrapper">
              <input
                type="number"
                className="price-input"
                placeholder="Từ ₫"
                value={priceRange.min || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  setPriceRange({ ...priceRange, min: value });
                  setPriceError('');
                }}
              />
            </div>
            <span className="price-divider">—</span>
            <div className="price-input-wrapper">
              <input
                type="number"
                className="price-input"
                placeholder="Đến ₫"
                value={priceRange.max >= PRICE_MAX ? '' : priceRange.max}
                onChange={(e) => {
                  const value = e.target.value === '' ? PRICE_MAX : Number(e.target.value);
                  setPriceRange({ ...priceRange, max: value });
                  setPriceError('');
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {priceError && (
            <p className="price-error">{priceError}</p>
          )}

          {/* Apply Button */}
          <button className="price-apply-btn" onClick={handleApplyPrice}>
            Áp dụng
          </button>

          {/* Preset Chips */}
          <div className="price-presets">
            <p className="price-presets-label">Gợi ý:</p>
            <div className="price-presets-chips">
              {pricePresets.map((preset, index) => (
                <button
                  key={index}
                  className={`preset-chip ${priceRange.min === preset.min && priceRange.max === preset.max ? 'active' : ''
                    }`}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="filter-section">
          <h3>Đánh giá</h3>
          <div className="filter-options">
            {ratings.map((rating) => (
              <div key={rating} className="filter-option">
                <input
                  type="checkbox"
                  id={`${isMobile ? 'mobile-' : ''}rating-${rating}`}
                  className="custom-checkbox"
                  checked={selectedRating === rating}
                  onChange={() => handleRatingChange(rating)}
                />
                <label htmlFor={`${isMobile ? 'mobile-' : ''}rating-${rating}`} className="rating-option">
                  <span className="rating-stars">
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                  </span>

                </label>
              </div>
            ))}
          </div>

        </div>

        {/* Stock Filter */}

      </>
    );
  };

  return (
    <>
      <PageTitle title="Tất cả sản phẩm" />
      <Navbar />

      {/* Breadcrumb */}
      {/* <div className="breadcrumb-section">
        <div className="breadcrumb-container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span className="current">
              {keyword ? `Tìm kiếm: "${keyword}"` : 'Sản phẩm'}
            </span>
          </div>
        </div>
      </div> */}

      {/* Mobile Filter Button */}
      <div className="mobile-filter-bar">
        <div className="mobile-filter-container">
          <button
            className="mobile-filter-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="products-main">
        <div className="products-wrapper">
          <div className="products-layout">
            {/* Desktop Sidebar */}
            <aside className="desktop-filters">
              <div className="filters-sticky">
                <div className="filter-sidebar">
                  <div className="filter-header">
                    <h2>Bộ lọc</h2>
                    {activeFilterCount > 0 && (
                      <button className="clear-all-btn" onClick={handleClearAll}>
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                  {renderFilters(false)}
                </div>
              </div>
            </aside>

            {/* Mobile Drawer */}
            <div className={`mobile-drawer-overlay ${isMobileDrawerOpen ? '' : 'hidden'}`}>
              <div
                className={`drawer-backdrop ${isMobileDrawerOpen ? 'show' : ''}`}
                onClick={() => setIsMobileDrawerOpen(false)}
              />
              <div className={`mobile-drawer ${isMobileDrawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                  <h2>Bộ lọc</h2>
                  <button
                    className="close-drawer-btn"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    ×
                  </button>
                </div>
                {renderFilters(true)}
                <div className="drawer-actions">
                  <button className="drawer-clear-btn" onClick={handleClearAll}>
                    Xóa tất cả
                  </button>
                  <button
                    className="drawer-apply-btn"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>

            {/* Products Area */}
            <div className="products-content">
              {/* Toolbar */}
              <div className="products-toolbar">
                <div className="toolbar-top">


                  {/* Sort Dropdown */}
                  <div className="sort-section">
                    <label htmlFor="sort-select" className="sort-label">
                      Sắp xếp:
                    </label>
                    <select
                      id="sort-select"
                      className="sort-select"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="price_asc">Giá: Thấp đến Cao</option>
                      <option value="price_desc">Giá: Cao đến Thấp</option>
                      <option value="rating_desc">Đánh giá cao nhất</option>
                    </select>
                  </div>
                </div>

                {/* Result Count */}
                <p className="result-count">
                  Hiển thị {products.length} trong tổng số {productCount} sản phẩm
                </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="loading-skeleton">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              )}

              {/* Empty State & Recommendations */}
              {!loading && !hasResults && (
                <>
                  <NoProducts 
                    keyword={keyword} 
                    onResetFilters={handleClearAll} 
                  />
                  
                  <RelatedProductsSection 
                    products={relatedProducts} 
                    title="SẢN PHẨM LIÊN QUAN" 
                  />
                </>
              )}

              {/* Products Grid */}
              {!loading && products.length > 0 && (
                <>
                  <div className="products-grid">
                    {products.map((product) => (
                      <Product key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Products;
