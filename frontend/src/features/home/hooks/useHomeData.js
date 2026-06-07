import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "@/shared/api/http.js";
import { getProduct, removeErrors } from "@/features/products/productSlice";

function getErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return error.message || "Unable to load homepage products";
}

function normalizeFlashSaleProduct(item) {
  const product = item.product || {};
  return {
    ...product,
    _id: product._id || item.productId,
    price: item.salePrice,
    originalPrice: item.originalPriceSnapshot,
    flashSale: item,
  };
}

function getFlashSalePhase(flashSale) {
  if (!flashSale) return null;

  if (flashSale.computedStatus) return flashSale.computedStatus;

  const now = new Date();
  const startAt = flashSale.startAt ? new Date(flashSale.startAt) : null;
  const endAt = flashSale.endAt ? new Date(flashSale.endAt) : null;

  if (startAt && now < startAt) return "scheduled";
  if (endAt && now <= endAt) return "active";
  return "ended";
}

export function useHomeData() {
  const dispatch = useDispatch();
  const { loading: productsLoading, error, products } = useSelector((state) => state.product);
  const [flashSale, setFlashSale] = useState(null);
  const [flashSaleLoading, setFlashSaleLoading] = useState(false);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [bestSellerLoading, setBestSellerLoading] = useState(false);

  useEffect(() => {
    dispatch(getProduct({ keyword: "", page: 1, sort: "newest" }));
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    setFlashSaleLoading(true);

    axios
      .get("/api/v1/flash-sales/active")
      .then(({ data }) => {
        if (!mounted) return;

        if (data.flashSale) {
          setFlashSale(data.flashSale);
          return;
        }

        axios
          .get("/api/v1/flash-sales/upcoming")
          .then(({ data: upcomingData }) => {
            if (mounted) setFlashSale(upcomingData.flashSales?.[0] || null);
          })
          .catch(() => {
            if (mounted) setFlashSale(null);
          });
      })
      .catch(() => {
        if (mounted) setFlashSale(null);
      })
      .finally(() => {
        if (mounted) setFlashSaleLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setBestSellerLoading(true);

    axios
      .get("/api/v1/products", {
        params: {
          page: 1,
          sort: "-sold,-ratings,-createdAt",
          stock: true,
          status: "available",
        },
      })
      .then(({ data }) => {
        if (mounted) setBestSellerProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch(() => {
        if (mounted) setBestSellerProducts([]);
      })
      .finally(() => {
        if (mounted) setBestSellerLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
    return (flashSale?.items || [])
      .filter((item) => item.availableStock > 0 && item.product)
      .map(normalizeFlashSaleProduct)
      .slice(0, 4);
  }, [flashSale]);

  const newArrivalProducts = useMemo(() => {
    return productList.slice(0, 8);
  }, [productList]);

  const fallbackBestSellers = useMemo(() => {
    return [...productList]
      .sort((a, b) => {
        const soldDelta = Number(b?.sold || 0) - Number(a?.sold || 0);
        if (soldDelta) return soldDelta;
        const ratingDelta = Number(b?.ratings || 0) - Number(a?.ratings || 0);
        if (ratingDelta) return ratingDelta;
        return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
      })
      .slice(0, 6);
  }, [productList]);

  const flashSalePhase = getFlashSalePhase(flashSale);
  const countdownTarget =
    flashSalePhase === "scheduled"
      ? flashSale?.startAt
      : flashSale?.endAt;

  return {
    loading: productsLoading || flashSaleLoading || bestSellerLoading,
    flashSale,
    flashSalePhase,
    flashSaleProducts,
    newArrivalProducts,
    bestSellerProducts: bestSellerProducts.length ? bestSellerProducts : fallbackBestSellers,
    saleEndsAt: countdownTarget ? new Date(countdownTarget) : null,
  };
}

export default useHomeData;
