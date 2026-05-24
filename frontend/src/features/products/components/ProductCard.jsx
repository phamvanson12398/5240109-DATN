import React from "react";
import { Link } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import { formatVND } from "@/shared/utils/formatCurrency";
import ProductColorDots from "./ProductColorDots";

function ProductCard({ product }) {
  const hasOriginalPrice =
    Number(product.originalPrice) > 0 && Number(product.originalPrice) > Number(product.price);
  const discountPercent = hasOriginalPrice
    ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
    : 0;
  const isNew =
    product.createdAt &&
    Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7;
  const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;
  const ratingValue =
    product.ratings !== undefined && product.ratings !== null ? Number(product.ratings) : null;

  return (
    <article className="editorial-card group">
      <Link to={`/product/${product._id}`} className="block">
        <div className="editorial-image-container mb-4">
          <img
            src={product.images?.[0]?.url || "/images/placeholder-product.jpg"}
            alt={product.name}
            className="editorial-image"
            loading="lazy"
          />

          <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
            {isOutOfStock ? (
              <span className="rounded-full bg-[#111827]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Hết hàng
              </span>
            ) : (
              <>
                {discountPercent > 0 && (
                  <span className="rounded-full bg-[#E85D75] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                    -{discountPercent}%
                  </span>
                )}
                {isNew && (
                  <span className="rounded-full border border-[#E5E7EB] bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111827]">
                    Mới
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-[11px] font-medium uppercase tracking-[0.14em] text-[#6B7280]">
              {product.brand || "GÓC SÁCH"}
            </span>

            {ratingValue !== null && !Number.isNaN(ratingValue) && (
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#6B7280]">
                <StarIcon className="!text-[14px] text-[#F59E0B]" />
                {ratingValue.toFixed(1)}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-[#111827] transition group-hover:text-[#E85D75]">
            {product.name}
          </h3>

          <div className="flex flex-wrap items-baseline gap-2">
            <span className={`text-base font-semibold ${hasOriginalPrice ? "text-[#E85D75]" : "text-[#111827]"}`}>
              {formatVND(product.price)}
            </span>
            {hasOriginalPrice && (
              <span className="text-xs font-medium text-[#6B7280] line-through">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          <ProductColorDots colors={product.colors} />
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
