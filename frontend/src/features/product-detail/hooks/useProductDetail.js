import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getProductDetails, removeErrors } from "@/features/products/productSlice";
import { addItemsToCart, removeMessage } from "@/features/cart/cartSlice";
import axios from "@/shared/api/http.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=800&fit=crop";

export function useProductDetail() {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [flashSale, setFlashSale] = useState(null);
  const [reviews, setReviews] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const {
    loading,
    error,
    product,
    relatedProducts = [],
  } = useSelector((state) => state.product);
  
  const productState = useSelector((state) => state.product);
  console.log("productState =", productState);
  const {
    loading: cartLoading,
    error: cartError,
    success,
    message,
  } = useSelector((state) => state.cart);

  const { isAuthenticated } = useSelector((state) => state.user);

  const productImages =
    product?.images?.length > 0
      ? product.images.map((img) => img.url?.replace("./", "/"))
      : [FALLBACK_IMAGE];

  const originalPrice = product?.originalPrice || product?.price || 0;

  const currentPrice = flashSale?.salePrice ?? product?.price ?? 0;

  const discountPercent =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  const soldCount = product?.sold || 0;
  const maxAvailableQuantity = flashSale?.availableStock ?? product?.stock ?? 0;

  const totalReviews = reviews.length || product?.numOfReviews || 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => Number(review.rating) === stars).length,
  }));

  useEffect(() => {
    if (id) {
      dispatch(getProductDetails(id));
    }

    return () => {
      dispatch(removeErrors());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    axios
      .get(`/api/v1/reviews?id=${id}`)
      .then(({ data }) => {
        if (mounted) {
          setReviews(data.reviews || []);
        }
      })
      .catch(() => {
        if (mounted) {
          setReviews([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    axios
      .get(`/api/v1/products/${id}/flash-sale`)
      .then(({ data }) => {
        if (mounted) {
          setFlashSale(data.flashSale || null);
        }
      })
      .catch(() => {
        if (mounted) {
          setFlashSale(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-center",
        autoClose: 3000,
      });
      dispatch(removeErrors());
    }

    if (cartError) {
      toast.error(cartError, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [dispatch, error, cartError]);

  useEffect(() => {
    if (success) {
      toast.success(message || "Thêm vào giỏ hàng thành công", {
        position: "top-center",
        autoClose: 3000,
      });
      dispatch(removeMessage());
    }
  }, [dispatch, success, message]);

  const increaseQuantity = () => {
    if (maxAvailableQuantity <= 0) {
      toast.error("Sách hiện đã hết hàng", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (quantity >= maxAvailableQuantity) {
      toast.error(`Số lượng không thể vượt quá ${maxAvailableQuantity}`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => prev - 1);
  };

  const validateBookBeforeBuy = () => {
    if (!product?._id) {
      toast.error("Không tìm thấy thông tin sách", {
        position: "top-center",
        autoClose: 3000,
      });
      return false;
    }

    if (maxAvailableQuantity <= 0) {
      toast.error("Sách hiện đã hết hàng", {
        position: "top-center",
        autoClose: 3000,
      });
      return false;
    }

    if (quantity > maxAvailableQuantity) {
      toast.error(`Số lượng không thể vượt quá ${maxAvailableQuantity}`, {
        position: "top-center",
        autoClose: 3000,
      });
      return false;
    }

    return true;
  };

  const addToCart = () => {
    if (!validateBookBeforeBuy()) return;

    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm sách vào giỏ hàng", {
        position: "top-center",
        autoClose: 2500,
      });

      navigate(
        `/login?redirect=${encodeURIComponent(
          `${location.pathname}${location.search}`
        )}`
      );
      return;
    }

    dispatch(
      addItemsToCart({
        id,
        quantity,
      })
    );
  };

  const handleBuyNow = () => {
    if (!validateBookBeforeBuy()) return;

    const buyNowItem = {
      product: product._id,
      name: product.name,
      price: currentPrice,
      priceSnapshot: currentPrice,
      originalPriceSnapshot:
        flashSale?.originalPriceSnapshot ?? product.originalPrice ?? product.price,
      image: product.images?.[0]?.url,
      stock: maxAvailableQuantity,
      pricingType: flashSale ? "flash_sale" : "normal",
      flashSaleId: flashSale?.flashSaleId,
      flashSaleItemId: flashSale?._id,
      quantity,

      // Thông tin phù hợp web bán sách
      author: product.author || "",
      publisher: product.publisher || "",
      category: product.category || null,
    };

    sessionStorage.setItem("directBuyItem", JSON.stringify(buyNowItem));

    dispatch(removeErrors());

    navigate(isAuthenticated ? "/shipping" : "/login?redirect=/shipping");
  };

  return {
    quantity,
    activeTab,
    setActiveTab,
    selectedImage,
    setSelectedImage,

    loading,
    error,
    product,
    cartLoading,

    productImages,
    originalPrice,
    currentPrice,
    discountPercent,
    soldCount,
    flashSale,
    maxAvailableQuantity,
    totalReviews,
    ratingDistribution,
    reviews,
    relatedProducts,

    increaseQuantity,
    decreaseQuantity,
    addToCart,
    handleBuyNow,
  };
}