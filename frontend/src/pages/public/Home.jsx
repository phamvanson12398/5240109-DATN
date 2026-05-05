import React, { useEffect } from 'react';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import Loader from '@/shared/components/Loader';
import PageTitle from '@/shared/components/PageTitle';

// New Components (Maison Style)
import HeroSection from '@/shared/components/HeroSection';
import CategoryGrid from '@/shared/components/CategoryGrid';
import NewArrivals from '@/shared/components/NewArrivals';

import { useDispatch, useSelector } from 'react-redux';
import { getProduct, removeErrors } from '@/features/products/productSlice';
import { toast } from 'react-toastify';

function Home() {
  const { loading, error, products, productCount } = useSelector((state) => state.product);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProduct({ keyword: "" }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || error, { position: 'top-center', autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  return (
    <>
      <PageTitle title="Trang chủ" />

      {/* 
               We wrap everything in a Fragment or div. 
               Note: Navbar and Footer are existing components. 
               We might need to check if they match the new style later, 
               but for now we keep them to maintain navigation functionality.
            */}
      <Navbar />

      {/* Main Content Area */}
      <main className="w-full min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">

        {/* Hero Section */}
        <HeroSection />

        {/* Shop By Category */}
        <CategoryGrid />

        {/* New Arrivals (Products) */}
        <NewArrivals products={products} loading={loading} />

      </main>

      <Footer />
    </>
  );
}

export default Home;