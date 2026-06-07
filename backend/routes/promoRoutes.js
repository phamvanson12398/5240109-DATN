import express from 'express';
import Voucher from '../models/voucherModel.js';
import { validateVoucher } from '../utils/voucherValidator.js';
import { verifyUserAuth } from '../middleware/userAuth.js';
import { isAuthenticatedAdmin } from '../middleware/adminAuth.js';
import asyncErrorHandler from "../middleware/handleAsyncError.js";
import Notification from '../models/notificationModel.js';

const router = express.Router();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const parseListQuery = (value) => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split(',');
  return list.map((item) => item.trim()).filter(Boolean);
};

const addDateRange = (query, field, from, to) => {
  if (!from && !to) return;
  query[field] = { ...(query[field] || {}) };
  if (from) query[field].$gte = new Date(from);
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    query[field].$lte = end;
  }
};

// 1. Áp dụng Voucher (Dành cho Client / Checkout)
const applyVoucherPreview = asyncErrorHandler(async (req, res, next) => {
  const { voucherCode, itemPrice } = req.body;
  const user = req.user;

  if (!voucherCode) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá.' });
  }

  const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });
  if (!voucher) {
    return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại.' });
  }

  const result = await validateVoucher(voucher, user, itemPrice);
  res.status(200).json({ 
    success: result.isValid,
    isValid: result.isValid,
    message: result.message,
    discountAmount: result.discount, // Chuyển từ discount sang discountAmount để khớp FE
    voucherCode: voucher.code,       // Trả về code để FE hiển thị
    voucher_id: voucher._id,         // Thêm ID để FE lưu trữ và gửi lên khi tạo order
    voucherType: voucher.discount.type,
    voucherValue: voucher.discount.value
  });
});

// 1b. Lấy danh sách Voucher đang hoạt động (Dành cho Client hiển thị trong Giỏ hàng)
const getActiveVouchers = asyncErrorHandler(async (req, res, next) => {
  const now = new Date();
  const vouchers = await Voucher.find({
    status: 'active',
    'targeting.isPublic': true,
    'conditions.startDate': { $lte: now },
    'conditions.endDate': { $gte: now }
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    vouchers
  });
});

// 2. [ADMIN] Tạo Voucher mới
const createVoucher = asyncErrorHandler(async (req, res, next) => {
  const voucherData = req.body;
  // Đảm bảo code luôn viết hoa
  if (voucherData.code) {
    voucherData.code = voucherData.code.toUpperCase();
  }
  
  const voucher = await Voucher.create(voucherData);

  // TỰ ĐỘNG TẠO THÔNG BÁO CHO NGƯỜI DÙNG (CHỈ DÀNH CHO VOUCHER PHỔ THÔNG & CÔNG KHAI)
  try {
    const isGeneral = voucher.type === 'general';
    const isPublic = voucher.targeting && voucher.targeting.isPublic;

    if (isGeneral && isPublic) {
      await Notification.create({
        userId: null, // Thông báo chung cho mọi người
        title: '🎁 Mã giảm giá mới cực hời!',
        message: `Tobi Shop vừa tung mã [${voucher.code}] giảm ${voucher.discount.type === 'percentage' ? `${voucher.discount.value}%` : `${voucher.discount.value.toLocaleString('vi-VN')}₫`}. Dùng ngay kẻo lỡ!`,
        type: 'promotion',
        link: '/cart'
      });
    }
  } catch (error) {
    console.error("Lỗi khi tạo thông báo Voucher:", error.message);
    // Không chặn luồng trả về voucher cho Admin
  }

  res.status(201).json({ 
    success: true, 
    voucher 
  });
});

// 2b. [ADMIN] Cập nhật Voucher
const updateVoucher = asyncErrorHandler(async (req, res, next) => {
  let voucher = await Voucher.findById(req.params.id);
  if (!voucher) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy Voucher.' });
  }

  const updateData = req.body;
  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
  }

  voucher = await Voucher.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ 
    success: true, 
    voucher 
  });
});

// 3. [ADMIN] Lấy tất cả Voucher (Hỗ trợ Bộ lọc, Tìm kiếm & Phân trang)
const getAllVouchers = asyncErrorHandler(async (req, res, next) => {
  const { 
    status, type, minAmount, maxAmount, 
    startDate, endDate, expiryStart, expiryEnd,
    search,
    page = 1,
    limit = 10
  } = req.query;
  
  const now = new Date();
  const soon = new Date(now.getTime() + 7 * ONE_DAY_MS);
  const query = {};
  const andConditions = [];

  // Tìm kiếm theo mã (Search by code) - hỗ trợ Regex không phân biệt hoa thường
  if (search) {
    query.code = { $regex: search, $options: 'i' };
  }

  // Lọc theo trạng thái (status) nâng cao
  if (status) {
    const statusArray = parseListQuery(status);
    
    const statusQueries = [];

    if (statusArray.includes('disabled')) {
      statusQueries.push({ status: 'disabled' });
    }
    if (statusArray.includes('active')) {
      statusQueries.push({
        status: 'active',
        'conditions.startDate': { $lte: now },
        'conditions.endDate': { $gte: now }
      });
    }
    if (statusArray.includes('near_expired')) {
      statusQueries.push({
        status: 'active',
        'conditions.endDate': { $gte: now, $lte: soon }
      });
    }
    if (statusArray.includes('expired')) {
      statusQueries.push({ 'conditions.endDate': { $lt: now } });
    }

    if (statusQueries.length > 0) {
      andConditions.push({ $or: statusQueries });
    }
  }

  // Lọc theo loại voucher (type)
  if (type) {
    const typeArray = parseListQuery(type);
    const discountTypes = typeArray.filter((item) => ['fixed', 'percentage'].includes(item));
    const typeQueries = [];

    if (discountTypes.length > 0) {
      typeQueries.push({ 'discount.type': { $in: discountTypes } });
    }

    if (typeArray.includes('shipping')) {
      typeQueries.push({ type: 'shop' });
    }

    if (typeQueries.length === 1) {
      Object.assign(query, typeQueries[0]);
    } else if (typeQueries.length > 1) {
      andConditions.push({ $or: typeQueries });
    }
  }

  // Lọc theo giá trị giảm (discount.value)
  if (minAmount || maxAmount) {
    query['discount.value'] = {};
    if (minAmount) query['discount.value'].$gte = Number(minAmount);
    if (maxAmount) query['discount.value'].$lte = Number(maxAmount);
  }

  // Lọc theo ngày tạo (createdAt)
  addDateRange(query, 'createdAt', startDate, endDate);

  // Lọc theo ngày hết hạn (conditions.endDate)
  addDateRange(query, 'conditions.endDate', expiryStart, expiryEnd);

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  // Pagination Logic
  const resPerPage = Number(limit);
  const currentPage = Number(page);
  const skip = resPerPage * (currentPage - 1);

  const totalVouchers = await Voucher.countDocuments(query);
  const totalPages = Math.ceil(totalVouchers / resPerPage);

  const vouchers = await Voucher.find(query)
    .sort({ createdAt: -1 })
    .limit(resPerPage)
    .skip(skip);
  
  res.status(200).json({ 
    success: true, 
    vouchers,
    totalVouchers,
    totalPages,
    currentPage,
    resPerPage
  });
});

// 4. [ADMIN] Bật/Tắt trạng thái Voucher
const toggleVoucherStatus = asyncErrorHandler(async (req, res, next) => {
  const voucher = await Voucher.findById(req.params.id);
  if (!voucher) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy Voucher.' });
  }

  voucher.status = voucher.status === 'active' ? 'disabled' : 'active';
  await voucher.save();

  res.status(200).json({ 
    success: true, 
    message: `Đã ${voucher.status === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} voucher thành công`, 
    voucher 
  });
});

// 5. [ADMIN] Xóa Voucher
const deleteVoucher = asyncErrorHandler(async (req, res, next) => {
  const voucher = await Voucher.findByIdAndDelete(req.params.id);
  if (!voucher) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy Voucher.' });
  }
  
  res.status(200).json({ 
    success: true, 
    message: 'Xóa voucher thành công' 
  });
});

// ROUTES DEFINITION
router.route('/all').get(getActiveVouchers);
router.route('/active').get(getActiveVouchers);
router.route('/apply').post(verifyUserAuth, applyVoucherPreview);

// Admin Routes
router.route('/admin').get(isAuthenticatedAdmin, getAllVouchers);
router.route('/admin/new').post(isAuthenticatedAdmin, createVoucher);
router.route('/admin/:id/status').put(isAuthenticatedAdmin, toggleVoucherStatus);
router.route('/admin/:id')
  .put(isAuthenticatedAdmin, updateVoucher)
  .delete(isAuthenticatedAdmin, deleteVoucher);

export default router;
