import FlashSale from "../models/flashSaleModel.js";
import FlashSaleItem from "../models/flashSaleItemModel.js";
import Product from "../models/productModel.js";
import HandleError from "../utils/handleError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";
import {
  findActiveFlashSale,
  getFlashSaleStatus,
  serializeFlashSale,
  serializeFlashSaleItem,
  findActiveFlashSaleItemForProduct,
} from "../services/flashSaleService.js";

const parsePaging = (req) => ({
  page: Math.max(1, Number(req.query.page || 1)),
  limit: Math.min(100, Math.max(1, Number(req.query.limit || 20))),
});

const buildOverlapQuery = ({ startAt, endAt, excludeId }) => {
  const query = {
    status: { $in: ["draft", "scheduled"] },
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  };
  if (excludeId) query._id = { $ne: excludeId };
  return query;
};

const assertNoCampaignOverlap = async ({ startAt, endAt, excludeId }) => {
  const overlapping = await FlashSale.findOne(buildOverlapQuery({ startAt, endAt, excludeId })).select("_id name");
  if (overlapping) {
    throw new HandleError(`Campaign overlaps with "${overlapping.name}"`, 400);
  }
};

const assertNoProductOverlap = async ({ productId, campaign, excludeItemId }) => {
  const overlappingCampaigns = await FlashSale.find(buildOverlapQuery({
    startAt: campaign.startAt,
    endAt: campaign.endAt,
    excludeId: campaign._id,
  })).select("_id");

  const campaignIds = overlappingCampaigns.map((item) => item._id);
  if (campaignIds.length === 0) return;

  const query = {
    productId,
    flashSaleId: { $in: campaignIds },
    isActive: true,
  };
  if (excludeItemId) query._id = { $ne: excludeItemId };

  const existing = await FlashSaleItem.findOne(query);
  if (existing) {
    throw new HandleError("Product already belongs to another overlapping Flash Sale", 400);
  }
};

const getFlashSaleItemStats = (items = []) => {
  const saleRevenue = items.reduce((sum, item) => sum + Number(item.salePrice || 0) * Number(item.soldCount || 0), 0);
  const saleStock = items.reduce((sum, item) => sum + Number(item.saleStock || 0), 0);
  const soldCount = items.reduce((sum, item) => sum + Number(item.soldCount || 0), 0);
  return {
    itemCount: items.length,
    saleRevenue,
    saleStock,
    soldCount,
    sellThroughRate: saleStock > 0 ? Math.round((soldCount / saleStock) * 100) : 0,
  };
};

export const createFlashSale = handleAsyncError(async (req, res, next) => {
  const { name, description, banner, startAt, endAt, isVisible, priority } = req.body;
  await assertNoCampaignOverlap({ startAt: new Date(startAt), endAt: new Date(endAt) });

  const campaign = await FlashSale.create({
    name,
    description,
    banner,
    startAt,
    endAt,
    isVisible,
    priority,
    createdBy: req.user?._id,
  });

  res.status(201).json({
    success: true,
    flashSale: await serializeFlashSale(campaign, { includeItems: false }),
  });
});

export const getAdminFlashSales = handleAsyncError(async (req, res) => {
  const { page, limit } = parsePaging(req);
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) query.status = req.query.status;

  const [campaigns, total] = await Promise.all([
    FlashSale.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    FlashSale.countDocuments(query),
  ]);

  const flashSales = await Promise.all(
    campaigns.map(async (campaign) => {
      const serialized = await serializeFlashSale(campaign);
      serialized.stats = getFlashSaleItemStats(serialized.items || []);
      return serialized;
    })
  );

  res.status(200).json({
    success: true,
    flashSales,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  });
});

export const getAdminFlashSale = handleAsyncError(async (req, res, next) => {
  const campaign = await FlashSale.findById(req.params.id);
  if (!campaign) return next(new HandleError("Flash Sale not found", 404));

  const flashSale = await serializeFlashSale(campaign);
  flashSale.stats = getFlashSaleItemStats(flashSale.items || []);

  res.status(200).json({ success: true, flashSale });
});

export const updateFlashSale = handleAsyncError(async (req, res, next) => {
  const campaign = await FlashSale.findById(req.params.id);
  if (!campaign) return next(new HandleError("Flash Sale not found", 404));

  const allowed = ["name", "description", "banner", "startAt", "endAt", "isVisible", "priority"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) campaign[key] = req.body[key];
  });

  await assertNoCampaignOverlap({ startAt: campaign.startAt, endAt: campaign.endAt, excludeId: campaign._id });

  await campaign.save();
  res.status(200).json({
    success: true,
    flashSale: await serializeFlashSale(campaign),
  });
});

export const deleteFlashSale = handleAsyncError(async (req, res, next) => {
  const campaign = await FlashSale.findById(req.params.id);
  if (!campaign) return next(new HandleError("Flash Sale not found", 404));

  await FlashSaleItem.deleteMany({ flashSaleId: campaign._id });
  await campaign.deleteOne();

  res.status(200).json({ success: true, message: "Flash Sale deleted" });
});

export const publishFlashSale = handleAsyncError(async (req, res, next) => {
  const campaign = await FlashSale.findById(req.params.id);
  if (!campaign) return next(new HandleError("Flash Sale not found", 404));

  const itemCount = await FlashSaleItem.countDocuments({ flashSaleId: campaign._id, isActive: true });
  if (itemCount === 0) {
    return next(new HandleError("Cannot publish an empty Flash Sale", 400));
  }

  await assertNoCampaignOverlap({ startAt: campaign.startAt, endAt: campaign.endAt, excludeId: campaign._id });
  campaign.status = "scheduled";
  await campaign.save();

  res.status(200).json({
    success: true,
    flashSale: await serializeFlashSale(campaign),
  });
});

export const cancelFlashSale = handleAsyncError(async (req, res, next) => {
  const campaign = await FlashSale.findById(req.params.id);
  if (!campaign) return next(new HandleError("Flash Sale not found", 404));

  campaign.status = "cancelled";
  await campaign.save();

  res.status(200).json({
    success: true,
    flashSale: await serializeFlashSale(campaign),
  });
});

export const addFlashSaleItem = handleAsyncError(async (req, res, next) => {
  const campaign = await FlashSale.findById(req.params.id);
  if (!campaign) return next(new HandleError("Flash Sale not found", 404));

  const product = await Product.findById(req.body.productId);
  if (!product) return next(new HandleError("Product not found", 404));

  await assertNoProductOverlap({ productId: product._id, campaign });

  const originalPriceSnapshot = Number(req.body.originalPriceSnapshot || product.originalPrice || product.price);
  const item = await FlashSaleItem.create({
    flashSaleId: campaign._id,
    productId: product._id,
    originalPriceSnapshot,
    salePrice: Number(req.body.salePrice),
    saleStock: Number(req.body.saleStock),
    perUserLimit: Number(req.body.perUserLimit || 1),
    sortOrder: Number(req.body.sortOrder || 0),
    isActive: req.body.isActive !== false,
  });

  res.status(201).json({
    success: true,
    item: serializeFlashSaleItem(item, campaign, product),
  });
});

export const updateFlashSaleItem = handleAsyncError(async (req, res, next) => {
  const campaign = await FlashSale.findById(req.params.id);
  if (!campaign) return next(new HandleError("Flash Sale not found", 404));

  const item = await FlashSaleItem.findOne({ _id: req.params.itemId, flashSaleId: campaign._id });
  if (!item) return next(new HandleError("Flash Sale item not found", 404));

  const allowed = ["salePrice", "saleStock", "perUserLimit", "sortOrder", "isActive"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) item[key] = req.body[key];
  });

  if (req.body.productId && req.body.productId !== item.productId.toString()) {
    const product = await Product.findById(req.body.productId);
    if (!product) return next(new HandleError("Product not found", 404));
    await assertNoProductOverlap({ productId: product._id, campaign, excludeItemId: item._id });
    item.productId = product._id;
    item.originalPriceSnapshot = Number(req.body.originalPriceSnapshot || product.originalPrice || product.price);
  }

  await item.save();
  await item.populate("productId", "name price originalPrice images stock sold category status");

  res.status(200).json({
    success: true,
    item: serializeFlashSaleItem(item, campaign, item.productId),
  });
});

export const deleteFlashSaleItem = handleAsyncError(async (req, res, next) => {
  const item = await FlashSaleItem.findOneAndDelete({
    _id: req.params.itemId,
    flashSaleId: req.params.id,
  });

  if (!item) return next(new HandleError("Flash Sale item not found", 404));
  res.status(200).json({ success: true, message: "Flash Sale item deleted" });
});

export const getActiveFlashSale = handleAsyncError(async (req, res) => {
  const campaign = await findActiveFlashSale();
  res.status(200).json({
    success: true,
    serverTime: new Date(),
    flashSale: campaign ? await serializeFlashSale(campaign) : null,
  });
});

export const getUpcomingFlashSales = handleAsyncError(async (req, res) => {
  const campaigns = await FlashSale.find({
    status: "scheduled",
    isVisible: true,
    startAt: { $gt: new Date() },
  })
    .sort({ startAt: 1 })
    .limit(5);

  const flashSales = await Promise.all(campaigns.map((campaign) => serializeFlashSale(campaign)));
  res.status(200).json({ success: true, serverTime: new Date(), flashSales });
});

export const getPublicFlashSale = handleAsyncError(async (req, res, next) => {
  const campaign = await FlashSale.findById(req.params.id);
  if (!campaign || !campaign.isVisible || getFlashSaleStatus(campaign) === "draft") {
    return next(new HandleError("Flash Sale not found", 404));
  }

  res.status(200).json({
    success: true,
    serverTime: new Date(),
    flashSale: await serializeFlashSale(campaign),
  });
});

export const getProductFlashSale = handleAsyncError(async (req, res) => {
  const active = await findActiveFlashSaleItemForProduct(req.params.id);
  if (!active) {
    return res.status(200).json({ success: true, serverTime: new Date(), flashSale: null });
  }

  const product = await Product.findById(req.params.id).select("name price originalPrice images stock sold category status");
  res.status(200).json({
    success: true,
    serverTime: new Date(),
    flashSale: serializeFlashSaleItem(active.item, active.campaign, product),
  });
});
