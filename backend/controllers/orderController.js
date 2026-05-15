import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Address from "../models/addressModel.js";
import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";
import Voucher from "../models/voucherModel.js";
import Notification from "../models/notificationModel.js";
import HandleError from "../utils/handleError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";
import { sendStatusEmail } from "../services/emailService.js";
import { validateVoucher } from "../utils/voucherValidator.js";
import { createUniqueTrackingCode, normalizeTrackingCode } from "../utils/trackingCode.js";
import {
  buildOrderItemsFromSource,
  releaseFlashSaleOrder,
  reserveFlashSaleItems,
  sellFlashSaleItems,
} from "../services/flashSaleService.js";

const ORDER_PENDING = "Chờ xử lý";
const ORDER_SHIPPING = "Đang giao";
const ORDER_DELIVERED = "Đã giao";
const ORDER_CANCELLED = "Đã hủy";

const generateOrderCode = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  let code = "";
  let isUnique = false;

  while (!isUnique) {
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    code = `TB-${dateStr}-${randomStr}`;
    isUnique = !(await Order.exists({ orderCode: code }));
  }

  return code;
};

const normalizeShippingAddress = (source = {}) => ({
  fullName: source.fullName || source.name || "",
  phone: String(source.phone || source.phoneNo || source.phoneNumber || ""),
  province: source.province || source.state || source.provinceName || "",
  district: source.district || source.city || source.districtName || "",
  ward: source.ward || source.wardName || "",
  streetAddress: source.streetAddress || source.address || "",
  addressLabel: source.addressLabel || "Khac",
  provinceCode: source.provinceCode || "",
  districtCode: source.districtCode || "",
  wardCode: source.wardCode || "",
});

const isAdmin = (user) => {
  return user.role === "admin" || user.role_id?.name === "admin";
};

const getOrderSourceItems = async (req) => {
  if (Array.isArray(req.body.orderItems) && req.body.orderItems.length > 0) {
    return { source: "payload", items: req.body.orderItems };
  }

  const cart = await Cart.findOne({ user_id: req.user.id });
  if (!cart) return { source: "cart", items: [] };

  const cartItems = await CartItem.find({ cart_id: cart._id });
  return { source: "cart", cart, items: cartItems };
};

const clearPurchasedCartItems = async ({ userId, orderItems }) => {
  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) return;

  for (const item of orderItems) {
    await CartItem.findOneAndDelete({
      cart_id: cart._id,
      product_id: item.product_id,
      size: item.size || null,
      color: item.color || null,
    });
  }
};

const calculateTax = (itemsPrice) => Math.round(Number(itemsPrice || 0) * 0.1);
const calculateShipping = (itemsPrice) => (Number(itemsPrice || 0) >= 500000 ? 0 : 30000);

export const createNewOrder = handleAsyncError(async (req, res, next) => {
  const {
    address_id,
    shippingInfo,
    saveAddress,
    paymentMethod,
    voucher_id,
  } = req.body;

  let finalShippingInfo = {};

  if (address_id) {
    const savedAddress = await Address.findById(address_id);
    if (!savedAddress) return next(new HandleError("Dia chi da chon khong ton tai", 404));
    if (savedAddress.user_id.toString() !== req.user.id.toString()) {
      return next(new HandleError("Ban khong co quyen su dung dia chi nay", 403));
    }
    finalShippingInfo = normalizeShippingAddress(savedAddress);
  } else if (shippingInfo) {
    finalShippingInfo = normalizeShippingAddress(shippingInfo);
    const requiredFields = ["fullName", "phone", "province", "district", "ward", "streetAddress"];
    for (const field of requiredFields) {
      if (!finalShippingInfo[field]) {
        return next(new HandleError(`Vui long cung cap day du: ${field}`, 400));
      }
    }

    if (saveAddress === true) {
      const addressCount = await Address.countDocuments({ user_id: req.user.id });
      await Address.create({
        user_id: req.user.id,
        ...finalShippingInfo,
        isDefault: addressCount === 0,
      });
    }
  } else {
    return next(new HandleError("Vui long cung cap dia chi giao hang", 400));
  }

  const source = await getOrderSourceItems(req);
  if (!source.items.length) {
    return next(new HandleError("Gio hang dang trong", 400));
  }

  const orderItemResult = await buildOrderItemsFromSource({
    userId: req.user.id,
    sourceItems: source.items,
  });

  if (!orderItemResult.valid) {
    return res.status(409).json({
      success: false,
      message: "Gio hang can duoc cap nhat truoc khi dat hang",
      errors: orderItemResult.errors,
    });
  }

  if (orderItemResult.hasFlashSale && voucher_id) {
    return next(new HandleError("Flash Sale khong ap dung dong thoi voi voucher trong phien ban MVP", 400));
  }
  // console.log(orderItemResult);
  
  const itemsPrice = orderItemResult.items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  
  
  const taxPrice = calculateTax(itemsPrice);
  const shippingPrice = calculateShipping(itemsPrice);

  let serverDiscountAmount = 0;
  const serverVoucherInfo = {};

  if (voucher_id) {
    const voucher = await Voucher.findById(voucher_id);
    if (!voucher) return next(new HandleError("Ma giam gia khong ton tai", 404));

    const validation = await validateVoucher(voucher, req.user, itemsPrice);
    if (!validation.isValid) {
      return next(new HandleError(validation.message || "Ma giam gia da het hieu luc", 400));
    }

    serverDiscountAmount = validation.discount;
    serverVoucherInfo.voucher_id = voucher._id;
    serverVoucherInfo.voucherCode = voucher.code;
    serverVoucherInfo.voucherType = voucher.discount.type;
    serverVoucherInfo.voucherValue = voucher.discount.value;
  }

  const normalizedPaymentMethod = paymentMethod || req.body.paymentInfo?.method || "COD";
  const flashSaleReservationStatus = orderItemResult.hasFlashSale
    ? (normalizedPaymentMethod === "VNPAY" ? "reserved" : "committed")
    : "none";

  let order;
  try {
    if (orderItemResult.hasFlashSale) {
      if (normalizedPaymentMethod === "VNPAY") {
        await reserveFlashSaleItems(orderItemResult.items);
      } else {
        await sellFlashSaleItems(orderItemResult.items);
      }
    }

    order = await Order.create({
      shippingInfo: finalShippingInfo,
      orderItems: orderItemResult.items,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: "Pending",
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountAmount: serverDiscountAmount,
      user_id: req.user._id,
      orderCode: await generateOrderCode(),
      orderStatus: ORDER_PENDING,
      isPaid: false,
      flashSaleReservationStatus,
      ...serverVoucherInfo,
    });

    if (serverVoucherInfo.voucher_id) {
      await Voucher.findByIdAndUpdate(serverVoucherInfo.voucher_id, { $inc: { usedCount: 1 } });
    }

    if (normalizedPaymentMethod !== "VNPAY") {
      await clearPurchasedCartItems({ userId: req.user.id, orderItems: orderItemResult.items });
    }
  } catch (error) {
    if (orderItemResult.hasFlashSale) {
      await releaseFlashSaleOrder({
        orderItems: orderItemResult.items,
        flashSaleReservationStatus,
      });
    }
    return next(error);
  }

  res.status(200).json({
    success: true,
    orderId: order._id,
    order,
  });
});

export const getSingleOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user_id", "name email");
  if (!order) return next(new HandleError("Khong tim thay don hang", 404));

  if (!isAdmin(req.user) && order.user_id?._id?.toString() !== req.user.id.toString()) {
    return next(new HandleError("Ban khong co quyen truy cap don hang nay", 403));
  }

  res.status(200).json({ success: true, order });
});

export const allMyOrder = handleAsyncError(async (req, res) => {
  const orders = await Order.find({ user_id: req.user.id }).populate("user_id", "name email");
  res.status(200).json({ success: true, orders });
});

export const getAllOrder = handleAsyncError(async (req, res) => {
  const orders = await Order.find().populate("user_id", "name email");
  const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  res.status(200).json({ success: true, orders, totalAmount });
});

export const generateAdminTrackingCode = handleAsyncError(async (req, res) => {
  const existingTrackingCodes = await Order.distinct("trackingNumber", {
    trackingNumber: { $exists: true, $nin: [null, ""] },
  });

  res.status(200).json({
    success: true,
    trackingCode: createUniqueTrackingCode(existingTrackingCodes),
  });
});

export const updateOrderStauts = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user_id", "name email");
  if (!order) return next(new HandleError("Khong tim thay don hang", 404));

  const previousStatus = order.orderStatus;
  const newStatus = req.body.status;
  const { trackingNumber, cancellationReason } = req.body;
  const normalizedTrackingNumber = normalizeTrackingCode(trackingNumber);

  const allowed = [ORDER_PENDING, ORDER_SHIPPING, ORDER_DELIVERED, ORDER_CANCELLED];
  if (!allowed.includes(newStatus)) {
    return next(new HandleError("Trang thai khong hop le", 400));
  }

  if (newStatus === ORDER_SHIPPING && !normalizedTrackingNumber && !order.trackingNumber) {
    return next(new HandleError("Vui long cung cap ma van don hop le", 400));
  }

  if (normalizedTrackingNumber) {
    const duplicateOrder = await Order.findOne({
      _id: { $ne: order._id },
      trackingNumber: normalizedTrackingNumber,
    }).select("_id");

    if (duplicateOrder) {
      return next(new HandleError("Ma van don da ton tai. Vui long tao ma khac.", 400));
    }
  }

  if (previousStatus === ORDER_DELIVERED) {
    return next(new HandleError("Don hang da giao, khong the cap nhat nua", 400));
  }

  if (newStatus === ORDER_SHIPPING && previousStatus !== ORDER_SHIPPING) {
    await Promise.all(order.orderItems.map((item) => updateQuantity(item.product_id, item.quantity)));
  }

  if (newStatus === ORDER_CANCELLED && previousStatus !== ORDER_CANCELLED) {
    if (previousStatus === ORDER_SHIPPING) {
      for (const item of order.orderItems) {
        await updateQuantity(item.product_id, -item.quantity);
      }
    }
    await releaseFlashSaleOrder(order);
    if (order.voucher_id) {
      await Voucher.findByIdAndUpdate(order.voucher_id, { $inc: { usedCount: -1 } });
    }
    order.cancelledAt = Date.now();
    order.cancelledBy = req.user._id;
  }

  order.orderStatus = newStatus;
  if (normalizedTrackingNumber) order.trackingNumber = normalizedTrackingNumber;
  if (cancellationReason) order.cancellationReason = cancellationReason;

  if (newStatus === ORDER_DELIVERED) {
    order.deliveredAt = Date.now();
    if (order.paymentMethod === "COD" && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentStatus = "Paid";
    }
  }

  await order.save({ validateBeforeSave: false });
  sendStatusEmail(order, newStatus);

  if (order.user_id) {
    await Notification.create({
      userId: order.user_id._id || order.user_id,
      title: `Cap nhat don hang ${order.orderCode}`,
      message: `Don hang #${order.orderCode} da chuyen sang trang thai: ${newStatus}`,
      type: "order",
      link: "/orders/user",
    });
  }

  res.status(200).json({ success: true, order });
});

async function updateQuantity(id, quantity) {
  const product = await Product.findById(id);
  if (!product) return;
  product.stock = Math.max(0, Number(product.stock || 0) - Number(quantity || 0));
  product.sold = Math.max(0, Number(product.sold || 0) + Number(quantity || 0));
  await product.save({ validateBeforeSave: false });
}

export const cancelOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new HandleError("Khong tim thay don hang", 404));

  if (!order.user_id || order.user_id.toString() !== req.user._id.toString()) {
    return next(new HandleError("Ban khong co quyen huy don hang nay", 403));
  }

  if (order.orderStatus === ORDER_CANCELLED) {
    return res.status(200).json({
      success: true,
      message: "Don hang nay da duoc huy truoc do",
    });
  }

  if (![ORDER_PENDING, "Đang xử lý", "Processing", "pending"].includes(order.orderStatus)) {
    return next(new HandleError(`Khong the huy don hang dang o trang thai: ${order.orderStatus}`, 400));
  }

  if (order.orderStatus === ORDER_SHIPPING) {
    for (const item of order.orderItems) {
      await updateQuantity(item.product_id, -item.quantity);
    }
  }

  await releaseFlashSaleOrder(order);

  if (order.voucher_id) {
    await Voucher.findByIdAndUpdate(order.voucher_id, { $inc: { usedCount: -1 } });
  }

  order.orderStatus = ORDER_CANCELLED;
  order.cancelledAt = new Date();
  order.cancelledBy = req.user._id;
  order.cancellationReason = req.body.reason || "";
  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Huy don hang thanh cong",
  });
});

export const deleteOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new HandleError("Khong tim thay don hang", 404));

  if (order.orderStatus === ORDER_SHIPPING || order.orderStatus === ORDER_DELIVERED) {
    for (const item of order.orderItems) {
      await updateQuantity(item.product_id, -item.quantity);
    }
  }

  if (order.orderStatus !== ORDER_CANCELLED) {
    await releaseFlashSaleOrder(order);
    if (order.voucher_id) {
      await Voucher.findByIdAndUpdate(order.voucher_id, { $inc: { usedCount: -1 } });
    }
  }

  await order.deleteOne();
  res.status(200).json({ success: true, message: "Xoa don hang thanh cong" });
});
