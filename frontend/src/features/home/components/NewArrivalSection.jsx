import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function NewArrivalSection({ products = [], loading }) {
  const MotionH2 = motion.h2;
  const MotionP = motion.p;
  const MotionDiv = motion.div;

  return (
    <section className="section-spacing bg-white">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[40px] md:text-[56px] font-black text-primary tracking-tighter mb-6"
          >
            SÁCH MỚI PHÁT HÀNH
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-slate-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed"
          >
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
          {loading ? (
             [...Array(8)].map((_, i) => (
               <div key={i} className="bg-slate-50 rounded-3xl h-[500px] animate-pulse" />
             ))
          ) : (
            products.slice(0, 8).map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (idx % 4) * 0.1 }}
                viewport={{ once: true }}
                className="group editorial-card"
              >
                <div className="aspect-[3/4] mb-8 overflow-hidden bg-slate-50 rounded-[32px] relative shadow-sm group-hover:shadow-xl transition-all duration-700">
                  <img 
                    src={product.images?.[0]?.url || product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover editorial-image-zoom"
                  />
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                  
                  {/* Actions overlay */}
                  <div className="absolute inset-x-6 bottom-8 flex flex-col gap-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <button className="w-full bg-white text-primary py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all shadow-2xl">
                      <span className="material-symbols-outlined !text-[20px]">shopping_cart</span>
                      THÊM VÀO GIỎ
                    </button>
                  </div>
                  
                  <button className="absolute top-6 right-6 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 shadow-lg group/heart">
                    <span className="material-symbols-outlined !text-[24px] group-hover/heart:fill-1" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                  </button>

                  <Link to={`/product/${product._id}`} className="absolute inset-0" />
                </div>
                
                <div className="px-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Mới XB</p>
                  <h3 className="text-[17px] font-bold text-primary mb-3 leading-tight group-hover:text-accent transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xl font-black text-primary">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-24 text-center">
          <Link 
            to="/products" 
            className="inline-block border-2 border-primary px-16 py-5 text-xs font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all rounded-none"
          >
            Xem tất cả
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NewArrivalSection;
