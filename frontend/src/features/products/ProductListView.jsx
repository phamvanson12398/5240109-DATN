import React from "react";

import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import ProductSideNav from "./components/ProductSideNav";
import ProductToolbar from "./components/ProductToolbar";
import ProductGrid from "./components/ProductGrid";
import ProductLoadingGrid from "./components/ProductLoadingGrid";
import ProductEmptyState from "./components/ProductEmptyState";
import ProductPagination from "./components/ProductPagination";
import ActiveFilterChips from "./components/ActiveFilterChips";
import MobileFilterDrawer from "./components/MobileFilterDrawer";

import { PRICE_MAX, PRICE_MIN } from "@/features/products/constants/productFilters.constants";
import useProductsPage from "./hooks/useProductsPage";
import "./styles/Products.css";

function ProductListView() {
  const listing = useProductsPage();

  const filterProps = {
    handleApplyPrice: listing.handleApplyPrice,
    handleCategoryToggle: listing.handleCategoryToggle,
    handlePresetClick: listing.handlePresetClick,
    handleRatingChange: listing.handleRatingChange,
    priceError: listing.priceError,
    priceRange: listing.priceRange,
    selectedCategories: listing.selectedCategories,
    selectedRating: listing.selectedRating,
    setPriceError: listing.setPriceError,
    setPriceRange: listing.setPriceRange,
  };

  const clearPrice = () => {
    if (listing.handleClearPrice) {
      listing.handleClearPrice();
      return;
    }

    listing.setPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
  };

  return (
    <div className="products-page-container min-h-screen bg-[#FAFAFA] text-[#111827]">
      <Navbar />

      <main className="mx-auto max-w-[1280px] px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <ProductToolbar
          productCount={listing.productCount}
          keyword={listing.keyword}
          sortBy={listing.sortBy}
          onSortChange={listing.handleSortChange}
          onOpenMobileFilter={() => listing.setIsMobileDrawerOpen(true)}
        />

        <ActiveFilterChips
          selectedCategories={listing.selectedCategories}
          keyword={listing.keyword}
          priceRange={listing.priceRange}
          onCategoryToggle={listing.handleCategoryToggle}
          onClearKeyword={listing.handleClearAll} // Simplify for now
          onClearPrice={clearPrice}
          onClearAll={listing.handleClearAll}
        />

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <ProductSideNav
            {...filterProps}
            onCategoryToggle={listing.handleCategoryToggle}
          />

          <div className="min-w-0 flex-1">
            {listing.loading ? (
              <div>
                <ProductLoadingGrid count={9} />
              </div>
            ) : listing.products && listing.products.length > 0 ? (
              <div className="space-y-12">
                <ProductGrid products={listing.products} />

                <div className="product-pagination-container">
                  <ProductPagination
                    currentPage={listing.currentPage}
                    resultPerPage={listing.resultPerPage}
                    totalItems={listing.productCount}
                    onPageChange={listing.handlePageChange}
                  />
                </div>
              </div>
            ) : (
              <div>
                <ProductEmptyState
                  keyword={listing.keyword}
                  onResetFilters={listing.handleClearAll}
                  relatedProducts={listing.relatedProducts}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileFilterDrawer
        isOpen={listing.isMobileDrawerOpen}
        onClose={() => listing.setIsMobileDrawerOpen(false)}
        filterProps={filterProps}
        activeFilterCount={listing.activeFilterCount}
        onClearAll={listing.handleClearAll}
      />

      <Footer />
    </div>
  );
}

export default ProductListView;
