import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CATEGORY_IMAGES = {
  women: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop",
  men: "https://images.unsplash.com/photo-1516257984877-a03a01ec3ca3?q=80&w=1600&auto=format&fit=crop",
  dresses: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1600&auto=format&fit=crop",
  shoes: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1600&auto=format&fit=crop",
  bags: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1600&auto=format&fit=crop",
  accessories: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop",
};

function FeaturedCategories({ categories = [] }) {
  const displayCategories = categories.slice(0, 6);

  if (displayCategories.length === 0) return null;

  return (
    <section className="bg-[#FAFAFA] py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#E85D75]">
              Danh mục
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#111827] md:text-4xl">
              Danh mục nổi bật
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-[#111827] underline underline-offset-4 transition-colors hover:text-[#E85D75]"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {displayCategories.map((category, index) => (
            <motion.article
              key={category.id || category.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <Link
                to={category.to || "/products"}
                className="group block overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_12px_30px_rgba(17,24,39,0.04)]"
              >
                <div className="aspect-[4/5] overflow-hidden bg-[#F3F4F6]">
                  <img
                    src={category.image || CATEGORY_IMAGES[category.id] || CATEGORY_IMAGES.women}
                    alt={category.label}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-[#111827]">{category.label}</h3>
                  <p className="mt-1 text-xs text-[#6B7280]">Khám phá</p>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default React.memo(FeaturedCategories);
