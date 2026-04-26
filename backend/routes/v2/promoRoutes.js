import express from 'express';
import Voucher from '../../models/voucherModel.js';
import { validateVoucher } from '../../utils/v2/voucherValidator.js';
import { verifyUserAuth } from '../../middleware/userAuth.js';
import { isAuthenticatedAdmin } from '../../middleware/adminAuth.js';
import asyncErrorHandler from "../../middleware/handleAsyncError.js";

const router = express.Router();

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
    ...result 
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
  
  let query = {};

  // Tìm kiếm theo mã (Search by code) - hỗ trợ Regex không phân biệt hoa thường
  if (search) {
    query.code = { $regex: search, $options: 'i' };
  }

  // Lọc theo trạng thái (status) nâng cao
  if (status) {
    const statusArray = Array.isArray(status) ? status : status.split(',');
    
    const statusQueries = [];

    if (statusArray.includes('disabled')) {
      statusQueries.push({ status: 'disabled' });
    }
    if (statusArray.includes('active')) {
      statusQueries.push({ status: 'active' });
    }
    if (statusArray.includes('unused')) {
      statusQueries.push({ usedCount: 0 });
    }
    if (statusArray.includes('used')) {
      statusQueries.push({ usedCount: { $gt: 0 } });
    }
    if (statusArray.includes('expired')) {
      statusQueries.push({ 'conditions.endDate': { $lt: new Date() } });
    }

    if (statusQueries.length > 0) {
      query.$or = statusQueries;
    }
  }

  // Lọc theo loại voucher (type)
  if (type) {
    const typeArray = Array.isArray(type) ? type : type.split(',');
    query.type = { $in: typeArray };
  }

  // Lọc theo giá trị giảm (discount.value)
  if (minAmount || maxAmount) {
    query['discount.value'] = {};
    if (minAmount) query['discount.value'].$gte = Number(minAmount);
    if (maxAmount) query['discount.value'].$lte = Number(maxAmount);
  }

  // Lọc theo ngày tạo (createdAt)
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  // Lọc theo ngày hết hạn (conditions.endDate)
  if (expiryStart || expiryEnd) {
    query['conditions.endDate'] = {};
    if (expiryStart) query['conditions.endDate'].$gte = new Date(expiryStart);
    if (expiryEnd) {
      const endEx = new Date(expiryEnd);
      endEx.setHours(23, 59, 59, 999);
      query['conditions.endDate'].$lte = endEx;
    }
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
router.route('/apply').post(verifyUserAuth, applyVoucherPreview);

// Admin Routes
router.route('/admin').get(isAuthenticatedAdmin, getAllVouchers);
router.route('/admin/new').post(isAuthenticatedAdmin, createVoucher);
router.route('/admin/:id/status').put(isAuthenticatedAdmin, toggleVoucherStatus);
router.route('/admin/:id')
  .put(isAuthenticatedAdmin, updateVoucher)
  .delete(isAuthenticatedAdmin, deleteVoucher);

export default router;