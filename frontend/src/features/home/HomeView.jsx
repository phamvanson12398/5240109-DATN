import React from "react";
import Footer from "@/shared/components/Footer";
import Navbar from "@/shared/components/Navbar";
import PageTitle from "@/shared/components/PageTitle";
import HeroSection from "./components/HeroSection";
import HomeBenefits from "./components/HomeBenefits";
// import FeaturedCategories from "./components/FeaturedCategories";
import FlashSaleSection from "./components/FlashSaleSection";
import NewArrivalSection from "./components/NewArrivalSection";
// import CollectionBanner from "./components/CollectionBanner";
import BestSellerSection from "./components/BestSellerSection";
import HomeMobileBottomNav from "./components/HomeMobileBottomNav";
import useHomeData from "@/features/home/hooks/useHomeData";
import { HOME_BENEFITS, HOME_CATEGORIES } from "@/features/home/constants/home.constants";
import { motion } from "framer-motion";
import "./styles/home.css";

function HomeView() {
  const { loading, newArrivalProducts, bestSellerProducts, flashSaleProducts, saleEndsAt, flashSalePhase } = useHomeData();
  const MotionMain = motion.main;

  
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111827] selection:bg-[#E85D75]/20 overflow-x-hidden">
      <PageTitle title="GÓC SÁCH " />
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="pb-20 md:pb-0"
      >
        <HeroSection />

        <HomeBenefits benefits={HOME_BENEFITS} />

        {/* <FeaturedCategories categories={HOME_CATEGORIES} /> */}

        <FlashSaleSection
          products={flashSaleProducts}
          loading={loading}
          saleEndsAt={saleEndsAt}
          phase={flashSalePhase}
        />

        <NewArrivalSection
          products={newArrivalProducts}
          loading={loading}
        />

        {/* <CollectionBanner /> */}

        <BestSellerSection
          products={bestSellerProducts}
          loading={loading}
        />
      </motion.main>

      <Footer />
      <HomeMobileBottomNav />
    </div>
  );
}

export default HomeView;
