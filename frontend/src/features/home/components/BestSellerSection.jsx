import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function BestSellerSection({ products = [] }) {
  // Logic: display top 3 or 6 products as best sellers
  const bestSellers = products.slice(0, 3);

  return (
    <section className="section-spacing bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex items-center justify-between mb-20">
          <div>
            <h2 className="text-[32px] md:text-[48px] font-black text-primary tracking-tighter mb-4">SÁCH ĐƯỢC YÊU THÍCH</h2>
          </div>
          <div className="hidden md:flex gap-4">
            <button className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-xl transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-xl transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {bestSellers.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-[32px] flex gap-8 items-center hover:shadow-2xl transition-all duration-500 group border border-transparent hover:border-slate-100"
            >
              <div className="w-32 h-40 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
                <img 
                  src={product.images?.[0]?.url || product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-1 text-orange-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className="material-symbols-outlined !text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <h3 className="text-[16px] font-bold text-primary mb-2 truncate group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
                <p className="text-accent font-black text-xl mb-4">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </p>
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary flex items-center gap-2 transition-all group-hover:translate-x-2">
                  Thêm vào giỏ <span className="material-symbols-outlined !text-[18px]">add</span>
                </button>
              </div>

              <Link to={`/product/${product._id}`} className="absolute inset-0 z-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BestSellerSection;