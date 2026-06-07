import React from "react";
import { Link } from "react-router-dom";
import { formatVND } from "@/shared/utils/formatCurrency";

const NEW_PRODUCT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const HOT_PRODUCT_SOLD_THRESHOLD = 20;
const PLACEHOLDER_IMAGE = "/images/placeholder-product.jpg";

const getProductId = (item) => item?._id || item?.id;

const getProductImage = (item) =>
  item?.images?.[0]?.url || item?.image || PLACEHOLDER_IMAGE;

const getProductBadge = (item) => {
  const createdAt = item?.createdAt ? new Date(item.createdAt).getTime() : null;

  if (createdAt && !Number.isNaN(createdAt) && Date.now() - createdAt < NEW_PRODUCT_WINDOW_MS) {
    return { label: "Mới", tone: "new" };
  }

  if (Number(item?.sold || 0) >= HOT_PRODUCT_SOLD_THRESHOLD) {
    return { label: "Hot", tone: "hot" };
  }

  return null;
};

function RelatedProducts({ items = [] }) {
  const products = items.filter((item) => Boolean(getProductId(item)));
  console.log("dai",products.length,"item:",items);
  
  if (products.length === 0) return null;

  return (
    <div className="related-section">
      <h2>Sản phẩm liên quan</h2>
      <div className="related-grid">
        {products.map((item) => {
          const productId = getProductId(item);
          const badge = getProductBadge(item);
          const currentPrice = Number(item?.price || 0);
          const originalPrice = Number(item?.originalPrice || 0);
          const hasOriginalPrice = originalPrice > currentPrice;

          return (
            <Link to={`/product/${productId}`} className="related-card" key={productId}>
              <div className="related-card-image">
                {badge && (
                  <span className={`related-badge ${badge.tone}`}>{badge.label}</span>
                )}
                <img src={getProductImage(item)} alt={item.name} loading="lazy" />
              </div>
              <div className="related-card-info">
                <div className="related-card-name">{item.name}</div>
                <div className="related-card-price">
                  <span className="current">{formatVND(currentPrice)}</span>
                  {hasOriginalPrice && (
                    <span className="original">{formatVND(originalPrice)}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default RelatedProducts;
