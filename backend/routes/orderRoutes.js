import express from "express";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
import { allMyOrder, cancelOrder, createNewOrder, generateAdminTrackingCode, getAllOrder, getSingleOrder ,updateOrderStauts, deleteOrder} from "../controllers/orderController.js";

const router = express.Router()

router.route("/order/new").post(verifyUserAuth, createNewOrder)
router.route("/order/cancel/:id").put(verifyUserAuth, cancelOrder)
router.route("/order/:id").get(verifyUserAuth, getSingleOrder)
router.route("/admin/order/:id")
.put(verifyUserAuth,roleBasedAccess('admin','staff'), updateOrderStauts)
.get(verifyUserAuth,roleBasedAccess('admin','staff'), getSingleOrder)
.delete(verifyUserAuth,roleBasedAccess('admin','staff'), deleteOrder)

router.route("/admin/orders/tracking-code").get(verifyUserAuth, roleBasedAccess('admin','staff'), generateAdminTrackingCode)
router.route("/admin/orders/").get(verifyUserAuth,roleBasedAccess('admin','staff'), getAllOrder)
router.route("/orders/user").get(verifyUserAuth, allMyOrder)




export default router
