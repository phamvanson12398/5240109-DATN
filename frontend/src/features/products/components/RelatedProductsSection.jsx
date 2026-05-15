import React from "react";
import ProductCard from "./ProductCard";

function RelatedProductsSection({ products, title = "Sản phẩm liên quan" }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mt-14 border-t border-[#E5E7EB] pt-10">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Một vài đầu sách nổi bật dành riêng cho bạn.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default React.memo(RelatedProductsSection);
