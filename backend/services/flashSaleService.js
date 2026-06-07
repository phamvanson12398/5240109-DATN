import mongoose from "mongoose";
import FlashSale from "../models/flashSaleModel.js";
import FlashSaleItem from "../models/flashSaleItemModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";
import Order from "../models/orderModel.js";

/**
 * Muc dich:
 * - Chuyen gia tri dau vao thanh MongoDB ObjectId hop le.
 *
 * Input:
 * - value: string | ObjectId | null | undefined.
 *
 * Output:
 * - ObjectId neu convert duoc.
 * - null neu khong hop le.
 *
 * Khi duoc goi:
 * - Truoc cac query/aggregate can match theo ObjectId.
 */
const toObjectId = (value) => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  const text = value.toString();
  return mongoose.Types.ObjectId.isValid(text) ? new mongoose.Types.ObjectId(text) : null;
};

/**
 * Muc dich:
 * - Tinh trang thai hien tai cua 1 campaign Flash Sale.
 * - Trang thai nay duoc suy ra tu status trong DB + thoi gian hien tai.
 *
 * Input:
 * - campaign: document FlashSale.
 * - now: thoi diem hien tai, mac dinh la new Date().
 *
 * Output:
 * - "none" | "cancelled" | "draft" | "scheduled" | "active" | "ended".
 *
 * Khi duoc goi:
 * - Luc can tra campaign ra cho admin/public/frontend.
 */
export const getFlashSaleStatus = (campaign, now = new Date()) => {
  if (!campaign) return "none";
  if (campaign.status === "cancelled") return "cancelled";
  if (campaign.status === "draft") return "draft";
  if (now < new Date(campaign.startAt)) return "scheduled";
  if (now <= new Date(campaign.endAt)) return "active";
  return "ended";
};

/**
 * Muc dich:
 * - Chuan hoa 1 Flash Sale item de controller/frontend de doc.
 * - Tinh cac field dong nhu availableStock va discountPercent.
 *
 * Input:
 * - item: document FlashSaleItem.
 * - campaign: campaign ma item dang thuoc ve.
 * - product: product da populate; neu khong truyen vao thi fallback item.productId.
 *
 * Output:
 * - Plain object chua du thong tin item, gia, stock, gioi han mua.
 *
 * Khi duoc goi:
 * - Luc serialize danh sach item trong campaign.
 * - Luc tra thong tin Flash Sale cua 1 product.
 */
export const serializeFlashSaleItem = (item, campaign, product = item.productId) => {
  // soldCount: da ban xong.
  const soldCount = Number(item.soldCount || 0);

  // reservedCount: da giu cho don dang thanh toan nhung chua commit thanh sold.
  const reservedCount = Number(item.reservedCount || 0);
  const saleStock = Number(item.saleStock || 0);

  // So suat con lai thuc te cua item Flash Sale.
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

/**
 * Muc dich:
 * - Chuan hoa toan bo campaign Flash Sale.
 * - Co the kem theo danh sach item, hoac chi tra metadata campaign.
 *
 * Input:
 * - campaign: document FlashSale.
 * - includeItems: co can nap item hay khong.
 * - includeInactiveItems: co lay ca item isActive = false hay khong.
 *
 * Output:
 * - Plain object campaign co them computedStatus, serverTime va items (neu can).
 *
 * Khi duoc goi:
 * - flashSaleController tra ve campaign cho admin/public.
 */
export const serializeFlashSale = async (
  campaign,
  { includeItems = true, includeInactiveItems = false } = {}
) => {
  if (!campaign) return null;

  // Chuyen document Mongoose thanh plain object de de merge field tinh toan.
  const doc = campaign.toObject ? campaign.toObject() : campaign;
  const serialized = {
    ...doc,
    computedStatus: getFlashSaleStatus(campaign),
    serverTime: new Date(),
  };

  if (includeItems) {
    const query = { flashSaleId: campaign._id };

    // Public flow thuong chi hien item active.
    // Admin flow co the can nhin thay ca item inactive.
    if (!includeInactiveItems) {
      query.isActive = true;
    }

    // Populate product de frontend co ten/gia/anh/stock hien tai.
    const items = await FlashSaleItem.find(query)
      .populate("productId", "name price originalPrice images stock sold category status")
      .sort({ sortOrder: 1, createdAt: -1 });

    // Bo qua item bi mat product, sau do serialize tung item.
    serialized.items = items
      .filter((item) => item.productId)
      .map((item) => serializeFlashSaleItem(item, campaign, item.productId));
  }

  return serialized;
};

/**
 * Muc dich:
 * - Tim campaign Flash Sale dang co hieu luc o thoi diem hien tai.
 *
 * Input:
 * - now: thoi diem hien tai, mac dinh la new Date().
 *
 * Output:
 * - 1 document FlashSale dang active hoac null.
 *
 * Khi duoc goi:
 * - Homepage, product detail, cart va order deu can biet campaign active hien tai.
 */
export const findActiveFlashSale = async (now = new Date()) => {
  return FlashSale.findOne({
    status: "scheduled",
    isVisible: true,
    startAt: { $lte: now },
    endAt: { $gte: now },
  }).sort({ priority: -1, startAt: 1 });
};

/**
 * Muc dich:
 * - Tim item Flash Sale active cua 1 product cu the.
 *
 * Input:
 * - productId: _id cua Product.
 * - now: thoi diem hien tai.
 *
 * Output:
 * - null neu product khong nam trong Flash Sale active.
 * - { campaign, item } neu co.
 *
 * Khi duoc goi:
 * - Product detail muon biet product co Flash Sale khong.
 * - Cart/order muon ap gia Flash Sale cho product.
 */
export const findActiveFlashSaleItemForProduct = async (productId, now = new Date()) => {
  // Buoc 1: tim campaign dang active theo thoi gian hien tai.
  const campaign = await findActiveFlashSale(now);
  if (!campaign) return null;

  // Buoc 2: tim item cua product nay trong campaign vua tim duoc.
  const item = await FlashSaleItem.findOne({
    flashSaleId: campaign._id,
    productId,
    isActive: true,
  });

  if (!item) return null;
  return { campaign, item };
};

/**
 * Muc dich:
 * - Dem tong so luong Flash Sale ma 1 user da mua trong cac order chua huy.
 * - Day la du lieu nen de check perUserLimit.
 *
 * Input:
 * - userId: id cua user.
 * - flashSaleItemId: id cua item Flash Sale.
 *
 * Output:
 * - Tong quantity user da mua cho item do.
 *
 * Khi duoc goi:
 * - Trong getPricingForProduct(), revalidateCartForUser(), buildOrderItemsFromSource().
 */
export const getUserFlashSalePurchaseCount = async (userId, flashSaleItemId) => {
  const userObjectId = toObjectId(userId);
  const itemObjectId = toObjectId(flashSaleItemId);
  if (!userObjectId || !itemObjectId) return 0;

  // Aggregate pipeline:
  // 1. Loc order cua user chua bi huy.
  // 2. Tach tung orderItem.
  // 3. Chi giu cac item co flashSaleItemId can tim.
  // 4. Cong tong quantity.
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

/**
 * Muc dich:
 * - Day la ham quan trong nhat cua file.
 * - Quy dinh san pham dang ban gia thuong hay gia Flash Sale.
 * - Dong thoi validate stock, validate trang thai product, validate per-user limit.
 *
 * Input:
 * - product: document Product vua lay tu DB.
 * - userId: user dang mua.
 * - quantity: so luong muon mua.
 * - strictFlashSaleItemId:
 *   + null: cho phep tu tim Flash Sale active hien tai.
 *   + co gia tri: bat buoc item hien tai phai trung voi item cu trong gio/order.
 *
 * Output:
 * - { valid: false, message } neu khong hop le.
 * - { valid: true, pricingType, price, ... } neu hop le.
 *
 * Khi duoc goi:
 * - buildCartItemSnapshot() va tat ca cac flow cart/order phia sau.
 */
export const getPricingForProduct = async ({ product, userId, quantity = 1, strictFlashSaleItemId = null }) => {
  if (!product) {
    return { valid: false, message: "Product not found" };
  }

  if (product.status === "discontinued") {
    return { valid: false, message: "Product is no longer available" };
  }

  // Chuan hoa quantity de khong bao gio nho hon 1.
  const requestedQuantity = Math.max(1, Number(quantity || 1));

  // Tim xem product nay co item Flash Sale active hay khong.
  const active = await findActiveFlashSaleItemForProduct(product._id);

  if (!active) {
    // Truong hop gio dang giu item Flash Sale cu, nhung den luc nay sale da het/doi.
    if (strictFlashSaleItemId) {
      return {
        valid: false,
        message: "Flash Sale da het hieu luc. Vui long cap nhat gio hang.",
      };
    }

    // Khong co Flash Sale => dung gia thuong va stock thuong cua product.
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

  // Neu gio/order gui len item Flash Sale cu, backend se chan va buoc cap nhat lai.
  if (strictFlashSaleItemId && item._id.toString() !== strictFlashSaleItemId.toString()) {
    return {
      valid: false,
      message: "Flash Sale trong gio hang da thay doi. Vui long cap nhat gio hang.",
    };
  }

  // Flash Sale co 2 lop gioi han:
  // - Gioi han theo pool suat Flash Sale.
  // - Gioi han theo stock thuc te cua product trong kho.
  const flashSaleAvailableStock =
    Number(item.saleStock || 0) - Number(item.soldCount || 0) - Number(item.reservedCount || 0);

  // availableStock cuoi cung la min cua 2 gioi han tren.
  const availableStock = Math.max(0, Math.min(flashSaleAvailableStock, Number(product.stock || 0)));
  if (availableStock < requestedQuantity) {
    const message = flashSaleAvailableStock < requestedQuantity
      ? `San pham ${product.name} da het suat Flash Sale.`
      : `San pham ${product.name} khong du ton kho hien tai cho Flash Sale.`;

    return {
      valid: false,
      message,
    };
  }

  // Check user da mua bao nhieu truoc do trong cac order chua huy.
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

/**
 * Muc dich:
 * - Tao snapshot cart item tu du lieu moi nhat trong DB.
 * - Snapshot nay giup cart luu lai gia/tinh trang tai thoi diem user them vao gio.
 *
 * Input:
 * - productId: id san pham.
 * - userId: user dang thao tac.
 * - quantity, size, color: thong tin user chon.
 * - strictFlashSaleItemId: item Flash Sale cu trong gio (neu co).
 *
 * Output:
 * - { valid: false, message } neu khong hop le.
 * - { valid: true, cartItem, pricing } neu hop le.
 *
 * Khi duoc goi:
 * - cartController add/update/sync/revalidate.
 * - order flow can rebuild item truoc khi tao order.
 */
export const buildCartItemSnapshot = async ({ productId, userId, quantity, size = null, color = null, strictFlashSaleItemId = null }) => {
  // Luon lay product moi nhat tu DB, khong tin data cu tu frontend.
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

/**
 * Muc dich:
 * - Quet toan bo gio hang cua user va tinh lai tung item theo du lieu moi nhat.
 * - Day la lop bao ve de cart khong giu gia cu hay item Flash Sale da het hieu luc.
 *
 * Input:
 * - userId: user can revalidate gio hang.
 * - persist:
 *   + true: save lai snapshot moi vao DB.
 *   + false: chi kiem tra, khong ghi DB.
 *
 * Output:
 * - { valid, cart, items, errors }
 *
 * Khi duoc goi:
 * - User mo gio hang / checkout / he thong can dong bo lai cart.
 */
export const revalidateCartForUser = async (userId, { persist = true } = {}) => {
  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) return { valid: true, cart: null, items: [], errors: [] };

  const items = await CartItem.find({ cart_id: cart._id });
  const updatedItems = [];
  const errors = [];
  const flashSaleQuantities = new Map();

  for (const item of items) {
    // Moi dong trong gio deu duoc rebuild lai bang logic hien tai cua server.
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
      // Ghi de cart item bang snapshot moi nhat.
      item.set(result.cartItem);
      await item.save();
    }
    updatedItems.push(item);

    // Gom tong so luong theo flashSaleItemId de check per-user limit tren ca gio.
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

  // Sau khi gom xong theo item, check them tong trong gio + lich su da mua.
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

/**
 * Muc dich:
 * - Chuyen source items tu cart/direct-buy thanh orderItems chuan de luu Order.
 * - Luon validate lai gia va Flash Sale bang DB, khong tin payload tu frontend.
 *
 * Input:
 * - userId: user dang dat hang.
 * - sourceItems: danh sach item gui len tu cart hoac direct buy.
 *
 * Output:
 * - { valid, items, errors, hasFlashSale }
 *
 * Khi duoc goi:
 * - orderController truoc khi Order.create().
 */
export const buildOrderItemsFromSource = async ({ userId, sourceItems }) => {
  const normalized = [];
  const errors = [];
  const flashSaleQuantities = new Map();

  for (const source of sourceItems || []) {
    // Ho tro ca payload moi (product_id) va payload cu/backward-compatible (product).
    const rawProductId = source.product_id || source.product;
    const productId = rawProductId && typeof rawProductId === "object" ? rawProductId._id : rawProductId;
    const result = await buildCartItemSnapshot({
      productId,
      userId,
      quantity: source.quantity,
      size: source.size,
      color: source.color,
      strictFlashSaleItemId: source.pricingType === "flash_sale" ? source.flashSaleItemId : null,
    });

    if (!result.valid) {
      errors.push({ productId, message: result.message });
      continue;
    }

    // normalized la shape order item chinh thuc se luu vao Order.
    normalized.push({
      product_id: result.cartItem.product_id,
      name: result.cartItem.name,
      price: result.cartItem.price,
      image: result.cartItem.image,
      quantity: result.cartItem.quantity,
      size: result.cartItem.size,
      color: result.cartItem.color,
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

  // Check tong order hien tai + lich su mua co vuot per-user limit khong.
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

/**
 * Muc dich:
 * - Ham noi bo dung chung cho reserve/sell stock Flash Sale.
 * - Neu co bat ky item that bai, ham se rollback nhung item da update truoc do.
 *
 * Input:
 * - orderItems: danh sach order item da duoc validate.
 * - incFactory: callback tao object $inc phu hop cho reserve hoac sell.
 *
 * Output:
 * - Khong tra ve data. Throw error neu update that bai.
 *
 * Khi duoc goi:
 * - reserveFlashSaleItems()
 * - sellFlashSaleItems()
 */
const applyFlashSaleItemInc = async (orderItems, incFactory) => {
  const applied = [];

  try {
    for (const item of orderItems) {
      if (item.pricingType !== "flash_sale" || !item.flashSaleItemId) continue;

      const quantity = Number(item.quantity || 0);
      const update = incFactory(quantity);

      // Dieu kien $expr nay rat quan trong:
      // chi update neu soldCount + reservedCount + quantity van <= saleStock.
      // Day la lop bao ve tranh oversell khi co nhieu user dat cung luc.
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
    // Neu 1 item that bai, rollback nhung item da tang truoc do.
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

/**
 * Muc dich:
 * - Tang reservedCount de giu suat Flash Sale tam thoi.
 *
 * Input:
 * - orderItems: danh sach item trong order.
 *
 * Output:
 * - Khong tra ve data. Throw error neu het suat.
 *
 * Khi duoc goi:
 * - orderController tao order online (vi du VNPay) truoc khi thanh toan thanh cong.
 */
export const reserveFlashSaleItems = async (orderItems) => {
  await applyFlashSaleItemInc(orderItems, (quantity) => ({ $inc: { reservedCount: quantity } }));
};

/**
 * Muc dich:
 * - Tang soldCount ngay lap tuc, xem nhu da chot suat Flash Sale.
 *
 * Input:
 * - orderItems: danh sach item trong order.
 *
 * Output:
 * - Khong tra ve data. Throw error neu het suat.
 *
 * Khi duoc goi:
 * - orderController tao order COD / flow thanh toan khong can reserve truoc.
 */
export const sellFlashSaleItems = async (orderItems) => {
  await applyFlashSaleItemInc(orderItems, (quantity) => ({ $inc: { soldCount: quantity } }));
};

/**
 * Muc dich:
 * - Chuyen stock tu reserved sang sold sau khi thanh toan thanh cong.
 *
 * Input:
 * - order: document Order, can co flashSaleReservationStatus = "reserved".
 *
 * Output:
 * - Cap nhat DB va doi order.flashSaleReservationStatus thanh "committed".
 *
 * Khi duoc goi:
 * - paymentController xac nhan thanh toan online thanh cong.
 */
export const commitReservedFlashSaleOrder = async (order) => {
  if (!order || order.flashSaleReservationStatus !== "reserved") return;

  for (const item of order.orderItems || []) {
    if (item.pricingType !== "flash_sale" || !item.flashSaleItemId) continue;
    const quantity = Number(item.quantity || 0);

    // Giam reservedCount va tang soldCount cho cung mot quantity.
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

/**
 * Muc dich:
 * - Tra lai stock Flash Sale khi order that bai, bi huy hoac bi xoa.
 * - Neu order dang o "reserved" thi giam reservedCount.
 * - Neu order dang o "committed" thi giam soldCount.
 *
 * Input:
 * - order: document Order hoac object co orderItems + flashSaleReservationStatus.
 *
 * Output:
 * - Cap nhat DB va doi order.flashSaleReservationStatus thanh "released".
 *
 * Khi duoc goi:
 * - orderController/paymentController trong cac flow huy, fail, rollback.
 */
export const releaseFlashSaleOrder = async (order) => {
  if (!order || !["reserved", "committed"].includes(order.flashSaleReservationStatus)) return;

  const field = order.flashSaleReservationStatus === "reserved" ? "reservedCount" : "soldCount";
  for (const item of order.orderItems || []) {
    if (item.pricingType !== "flash_sale" || !item.flashSaleItemId) continue;
    const quantity = Number(item.quantity || 0);

    // Chi rollback neu field hien tai con du quantity de giam.
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

/**
 * ========================= TONG KET FILE =========================
 *
 * File nay co nhiem vu gi?
 * - Day la service trung tam cua module Flash Sale.
 * - No chua business logic, khong render UI, khong dinh nghia route.
 * - Controller se goi cac ham trong file nay de:
 *   + Tim campaign active
 *   + Tinh gia Flash Sale hay gia thuong
 *   + Validate stock va per-user limit
 *   + Rebuild cart/order theo du lieu moi nhat
 *   + Reserve / commit / release stock
 *
 * Luong tong quat:
 * - User -> controller -> service nay -> model MongoDB -> controller -> frontend/UI
 *
 * Vi du luong cart/order:
 * - User them san pham vao gio
 *   -> cartController goi buildCartItemSnapshot()
 *   -> ham nay goi getPricingForProduct()
 *   -> getPricingForProduct() tim Flash Sale active + validate stock/limit
 *   -> tra ve snapshot gia de luu vao CartItem
 *
 * - User dat hang
 *   -> orderController goi buildOrderItemsFromSource()
 *   -> service validate lai toan bo item tu DB
 *   -> neu online payment: reserveFlashSaleItems()
 *   -> neu COD: sellFlashSaleItems()
 *
 * - Thanh toan thanh cong / fail / huy don
 *   -> paymentController/orderController goi commitReservedFlashSaleOrder() hoac releaseFlashSaleOrder()
 *
 * Nhung diem de loi:
 * - Cart giu flashSaleItemId cu khi campaign da doi.
 * - Nhieu user mua dong thoi de gay oversell neu update khong atomically.
 * - Logic "da mua" hien tai dua vao order chua huy; neu business doi quy tac, ham purchase count cung phai doi.
 * - Product stock va saleStock la 2 gioi han khac nhau, de bi bo sot 1 trong 2.
 *
 * Goi y cai thien:
 * - Dung MongoDB transaction/session cho create order + update flash sale.
 * - Tach message loi thanh constants/i18n.
 * - Them unit test/integration test cho race condition reserve/sell/release.
 * - Co the tach rieng validator helper de file ngan hon va de test hon.
 */
