import mongoose from "mongoose";
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
import HandleError from '../utils/handleError.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import APIFunctionality from '../utils/apiFunctionality.js';
import { sendStatusEmail } from '../services/emailService.js';

// Helper: Sinh mã đơn hàng ngẫu nhiên chuyên nghiệp: TB-YYYYMMDD-XXXXX
const generateOrderCode = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  
  let isUnique = false;
  let code = "";
  
  while (!isUnique) {
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase(); // 5 ký tự ngẫu nhiên
    code = `TB-${dateStr}-${randomStr}`;
    
    // Kiểm tra tính duy nhất trong database
    const existingOrder = await Order.findOne({ orderCode: code });
    if (!existingOrder) {
      isUnique = true;
    }
  }
  
  return code;
};


// Tạo đơn hàng mới (dữ liệu snapshot được gởi từ Frontend sau Checkout)
export const createNewOrder = handleAsyncError(async (req, res, next) => {
  const { shippingInfo, orderItems, itemPrice, taxPrice, shippingPrice, totalPrice, paymentMethod } = req.body;

  // Normalize shippingInfo: support both old format (city/state/pinCode/phoneNo)
  // and new format (name/phone/address/district/province)
  const normalizedShipping = {
    name: shippingInfo.name || req.user.name || "",
    phone: String(shippingInfo.phone || shippingInfo.phoneNo || shippingInfo.phoneNumber || ""),
    address: shippingInfo.address || "",
    district: shippingInfo.district || shippingInfo.city || "",
    province: shippingInfo.province || shippingInfo.state || ""
  };

  // Normalize orderItems: support both "product" (old) and "product_id" (new) field
  const normalizedItems = (orderItems || []).map(item => ({
    product_id: item.product_id || item.product,
    name: item.name,
    price: item.price,
    image: item.image || item.images?.[0]?.url || item.images?.[0] || "",
    quantity: item.quantity,
    size: item.size || null,
    color: item.color || null
  }));

  // Tự động sinh mã đơn hàng mới
  const orderCode = await generateOrderCode();

  const order = await Order.create({
    shippingInfo: normalizedShipping,
    orderItems: normalizedItems,

    // paymentMethod and paymentStatus are top-level fields in schema
    paymentMethod: paymentMethod || req.body.paymentInfo?.method || "COD",
    paymentStatus: "Pending",

    itemsPrice: itemPrice || 0,
    taxPrice: taxPrice || 0,
    shippingPrice: shippingPrice || 0,
    totalPrice: totalPrice || 0,

    paidAt: null,
    user_id: req.user._id,
    orderCode: orderCode, // Gán mã đơn hàng

    orderStatus: "Chờ xử lý",
    isPaid: false,
  });

  res.status(200).json({
    success: true,
    orderId: order._id,
    order,
  });
});

// Xem chi tiết nội dung của một đơn hàng
export const getSingleOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user_id", "name email")
  if (!order) {
    return next(new HandleError("Không tìm thấy đơn đặt hàng", 404))
  }
  
  // Check access: only admin or the order owner can view
  if (req.user.role !== 'admin' && order.user_id?.toString() !== req.user.id.toString()) {
    return next(new HandleError("Bạn không có quyền truy cập đơn hàng này", 403));
  }

  res.status(200).json({
    success: true,
    order
  })
})

// Xem tất cả đơn hàng của user hiện tại
export const allMyOrder = handleAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user_id: req.user.id }).populate("user_id", "name email");
  if (!orders) {
    return next(new HandleError("Không tìm thấy đơn hàng", 404))
  }
  res.status(200).json({
    success: true,
    orders
  })
})

// Admin - Lấy tất cả các đơn hàng
export const getAllOrder = handleAsyncError(async (req, res, next) => {
  const orders = await Order.find().populate("user_id", "name email");

  let totalAmount = 0
  orders.forEach(order => {
    totalAmount += order.totalPrice
  })

  res.status(200).json({
    success: true,
    orders,
    totalAmount
  })
})

// cập nhật trạng thái đơn hàng
export const updateOrderStauts = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user_id", "name email");
  if (!order) return next(new HandleError("Không tìm thấy đơn hàng", 404));

  const newStatus = req.body.status;
  const { trackingNumber, cancellationReason } = req.body;

  const allowed = ["Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"];
  if (!allowed.includes(newStatus)) {
    return next(new HandleError("Trạng thái không hợp lệ", 400));
  }

  if (order.orderStatus === "Đã giao") {
    return next(new HandleError("Đơn hàng đã giao, không thể cập nhật nữa", 400));
  }

  if (newStatus === "Đang giao" && order.orderStatus !== "Đang giao") {
    await Promise.all(
      order.orderItems.map((item) => updateQuantity(item.product_id, item.quantity))
    );
  }

  order.orderStatus = newStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (cancellationReason) order.cancellationReason = cancellationReason;

  if (newStatus === "Đã giao") {
    order.deliveredAt = Date.now();

    if (order.paymentMethod === "COD" && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      if (order.paymentInfo) {
        order.paymentInfo.status = "PAID";
      }
    }
  }

  if (newStatus === "Đã hủy") {
    order.cancelledAt = Date.now();
    order.cancelledBy = req.user._id;
  }

  await order.save({ validateBeforeSave: false });

  // Gửi email thông báo (bất đồng bộ)
  sendStatusEmail(order, newStatus);

  res.status(200).json({ success: true, order });
});




async function updateQuantity(id, quantity) {
  const product = await Product.findById(id);
  
  // [Graceful Skip]: Bỏ qua việc trừ tồn kho đối với các sản phẩm đã bị xóa hoặc không còn tồn tại
  if (!product) {
    console.warn(`[Stock System Warning]: Bỏ qua trừ kho. Cảnh báo - không tìm thấy Sản phẩm mang ID: ${id} (Có thể đã bị xóa khỏi hệ thống).`);
    return;
  }
  
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// Người dùng tự hủy đơn hàng
export const cancelOrder = handleAsyncError(async (req, res, next) => {
  // [HYBRID TRANSACTION LOGIC]
  // Kiểm tra xem database có hỗ trợ Transaction (Replica Set/Sharded) hay không
  const dbConfig = mongoose.connection.getClient().topology.description;
  const supportsTransactions = ["ReplicaSetNoPrimary", "ReplicaSetPrimary", "Sharded"].includes(dbConfig.type);

  let session = null;
  if (supportsTransactions) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    // Nếu có session thì dùng session, nếu không thì truy vấn bình thường
    const queryOptions = session ? { session } : {};
    const order = await Order.findById(req.params.id).setOptions(queryOptions);

    if (!order) {
      if (session) await session.abortTransaction();
      return next(new HandleError("Không tìm thấy đơn hàng", 404));
    }

    // Kiểm tra quyền sở hữu
    if (order.user_id.toString() !== req.user._id.toString()) {
      if (session) await session.abortTransaction();
      return next(new HandleError("Bạn không có quyền hủy đơn hàng này", 403));
    }

    // Kiểm tra tính lũy đẳng
    if (order.orderStatus === "Đã hủy") {
      if (session) await session.abortTransaction();
      return res.status(200).json({
        success: true,
        message: "Đơn hàng này đã được hủy trước đó",
      });
    }

    // Kiểm tra trạng thái cho phép hủy
    const allowedToCancel = ["Chờ xử lý", "Đang xử lý", "Processing", "pending"];
    if (!allowedToCancel.includes(order.orderStatus)) {
      if (session) await session.abortTransaction();
      return next(new HandleError(`Không thể hủy đơn hàng đang ở trạng thái: ${order.orderStatus}`, 400));
    }

    // [FAIL-SAFE] Khôi phục tồn kho nếu đơn hàng đã lỡ bước sang trạng thái trừ kho
    if (order.orderStatus === "Đang giao" || order.orderStatus === "shipping") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { stock: item.quantity } },
          { ...queryOptions, new: true }
        );
      }
    }

    // Cập nhật trạng thái và thông tin Audit
    order.orderStatus = "Đã hủy";
    order.cancelledAt = new Date();
    order.cancelledBy = req.user._id;
    order.cancellationReason = req.body.reason || "";

    await order.save({ ...queryOptions, validateBeforeSave: false });

    if (session) await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công",
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
});

