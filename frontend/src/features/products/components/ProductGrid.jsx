import React from "react";
import ProductCard from "./ProductCard";

function ProductGrid({ products }) {
  return (
    <div className="product-grid-custom grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
