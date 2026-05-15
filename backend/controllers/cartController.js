import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import {
  buildCartItemSnapshot,
  revalidateCartForUser,
} from "../services/flashSaleService.js";

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    cart = await Cart.create({ user_id: userId });
  }
  return cart;
};

const buildCartResponse = async (cart) => {
  const items = await CartItem.find({ cart_id: cart._id }).populate("product_id", "name price originalPrice images stock sold");
  return { ...cart.toObject(), items };
};

export const getCart = handleAsyncError(async (req, res) => {
  const cart = await findOrCreateCart(req.user.id);
  await revalidateCartForUser(req.user.id, { persist: true });
  const cartWithItems = await buildCartResponse(cart);

  res.status(200).json({
    success: true,
    cart: cartWithItems,
  });
});

export const syncCart = handleAsyncError(async (req, res, next) => {
  const { items } = req.body;
  const cart = await findOrCreateCart(req.user.id);

  if (items && Array.isArray(items) && items.length > 0) {
    await CartItem.deleteMany({ cart_id: cart._id });

    for (const item of items) {
      const productId = item.product_id || item.product;
      const snapshot = await buildCartItemSnapshot({
        productId,
        userId: req.user.id,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      });

      if (!snapshot.valid) {
        return next(new HandleError(snapshot.message || "Cart item is no longer valid", 400));
      }

      await CartItem.create({
        cart_id: cart._id,
        ...snapshot.cartItem,
      });
    }
  }

  const cartWithItems = await buildCartResponse(cart);
  res.status(200).json({
    success: true,
    cart: cartWithItems,
  });
});

export const updateCartItem = handleAsyncError(async (req, res, next) => {
  const productId = req.body.product_id || req.body.product;
  const { quantity, size, color, isUpdate } = req.body;

  if (!productId || !quantity) {
    return next(new HandleError("Missing product_id or quantity", 400));
  }

  const cart = await findOrCreateCart(req.user.id);
  const existingItem = await CartItem.findOne({
    cart_id: cart._id,
    product_id: productId,
    size: size || null,
    color: color || null,
  });

  const nextQuantity = existingItem && !isUpdate
    ? Number(existingItem.quantity || 0) + Number(quantity || 0)
    : Number(quantity || 0);

  const snapshot = await buildCartItemSnapshot({
    productId,
    userId: req.user.id,
    quantity: nextQuantity,
    size: size || null,
    color: color || null,
    strictFlashSaleItemId: existingItem?.pricingType === "flash_sale" ? existingItem.flashSaleItemId : null,
  });

  if (!snapshot.valid) {
    return next(new HandleError(snapshot.message || "Cart item is no longer valid", 400));
  }

  if (snapshot.cartItem.pricingType === "flash_sale" && snapshot.cartItem.flashSaleItemId) {
    const siblingQuery = {
      cart_id: cart._id,
      flashSaleItemId: snapshot.cartItem.flashSaleItemId,
    };
    if (existingItem?._id) siblingQuery._id = { $ne: existingItem._id };

    const siblingItems = await CartItem.find(siblingQuery);
    const siblingQuantity = siblingItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const perUserLimit = Number(snapshot.pricing?.perUserLimit || 1);
    const purchasedCount = Number(snapshot.pricing?.purchasedCount || 0);

    if (purchasedCount + siblingQuantity + nextQuantity > perUserLimit) {
      return next(new HandleError(
        `${snapshot.cartItem.name} vuot gioi han Flash Sale moi tai khoan`,
        400
      ));
    }
  }

  if (existingItem) {
    existingItem.set(snapshot.cartItem);
    await existingItem.save();
  } else {
    await CartItem.create({
      cart_id: cart._id,
      ...snapshot.cartItem,
    });
  }

  const cartWithItems = await buildCartResponse(cart);
  res.status(200).json({
    success: true,
    cart: cartWithItems,
  });
});

export const revalidateCart = handleAsyncError(async (req, res) => {
  const result = await revalidateCartForUser(req.user.id, { persist: true });
  const cartWithItems = result.cart ? await buildCartResponse(result.cart) : null;

  res.status(200).json({
    success: true,
    valid: result.valid,
    errors: result.errors,
    cart: cartWithItems,
  });
});

export const removeCartItem = handleAsyncError(async (req, res, next) => {
  const { productId } = req.params;
  const { size, color } = req.query;

  const cart = await Cart.findOne({ user_id: req.user.id });
  if (!cart) {
    return next(new HandleError("Cart not found", 404));
  }

  await CartItem.findOneAndDelete({
    cart_id: cart._id,
    product_id: productId,
    size: size || null,
    color: color || null,
  });

  const cartWithItems = await buildCartResponse(cart);
  res.status(200).json({
    success: true,
    cart: cartWithItems,
  });
});

export const clearCart = handleAsyncError(async (req, res) => {
  const cart = await Cart.findOne({ user_id: req.user.id });
  if (cart) {
    await CartItem.deleteMany({ cart_id: cart._id });
  }

  res.status(200).json({
    success: true,
    message: "Cart cleared",
  });
});
