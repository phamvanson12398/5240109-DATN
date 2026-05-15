import React from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { formatVND } from "@/shared/utils/formatCurrency";
import useCountdown from "@/features/home/hooks/useCountdown";

function CountdownItem({ value }) {
  return (
    <span className="inline-flex h-6 min-w-8 items-center justify-center rounded bg-[#FF7A2F] px-2 text-[11px] font-semibold text-white">
      {value}
    </span>
  );
}

function getDiscountPercent(product) {
  const originalPrice = Number(product?.originalPrice || 0);
  const price = Number(product?.price || 0);

  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}

function getCategoryLabel(category) {
  if (!category) return "Bộ sưu tập";
  if (typeof category === "string") return category;
  return category.level3 || category.level2 || category.level1 || category.name || "Bộ sưu tập";
}

function getSaleProgress(product) {
  const sold = Number(product?.sold || 0);
  const stock = Number(product?.stock || 0);
  const total = sold + stock;

  if (total <= 0) {
    return {
      label: "Đang mở bán",
      percent: 36,
    };
  }

  const percent = Math.min(Math.round((sold / total) * 100), 100);

  return {
    label: percent >= 90 ? "Sắp hết hàng" : `Đã bán ${percent}%`,
    percent,
  };
}

function FlashSaleProductCard({ product }) {
  const discountPercent = getDiscountPercent(product);
  const image = product.images?.[0]?.url || product.image || "/images/placeholder-product.jpg";
  const progress = getSaleProgress(product);
  const hasOriginalPrice = Number(product.originalPrice) > Number(product.price);

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-[0_12px_34px_rgba(17,24,39,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(17,24,39,0.09)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F6F7]">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-[#FF4D5D] px-2.5 py-1 text-[10px] font-bold text-white">
            {discountPercent > 0 ? `-${discountPercent}%` : "ƯU ĐÃI"}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="mb-2 truncate text-[10px] font-medium uppercase tracking-[0.16em] text-[#9CA3AF]">
          {getCategoryLabel(product.category)}
        </p>
        <h3 className="line-clamp-2 min-h-[40px] text-sm font-medium leading-5 text-[#111827] transition group-hover:text-[#FF7A2F]">
          {product.name}
        </h3>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-bold text-[#FF7A2F] sm:text-base">
            {formatVND(product.price)}
          </span>
          {hasOriginalPrice && (
            <span className="text-[11px] font-medium text-[#9CA3AF] line-through">
              {formatVND(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="mt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF0F3]">
            <div
              className="h-full rounded-full bg-[#FF7A2F]"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
            {progress.label}
          </p>
        </div>
      </div>
    </Link>
  );
}

function FlashSaleSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_12px_34px_rgba(17,24,39,0.05)]">
      <div className="aspect-[4/5] animate-pulse bg-[#EEF0F3]" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded-full bg-[#F3F4F6]" />
        <div className="h-4 w-full animate-pulse rounded-full bg-[#F3F4F6]" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#F3F4F6]" />
        <div className="h-1.5 w-full animate-pulse rounded-full bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

function FlashSaleSection({ products = [], loading, saleEndsAt }) {
  const countdown = useCountdown(saleEndsAt);

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-[#F7F2EE] py-14 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2 text-[#111827]">
              <Zap size={14} fill="#FF7A2F" className="text-[#FF7A2F]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Flash sale
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-[#6B7280]">
                Kết thúc trong:
              </span>
              <CountdownItem value={countdown.hours} />
              <span className="text-xs font-semibold text-[#FF7A2F]">:</span>
              <CountdownItem value={countdown.minutes} />
              <span className="text-xs font-semibold text-[#FF7A2F]">:</span>
              <CountdownItem value={countdown.seconds} />
            </div>
          </div>

          <Link
            to="/products"
            className="inline-flex h-10 w-fit items-center justify-center rounded-lg bg-[#FF7A2F] px-5 text-xs font-semibold text-white transition hover:bg-[#f16920]"
          >
            Xem tất cả khuyến mãi
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <FlashSaleSkeleton key={index} />
              ))
            : products.slice(0, 4).map((product) => (
                <FlashSaleProductCard key={product._id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
}

export default FlashSaleSection;
