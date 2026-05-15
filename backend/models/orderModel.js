import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPriceSnapshot: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    pricingType: {
      type: String,
      enum: ["normal", "flash_sale"],
      default: "normal",
    },
    flashSaleId: {
      type: mongoose.Schema.ObjectId,
      ref: "FlashSale",
      default: null,
    },
    flashSaleItemId: {
      type: mongoose.Schema.ObjectId,
      ref: "FlashSaleItem",
      default: null,
    },
    image: { type: String, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },

    orderCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    orderItems: [orderItemSchema],

    shippingInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      province: { type: String, required: true },
      district: { type: String, required: true },
      ward: { type: String, required: true },
      streetAddress: { type: String, required: true },
      addressLabel: { type: String, default: "Khac" },
    },

    orderStatus: {
      type: String,
      required: true,
      enum: ["Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"],
      default: "Chờ xử lý",
    },

    trackingNumber: {
      type: String,
      trim: true,
      sparse: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "MOMO", "VNPAY"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentInfo: {
      provider: { type: String },
      transId: { type: String },
      resultCode: { type: String },
      message: { type: String },
      amount: { type: Number },
      payType: { type: String },
    },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    flashSaleReservationStatus: {
      type: String,
      enum: ["none", "reserved", "committed", "released"],
      default: "none",
    },

    voucher_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Voucher",
      index: true,
    },
    voucherCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    voucherType: {
      type: String,
      enum: ["percentage", "fixed"],
    },
    voucherValue: {
      type: Number,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },

    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },

    deliveredAt: Date,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

orderSchema.index({ user_id: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ user_id: 1, voucher_id: 1, orderStatus: 1 });
orderSchema.index({ user_id: 1, "orderItems.flashSaleItemId": 1, orderStatus: 1 });

orderSchema.pre("save", function (next) {
  this.orderItems = (this.orderItems || []).map((item) => {
    if (!item.finalPrice) item.finalPrice = item.price;
    if (!item.originalPriceSnapshot) item.originalPriceSnapshot = item.price;
    return item;
  });

  this.itemsPrice = this.orderItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const discount = Number(this.discountAmount) || 0;
  this.totalPrice = Math.max(0, this.itemsPrice + this.taxPrice + this.shippingPrice - discount);
  next();
});

export default mongoose.model("Order", orderSchema);
