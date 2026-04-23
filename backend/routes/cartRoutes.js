import express from "express";
import { 
    getCart, 
    syncCart, 
    updateCartItem, 
    removeCartItem 
} from "../controllers/cartController.js";
import { verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.route("/").get(verifyUserAuth, getCart);
router.route("/sync").post(verifyUserAuth, syncCart);
router.route("/item").post(verifyUserAuth, updateCartItem);
router.route("/item/:productId").delete(verifyUserAuth, removeCartItem);

export default router;
