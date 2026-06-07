import express from "express";
import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";
import {
  addFlashSaleItem,
  cancelFlashSale,
  createFlashSale,
  deleteFlashSale,
  deleteFlashSaleItem,
  getActiveFlashSale,
  getAdminFlashSale,
  getAdminFlashSales,
  getProductFlashSale,
  getPublicFlashSale,
  getUpcomingFlashSales,
  publishFlashSale,
  updateFlashSale,
  updateFlashSaleItem,
} from "../controllers/flashSaleController.js";

const router = express.Router();

router
  .route("/admin/flash-sales")
  .post(verifyUserAuth, roleBasedAccess("admin","staff"), createFlashSale)
  .get(verifyUserAuth, roleBasedAccess("admin","staff"), getAdminFlashSales);

router
  .route("/admin/flash-sales/:id")
  .get(verifyUserAuth, roleBasedAccess("admin","staff"), getAdminFlashSale)
  .put(verifyUserAuth, roleBasedAccess("admin","staff"), updateFlashSale)
  .delete(verifyUserAuth, roleBasedAccess("admin","staff"), deleteFlashSale);

router
  .route("/admin/flash-sales/:id/publish")
  .post(verifyUserAuth, roleBasedAccess("admin","staff"), publishFlashSale);

router
  .route("/admin/flash-sales/:id/cancel")
  .post(verifyUserAuth, roleBasedAccess("admin","staff"), cancelFlashSale);

router
  .route("/admin/flash-sales/:id/items")
  .post(verifyUserAuth, roleBasedAccess("admin","staff"), addFlashSaleItem);

router
  .route("/admin/flash-sales/:id/items/:itemId")
  .put(verifyUserAuth, roleBasedAccess("admin","staff"), updateFlashSaleItem)
  .delete(verifyUserAuth, roleBasedAccess("admin","staff"), deleteFlashSaleItem);

router.route("/flash-sales/active").get(getActiveFlashSale);
router.route("/flash-sales/upcoming").get(getUpcomingFlashSales);
router.route("/flash-sales/:id").get(getPublicFlashSale);
router.route("/products/:id/flash-sale").get(getProductFlashSale);

export default router;
