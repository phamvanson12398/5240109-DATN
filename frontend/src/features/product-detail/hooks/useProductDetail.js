import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getProductDetails, removeErrors } from '@/features/products/productSlice';
import { addItemsToCart, removeMessage } from '@/features/cart/cartSlice';

/** Color name → hex map. Can be moved to a config file later. */
export const COLOR_MAP = {
  'Đen': '#000000', 'Black': '#000000',
  'Trắng': '#ffffff', 'White': '#ffffff',
  'Xanh dương': '#3b82f6', 'Blue': '#3b82f6',
  'Đỏ': '#ef4444', 'Red': '#ef4444',
  'Tím': '#8b5cf6', 'Purple': '#8b5cf6',
  'Vàng': '#eab308', 'Yellow': '#eab308',
  'Xám': '#6b7280', 'Gray': '#6b7280',
  'Hồng': '#ec4899', 'Pink': '#ec4899',
  'Xanh lá': '#22c55e', 'Green': '#22c55e',
  'Cam': '#f97316', 'Orange': '#f97316',
  'Nâu': '#78350f', 'Brown': '#78350f',
  'Be': '#f5f5dc', 'Beige': '#f5f5dc',
  'Kem': '#fffdd0', 'Cream': '#fffdd0',
  'Xanh đen': '#0f172a', 'Navy': '#0f172a',
  'Xanh rêu': '#3f6212', 'Moss': '#3f6212',
  'Bạc': '#c0c0c0', 'Silver': '#c0c0c0',
};

/**
 * useProductDetail — encapsulates all business logic for the Product Detail page.
 * Keeps ProductDetailView as a pure layout/presentation component.
 */
export function useProductDetail() {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectionError, setSelectionError] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const { loading, error, product } = useSelector((s) => s.product);
  const { loading: cartLoading, error: cartError, success, message } = useSelector((s) => s.cart);
  const { isAuthenticated } = useSelector((s) => s.user);

  // ─── Data derivations ───────────────────────────────────────────────────────
  const productImages = product?.images?.length > 0
    ? product.images.map(img => img.url.replace('./', '/'))
    : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop'];

  const productColors = product?.colors?.length > 0
    ? product.colors.map(c => {
      const name = typeof c === 'string' ? c.replace(/[[\]"'\\]/g, '').trim() : String(c);
      return { name, code: COLOR_MAP[name] || '#cccccc' };
    })
    : [];

  const productSizes = product?.sizes?.length > 0
    ? product.sizes.map(s => {
      const name = typeof s === 'string' ? s.replace(/[[\]"'\\]/g, '').trim() : String(s);
      return { name, available: true };
    })
    : [];

  const originalPrice = product?.originalPrice || 0;
  const discountPercent = originalPrice > (product?.price || 0)
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  const soldCount = product?.sold || 0;
  const totalReviews = product?.numOfReviews || 0;
  const ratingDistribution = [
    { stars: 5, count: Math.round(totalReviews * 0.85) },
    { stars: 4, count: Math.round(totalReviews * 0.10) },
    { stars: 3, count: Math.round(totalReviews * 0.03) },
    { stars: 2, count: Math.round(totalReviews * 0.01) },
    { stars: 1, count: Math.round(totalReviews * 0.01) },
  ];

  // Mock related products — TODO: replace with real API
  const mockRelatedProducts = [
    {
      id: 1,
      name: 'Atomic Habits',
      price: 289000,
      originalPrice: 349000,
      image:
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop',
      badge: 'BEST SELLER',
    },

    {
      id: 2,
      name: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ',
      price: 95000,
      image:
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
    },

    {
      id: 3,
      name: 'Nhà Giả Kim',
      price: 129000,
      originalPrice: 169000,
      image:
        'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=300&fit=crop',
      badge: 'HOT',
    },

    {
      id: 4,
      name: 'The Psychology of Money',
      price: 315000,
      image:
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=300&fit=crop',
    },
  ];

  // ─── Side effects ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (id) dispatch(getProductDetails(id));
    return () => dispatch(removeErrors());
  }, [dispatch, id]);

  useEffect(() => {
    if (error) { toast.error(error, { position: 'top-center', autoClose: 3000 }); dispatch(removeErrors()); }
    if (cartError) { toast.error(cartError, { position: 'top-center', autoClose: 3000 }); }
  }, [dispatch, error, cartError]);

  useEffect(() => {
    if (success) { toast.success(message, { position: 'top-center', autoClose: 3000 }); dispatch(removeMessage()); }
  }, [dispatch, success, message]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const increaseQuantity = () => {
    if (product.stock <= quantity) {
      toast.error(`Số lượng không thể vượt quá ${product.stock}`, { position: 'top-center', autoClose: 3000 });
      return;
    }
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity <= 1) return;
    setQuantity(prev => prev - 1);
  };

  const validateSelection = () => {
    const invalid = (productColors.length > 0 && selectedColor === null)
      || (productSizes.length > 0 && selectedSize === null);
    if (invalid) setSelectionError(true);
    return !invalid;
  };

  const addToCart = () => {
    if (!validateSelection()) return;
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', { position: 'top-center', autoClose: 2500 });
      navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
      return;
    }
    setSelectionError(false);
    dispatch(addItemsToCart({
      id,
      quantity,
      size: selectedSize !== null ? productSizes[selectedSize]?.name : '',
      color: selectedColor !== null ? productColors[selectedColor]?.name : '',
    }));
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    setSelectionError(false);
    const buyNowItem = {
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      stock: product.stock,
      quantity,
      size: selectedSize !== null ? productSizes[selectedSize]?.name : '',
      color: selectedColor !== null ? productColors[selectedColor]?.name : '',
    };
    sessionStorage.setItem('directBuyItem', JSON.stringify(buyNowItem));
    dispatch(removeErrors());
    navigate(isAuthenticated ? '/shipping' : '/login?redirect=/shipping');
  };

  const handleColorSelect = (index) => {
    setSelectedColor(index);
    setSelectionError(false);
    if (index < productImages.length) setSelectedImage(index);
  };

  const handleSizeSelect = (index) => {
    if (productSizes[index]?.available) {
      setSelectedSize(index);
      setSelectionError(false);
    }
  };

  return {
    // state
    quantity, activeTab, setActiveTab,
    selectedImage, setSelectedImage,
    selectedColor, selectedSize, selectionError,
    // redux
    loading, error, product, cartLoading,
    // derived
    productImages, productColors, productSizes,
    originalPrice, discountPercent, soldCount,
    totalReviews, ratingDistribution, mockRelatedProducts,
    // handlers
    increaseQuantity, decreaseQuantity,
    addToCart, handleBuyNow,
    handleColorSelect, handleSizeSelect,
  };
}
