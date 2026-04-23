import express from "express";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
import { allMyOrder, cancelOrder, createNewOrder, getAllOrder, getSingleOrder ,updateOrderStauts} from "../controllers/orderController.js";

const router = express.Router()

router.route("/order/new").post(verifyUserAuth, createNewOrder)
router.route("/order/cancel/:id").put(verifyUserAuth, cancelOrder)
router.route("/order/:id").get(verifyUserAuth, getSingleOrder)
router.route("/admin/order/:id")
.put(verifyUserAuth,roleBasedAccess('admin'), updateOrderStauts)
.get(verifyUserAuth,roleBasedAccess('admin'), getSingleOrder)

router.route("/admin/orders/").get(verifyUserAuth,roleBasedAccess('admin'), getAllOrder)
router.route("/orders/user").get(verifyUserAuth, allMyOrder)




export default router