import mongoose from "mongoose";

const flashSaleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Flash sale name is required"],
      trim: true,
      maxLength: [120, "Flash sale name cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    banner: {
      type: String,
      trim: true,
      default: "",
    },
    startAt: {
      type: Date,
      required: [true, "Flash sale start time is required"],
    },
    endAt: {
      type: Date,
      required: [true, "Flash sale end time is required"],
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "cancelled"],
      default: "draft",
      index: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

flashSaleSchema.index({ startAt: 1, endAt: 1, status: 1 });
flashSaleSchema.index({ isVisible: 1, priority: -1 });

flashSaleSchema.pre("validate", function (next) {
  if (this.startAt && this.endAt && this.startAt >= this.endAt) {
    return next(new Error("Flash sale start time must be before end time"));
  }
  next();
});

export default mongoose.models.FlashSale || mongoose.model("FlashSale", flashSaleSchema);
