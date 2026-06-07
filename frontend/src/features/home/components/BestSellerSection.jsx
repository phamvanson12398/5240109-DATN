import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatVND } from "@/shared/utils/formatCurrency";

function BestSellerSection({ products = [], loading }) {
  const bestSellers = products.filter(Boolean).slice(0, 3);
  const MotionDiv = motion.div;

  if (!loading && bestSellers.length === 0) return null;

  return (
    <section className="section-spacing bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex items-center justify-between mb-20">
          <div>
            <h2 className="text-[32px] md:text-[48px] font-black text-primary tracking-tighter mb-4">
              SÁCH BÁN CHẠY
            </h2>
            <p className="text-slate-500 font-medium">
              Những cuốn sách được độc giả lựa chọn và mua nhiều nhất.
            </p>
          </div>

          <Link
            to="/products?sort=bestselling"
            className="hidden md:inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 hover:text-primary transition-colors"
          >
            Xem tất cả
            <span className="material-symbols-outlined !text-[18px]">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {loading ? (
            [...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-[32px] h-[208px] animate-pulse"
              />
            ))
          ) : (
            bestSellers.map((book, idx) => {
              const rating = Math.max(
                0,
                Math.min(5, Math.round(Number(book.ratings || 0)))
              );

              const sold = Number(book.sold || 0);
              const image =
                book.images?.[0]?.url ||
                book.image ||
                "/images/placeholder-book.jpg";

              return (
                <MotionDiv
                  key={book._id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/product/${book._id}`}
                    className="bg-white p-6 rounded-[32px] flex gap-8 items-center hover:shadow-2xl transition-all duration-500 group border border-transparent hover:border-slate-100 h-full"
                  >
                    <div className="w-32 h-40 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
                      <img
                        src={image}
                        alt={book.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow min-w-0">
                      <div
                        className="flex items-center gap-1 text-orange-400 mb-3"
                        aria-label={`${rating} sao`}
                      >
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`material-symbols-outlined !text-[16px] ${
                              i < rating ? "" : "text-slate-200"
                            }`}
                            style={{
                              fontVariationSettings:
                                i < rating ? "'FILL' 1" : "'FILL' 0",
                            }}
                          >
                            star
                          </span>
                        ))}
                      </div>

                      <h3 className="text-[16px] font-bold text-primary mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                        {book.name}
                      </h3>

                      {book.author && (
                        <p className="text-[13px] text-slate-500 font-medium mb-2 line-clamp-1">
                          Tác giả: {book.author}
                        </p>
                      )}

                      {book.publisher && (
                        <p className="text-[12px] text-slate-400 font-medium mb-3 line-clamp-1">
                          NXB: {book.publisher}
                        </p>
                      )}

                      <p className="text-accent font-black text-xl mb-3">
                        {formatVND(book.price)}
                      </p>

                      <div className="flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <span>Đã bán {sold}</span>
                        <span className="inline-flex items-center gap-1 group-hover:text-primary transition-colors">
                          Xem sách
                          <span className="material-symbols-outlined !text-[18px]">
                            arrow_forward
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </MotionDiv>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default BestSellerSection;