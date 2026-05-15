import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function CollectionBanner() {
  return (
    <section className="relative h-[500px] md:h-[650px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0 scale-110">
        <img 
          className="w-full h-full object-cover" 
          alt="Bộ sưu tập mùa hè" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJg5RvkO5X4OyUcDJ8JrbvEZwS35aPfWvdPyiqQKWP3ezlbHtFFg6ExzU3iYoDRhZvjfdDnzamjlaSysY844h46Jo13RKiUxm49aHfXbxhmVkSmAlhMYzciwt8FRkhusRy2-6u5qm57ePwFF7ouQ0XlqGG-P_xNjZLT_UI6IC-IfQu34485G10fUFMpUcRhULsGz3Vlzdt5IkxBBJzhz_7jEAWGwpcQW3v_I59PuWAFNpEg4X71cNkMXwwYKU53kIi_6OwkdSPOfwc"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <div className="relative z-10 max-w-[1440px] mx-auto px-8 w-full flex justify-end">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-xl glass-collection-box p-12 md:p-20 text-white"
        >
          <span className="block text-[10px] font-black uppercase tracking-[0.5em] mb-6 text-accent">Chọn lọc</span>
          <h2 className="text-[40px] md:text-[64px] font-black tracking-tighter leading-none mb-8">
            HƠI THỞ <br /> MÙA HÈ
          </h2>
          <p className="text-white/80 mb-10 leading-relaxed text-lg font-medium">
            Bộ sưu tập mùa hè với những chất liệu tự nhiên như lanh và lụa, giúp bạn luôn thoải mái và thời thượng trong những ngày nắng rực rỡ.
          </p>
          <Link to="/products" className="inline-block text-white font-black text-xs uppercase border-b-2 border-accent pb-1 hover:text-accent transition-all tracking-widest">
            Xem bộ sưu tập
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default CollectionBanner;
