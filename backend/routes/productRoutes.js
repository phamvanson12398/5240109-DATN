import express from "express";
import {
  getAllProducts,
  getSingleProduct,
  getAdminProducts,
  createReviewProduct,
  getReviewProduct,
  deleteReviewProduct,
  createProducts,
  updateProduct,
  deteteProduct,
  importProducts,
  importProductsPreCheck,
  updateProductsBulk,
  importStock,
  updateStock,
  searchProducts
} from "../controllers/productController.js";

import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";

const router = express.Router();

// ======================= PUBLIC ROUTES =======================
router.route("/products").get(getAllProducts);
router.route("/products/:id").get(getSingleProduct);

// ======================= ADMIN ROUTES =======================
router
  .route("/admin/products")
  .get(verifyUserAuth, roleBasedAccess("admin","staff"), getAdminProducts);


router
  .route("/admin/products/create")
  .post(verifyUserAuth, roleBasedAccess("admin","staff"), createProducts);

// Import sản phẩm hàng loạt từ Excel/CSV
router
  .route("/admin/products/import")
  .post(verifyUserAuth, roleBasedAccess("admin","staff"), importProducts);

  router
  .route("/admin/products/import-precheck")
  .post(verifyUserAuth, roleBasedAccess("admin","staff"), importProductsPreCheck);


// Cập nhật sản phẩm hàng loạt từ Excel/CSV
router
  .route("/admin/products/update-bulk")
  .put(verifyUserAuth, roleBasedAccess("admin","staff"), updateProductsBulk);

// Import tồn kho hàng loạt
router
  .route("/admin/products/import-stock")
  .put(verifyUserAuth, roleBasedAccess("admin","staff"), importStock);

// Tìm kiếm sản phẩm theo tên
router
  .route("/admin/products/search")
  .get(verifyUserAuth, roleBasedAccess("admin","staff"), searchProducts);

// Cập nhật tồn kho 1 sản phẩm
router
  .route("/admin/products/:id/stock")
  .put(verifyUserAuth, roleBasedAccess("admin","staff"), updateStock);

router
  .route("/admin/products/:id")
  .put(verifyUserAuth, roleBasedAccess("admin","staff"), updateProduct)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deteteProduct);

// ======================= REVIEWS =======================
router.route("/review").put(verifyUserAuth, createReviewProduct);

router
  .route("/reviews")
  .get( getReviewProduct)
  .delete(verifyUserAuth, deleteReviewProduct);

export default router;
