import mongoose from "mongoose";

const flashSaleItemSchema = new mongoose.Schema(
  {
    flashSaleId: {
      type: mongoose.Schema.ObjectId,
      ref: "FlashSale",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantId: {
      type: mongoose.Schema.ObjectId,
      default: null,
    },
    originalPriceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    saleStock: {
      type: Number,
      required: true,
      min: 1,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

flashSaleItemSchema.index({ flashSaleId: 1, productId: 1 }, { unique: true });
flashSaleItemSchema.index({ productId: 1, isActive: 1 });

flashSaleItemSchema.pre("validate", function (next) {
  if (this.salePrice >= this.originalPriceSnapshot) {
    return next(new Error("Flash sale price must be lower than the original price"));
  }
  if (this.perUserLimit > this.saleStock) {
    return next(new Error("Per-user limit cannot be greater than sale stock"));
  }
  if (this.soldCount + this.reservedCount > this.saleStock) {
    return next(new Error("Sold and reserved quantities cannot exceed sale stock"));
  }
  next();
});

export default mongoose.models.FlashSaleItem || mongoose.model("FlashSaleItem", flashSaleItemSchema);
