import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getProduct, removeErrors } from "@/features/products/productSlice";
import { HOME_FLASH_SALE_END_TIME } from "@/features/home/constants/home.constants";

function getErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return error.message || "Unable to load homepage products";
}

function hasDiscount(product) {
  return Number(product?.originalPrice || 0) > Number(product?.price || 0);
}

function getDiscountPercent(product) {
  const originalPrice = Number(product?.originalPrice || 0);
  const price = Number(product?.price || 0);

  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}

function getSaleEndDate() {
  const endDate = new Date();
  endDate.setHours(HOME_FLASH_SALE_END_TIME.hour, HOME_FLASH_SALE_END_TIME.minute, 59, 999);

  if (endDate.getTime() <= Date.now()) {
    endDate.setDate(endDate.getDate() + 1);
  }

  return endDate;
}

export function useHomeData() {
  const dispatch = useDispatch();
  const { loading, error, products } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(getProduct({ keyword: "", page: 1, sort: "newest" }));
  }, [dispatch]);

  useEffect(() => {
    if (!error) return;

    toast.error(getErrorMessage(error), {
      position: "top-center",
      autoClose: 3000,
    });
    dispatch(removeErrors());
  }, [dispatch, error]);

  const productList = useMemo(() => {
    return Array.isArray(products) ? products.filter(Boolean) : [];
  }, [products]);

  const flashSaleProducts = useMemo(() => {
    const discountedProducts = productList
      .filter(hasDiscount)
      .sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));

    return (discountedProducts.length > 0 ? discountedProducts : productList).slice(0, 4);
  }, [productList]);

  const featuredProducts = useMemo(() => {
    return [...productList]
      .sort((a, b) => {
        const soldDelta = Number(b?.sold || 0) - Number(a?.sold || 0);
        if (soldDelta) return soldDelta;

        return Number(b?.ratings || 0) - Number(a?.ratings || 0);
      })
      .slice(0, 8);
  }, [productList]);

  const saleEndsAt = useMemo(() => getSaleEndDate(), []);

  return {
    loading,
    flashSaleProducts,
    featuredProducts,
    saleEndsAt,
  };
}

export default useHomeData;
