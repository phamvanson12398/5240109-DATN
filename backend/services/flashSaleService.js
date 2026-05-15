import mongoose from "mongoose";
import FlashSale from "../models/flashSaleModel.js";
import FlashSaleItem from "../models/flashSaleItemModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";
import Order from "../models/orderModel.js";

const toObjectId = (value) => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  const text = value.toString();
  return mongoose.Types.ObjectId.isValid(text) ? new mongoose.Types.ObjectId(text) : null;
};

export const getFlashSaleStatus = (campaign, now = new Date()) => {
  if (!campaign) return "none";
  if (campaign.status === "cancelled") return "cancelled";
  if (campaign.status === "draft") return "draft";
  if (now < new Date(campaign.startAt)) return "scheduled";
  if (now <= new Date(campaign.endAt)) return "active";
  return "ended";
};

export const serializeFlashSaleItem = (item, campaign, product = item.productId) => {
  const soldCount = Number(item.soldCount || 0);
  const reservedCount = Number(item.reservedCount || 0);
  const saleStock = Number(item.saleStock || 0);
  const availableStock = Math.max(0, saleStock - soldCount - reservedCount);

  return {
    _id: item._id,
    flashSaleId: item.flashSaleId,
    productId: item.productId?._id || item.productId,
    product,
    originalPriceSnapshot: item.originalPriceSnapshot,
    salePrice: item.salePrice,
    saleStock,
    soldCount,
    reservedCount,
    availableStock,
    perUserLimit: item.perUserLimit,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    campaignEndAt: campaign?.endAt,
    discountPercent: item.originalPriceSnapshot
      ? Math.round((1 - item.salePrice / item.originalPriceSnapshot) * 100)
      : 0,
  };
};

export const serializeFlashSale = async (campaign, { includeItems = true } = {}) => {
  if (!campaign) return null;
  const doc = campaign.toObject ? campaign.toObject() : campaign;
  const serialized = {
    ...doc,
    computedStatus: getFlashSaleStatus(campaign),
    serverTime: new Date(),
  };

  if (includeItems) {
    const items = await FlashSaleItem.find({ flashSaleId: campaign._id, isActive: true })
      .populate("productId", "name price originalPrice images stock sold category status")
      .sort({ sortOrder: 1, createdAt: -1 });

    serialized.items = items
      .filter((item) => item.productId)
      .map((item) => serializeFlashSaleItem(item, campaign, item.productId));
  }

  return serialized;
};

export const findActiveFlashSale = async (now = new Date()) => {
  return FlashSale.findOne({
    status: "scheduled",
    isVisible: true,
    startAt: { $lte: now },
    endAt: { $gte: now },
  }).sort({ priority: -1, startAt: 1 });
};

export const findActiveFlashSaleItemForProduct = async (productId, now = new Date()) => {
  const campaign = await findActiveFlashSale(now);
  if (!campaign) return null;

  const item = await FlashSaleItem.findOne({
    flashSaleId: campaign._id,
    productId,
    isActive: true,
  });

  if (!item) return null;
  return { campaign, item };
};

export const getUserFlashSalePurchaseCount = async (userId, flashSaleItemId) => {
  const userObjectId = toObjectId(userId);
  const itemObjectId = toObjectId(flashSaleItemId);
  if (!userObjectId || !itemObjectId) return 0;

  const result = await Order.aggregate([
    {
      $match: {
        user_id: userObjectId,
        orderStatus: { $ne: "Đã hủy" },
      },
    },
    { $unwind: "$orderItems" },
    { $match: { "orderItems.flashSaleItemId": itemObjectId } },
    { $group: { _id: null, total: { $sum: "$orderItems.quantity" } } },
  ]);

  return result[0]?.total || 0;
};

export const getPricingForProduct = async ({ product, userId, quantity = 1, strictFlashSaleItemId = null }) => {
  if (!product) {
    return { valid: false, message: "Product not found" };
  }

  if (product.status === "discontinued") {
    return { valid: false, message: "Product is no longer available" };
  }

  const requestedQuantity = Math.max(1, Number(quantity || 1));
  const active = await findActiveFlashSaleItemForProduct(product._id);

  if (!active) {
    if (strictFlashSaleItemId) {
      return {
        valid: false,
        message: "Flash Sale da het hieu luc. Vui long cap nhat gio hang.",
      };
    }

    if (Number(product.stock || 0) < requestedQuantity) {
      return {
        valid: false,
        message: `San pham ${product.name} khong du ton kho.`,
      };
    }

    return {
      valid: true,
      pricingType: "normal",
      price: Number(product.price || 0),
      priceSnapshot: Number(product.price || 0),
      originalPriceSnapshot: Number(product.originalPrice || product.price || 0),
      flashSaleId: null,
      flashSaleItemId: null,
      campaignEndAt: null,
      availableStock: Number(product.stock || 0),
    };
  }

  const { campaign, item } = active;
  if (strictFlashSaleItemId && item._id.toString() !== strictFlashSaleItemId.toString()) {
    return {
      valid: false,
      message: "Flash Sale trong gio hang da thay doi. Vui long cap nhat gio hang.",
    };
  }

  const availableStock = Number(item.saleStock || 0) - Number(item.soldCount || 0) - Number(item.reservedCount || 0);
  if (availableStock < requestedQuantity) {
    return {
      valid: false,
      message: `San pham ${product.name} da het suat Flash Sale.`,
    };
  }

  const purchased = await getUserFlashSalePurchaseCount(userId, item._id);
  if (purchased + requestedQuantity > Number(item.perUserLimit || 1)) {
    return {
      valid: false,
      message: `San pham ${product.name} vuot gioi han Flash Sale moi tai khoan.`,
    };
  }

  return {
    valid: true,
    pricingType: "flash_sale",
    price: Number(item.salePrice || 0),
    priceSnapshot: Number(item.salePrice || 0),
    originalPriceSnapshot: Number(item.originalPriceSnapshot || product.originalPrice || product.price || 0),
    flashSaleId: campaign._id,
    flashSaleItemId: item._id,
    campaignEndAt: campaign.endAt,
    availableStock,
    saleStock: item.saleStock,
    soldCount: item.soldCount,
    reservedCount: item.reservedCount,
    perUserLimit: item.perUserLimit,
    purchasedCount: purchased,
  };
};

export const buildCartItemSnapshot = async ({ productId, userId, quantity, size = null, color = null, strictFlashSaleItemId = null }) => {
  const product = await Product.findById(productId);
  const pricing = await getPricingForProduct({ product, userId, quantity, strictFlashSaleItemId });
  if (!pricing.valid) return pricing;

  return {
    valid: true,
    cartItem: {
      product_id: product._id,
      name: product.name,
      price: pricing.price,
      priceSnapshot: pricing.priceSnapshot,
      originalPriceSnapshot: pricing.originalPriceSnapshot,
      pricingType: pricing.pricingType,
      flashSaleId: pricing.flashSaleId,
      flashSaleItemId: pricing.flashSaleItemId,
      campaignEndAt: pricing.campaignEndAt,
      image: product.images?.[0]?.url || "",
      stock: pricing.availableStock,
      quantity: Math.max(1, Number(quantity || 1)),
      size: size || null,
      color: color || null,
    },
    pricing,
  };
};

export const revalidateCartForUser = async (userId, { persist = true } = {}) => {
  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) return { valid: true, cart: null, items: [], errors: [] };

  const items = await CartItem.find({ cart_id: cart._id });
  const updatedItems = [];
  const errors = [];
  const flashSaleQuantities = new Map();

  for (const item of items) {
    const result = await buildCartItemSnapshot({
      productId: item.product_id,
      userId,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      strictFlashSaleItemId: item.pricingType === "flash_sale" ? item.flashSaleItemId : null,
    });

    if (!result.valid) {
      errors.push({
        cartItemId: item._id,
        productId: item.product_id,
        message: result.message,
      });
      continue;
    }

    if (persist) {
      item.set(result.cartItem);
      await item.save();
    }
    updatedItems.push(item);

    if (result.cartItem.pricingType === "flash_sale" && result.cartItem.flashSaleItemId) {
      const key = result.cartItem.flashSaleItemId.toString();
      const current = flashSaleQuantities.get(key) || {
        quantity: 0,
        perUserLimit: Number(result.pricing?.perUserLimit || 1),
        productName: result.cartItem.name,
      };
      current.quantity += Number(result.cartItem.quantity || 0);
      flashSaleQuantities.set(key, current);
    }
  }

  for (const [flashSaleItemId, entry] of flashSaleQuantities.entries()) {
    const purchased = await getUserFlashSalePurchaseCount(userId, flashSaleItemId);
    if (purchased + entry.quantity > entry.perUserLimit) {
      errors.push({
        flashSaleItemId,
        message: `San pham ${entry.productName} vuot gioi han Flash Sale moi tai khoan.`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    cart,
    items: updatedItems,
    errors,
  };
};

export const buildOrderItemsFromSource = async ({ userId, sourceItems }) => {
  const normalized = [];
  const errors = [];
  const flashSaleQuantities = new Map();

  for (const source of sourceItems || []) {
    const rawProductId = source.product_id || source.product;
    const productId = rawProductId && typeof rawProductId === "object" ? rawProductId._id : rawProductId;
    const result = await buildCartItemSnapshot({
      productId,
      userId,
      quantity: source.quantity,
      strictFlashSaleItemId: source.pricingType === "flash_sale" ? source.flashSaleItemId : null,
    });

    if (!result.valid) {
      errors.push({ productId, message: result.message });
      continue;
    }

    normalized.push({
      product_id: result.cartItem.product_id,
      name: result.cartItem.name,
      price: result.cartItem.price,
      image: result.cartItem.image,
      quantity: result.cartItem.quantity,
      originalPriceSnapshot: result.cartItem.originalPriceSnapshot,
      finalPrice: result.cartItem.price,
      pricingType: result.cartItem.pricingType,
      flashSaleId: result.cartItem.flashSaleId,
      flashSaleItemId: result.cartItem.flashSaleItemId,
    });

    if (result.cartItem.pricingType === "flash_sale" && result.cartItem.flashSaleItemId) {
      const key = result.cartItem.flashSaleItemId.toString();
      const current = flashSaleQuantities.get(key) || {
        quantity: 0,
        perUserLimit: Number(result.pricing?.perUserLimit || 1),
        productName: result.cartItem.name,
      };
      current.quantity += Number(result.cartItem.quantity || 0);
      flashSaleQuantities.set(key, current);
    }
  }

  for (const [flashSaleItemId, entry] of flashSaleQuantities.entries()) {
    const purchased = await getUserFlashSalePurchaseCount(userId, flashSaleItemId);
    if (purchased + entry.quantity > entry.perUserLimit) {
      errors.push({
        flashSaleItemId,
        message: `San pham ${entry.productName} vuot gioi han Flash Sale moi tai khoan.`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    items: normalized,
    errors,
    hasFlashSale: normalized.some((item) => item.pricingType === "flash_sale"),
  };
};

const applyFlashSaleItemInc = async (orderItems, incFactory) => {
  const applied = [];

  try {
    for (const item of orderItems) {
      if (item.pricingType !== "flash_sale" || !item.flashSaleItemId) continue;

      const quantity = Number(item.quantity || 0);
      const update = incFactory(quantity);
      const updated = await FlashSaleItem.findOneAndUpdate(
        {
          _id: item.flashSaleItemId,
          isActive: true,
          $expr: {
            $lte: [
              { $add: ["$soldCount", "$reservedCount", quantity] },
              "$saleStock",
            ],
          },
        },
        update,
        { new: true }
      );

      if (!updated) {
        throw new Error(`Flash Sale da het suat cho san pham ${item.name}`);
      }

      applied.push({ item, update });
    }
  } catch (error) {
    for (const entry of applied.reverse()) {
      const rollback = {};
      Object.entries(entry.update.$inc || {}).forEach(([key, value]) => {
        rollback[key] = -value;
      });
      if (Object.keys(rollback).length) {
        await FlashSaleItem.findByIdAndUpdate(entry.item.flashSaleItemId, { $inc: rollback });
      }
    }
    throw error;
  }
};

export const reserveFlashSaleItems = async (orderItems) => {
  await applyFlashSaleItemInc(orderItems, (quantity) => ({ $inc: { reservedCount: quantity } }));
};

export const sellFlashSaleItems = async (orderItems) => {
  await applyFlashSaleItemInc(orderItems, (quantity) => ({ $inc: { soldCount: quantity } }));
};

export const commitReservedFlashSaleOrder = async (order) => {
  if (!order || order.flashSaleReservationStatus !== "reserved") return;

  for (const item of order.orderItems || []) {
    if (item.pricingType !== "flash_sale" || !item.flashSaleItemId) continue;
    const quantity = Number(item.quantity || 0);
    await FlashSaleItem.findOneAndUpdate(
      {
        _id: item.flashSaleItemId,
        reservedCount: { $gte: quantity },
      },
      { $inc: { reservedCount: -quantity, soldCount: quantity } }
    );
  }

  order.flashSaleReservationStatus = "committed";
};

export const releaseFlashSaleOrder = async (order) => {
  if (!order || !["reserved", "committed"].includes(order.flashSaleReservationStatus)) return;

  const field = order.flashSaleReservationStatus === "reserved" ? "reservedCount" : "soldCount";
  for (const item of order.orderItems || []) {
    if (item.pricingType !== "flash_sale" || !item.flashSaleItemId) continue;
    const quantity = Number(item.quantity || 0);
    await FlashSaleItem.findOneAndUpdate(
      {
        _id: item.flashSaleItemId,
        [field]: { $gte: quantity },
      },
      { $inc: { [field]: -quantity } }
    );
  }

  order.flashSaleReservationStatus = "released";
};
