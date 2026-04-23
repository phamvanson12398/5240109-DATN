import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";

// Helper: Find or create a cart for the current user
const findOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
        cart = await Cart.create({ user_id: userId });
    }
    return cart;
};

// Helper: Build the full cart response (cart + its items)
const buildCartResponse = async (cart) => {
    const items = await CartItem.find({ cart_id: cart._id }).populate("product_id", "name price images stock");
    return { ...cart.toObject(), items };
};

// GET /api/v1/cart — Lấy giỏ hàng của người dùng hiện tại
export const getCart = handleAsyncError(async (req, res, next) => {
    const cart = await findOrCreateCart(req.user.id);
    const cartWithItems = await buildCartResponse(cart);

    res.status(200).json({
        success: true,
        cart: cartWithItems
    });
});

// POST /api/v1/cart/sync — Đồng bộ giỏ hàng từ LocalStorage khi đăng nhập
export const syncCart = handleAsyncError(async (req, res, next) => {
    const { items } = req.body;

    const cart = await findOrCreateCart(req.user.id);

    if (items && Array.isArray(items) && items.length > 0) {
        // Delete old items and replace with synced items from client
        await CartItem.deleteMany({ cart_id: cart._id });

        const cartItems = items.map(item => ({
            cart_id: cart._id,
            product_id: item.product_id || item.product,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            size: item.size || null,
            color: item.color || null,
        }));

        await CartItem.insertMany(cartItems);
    }

    const cartWithItems = await buildCartResponse(cart);

    res.status(200).json({
        success: true,
        cart: cartWithItems
    });
});

// PUT /api/v1/cart — Thêm hoặc cập nhật số lượng một mặt hàng trong giỏ
export const updateCartItem = handleAsyncError(async (req, res, next) => {
    // Support both "product_id" (new) and "product" (legacy from frontend)
    const product_id = req.body.product_id || req.body.product;
    const { quantity, size, color, name, price, image } = req.body;

    if (!product_id || !quantity || !name || !price || !image) {
        return next(new HandleError("Thiếu thông tin sản phẩm (product_id, quantity, name, price, image)", 400));
    }

    const cart = await findOrCreateCart(req.user.id);

    // Find existing item by product + variant (size, color)
    const existingItem = await CartItem.findOne({
        cart_id: cart._id,
        product_id,
        size: size || null,
        color: color || null,
    });

    if (existingItem) {
        // Update quantity of existing item
        existingItem.quantity = quantity;
        await existingItem.save();
    } else {
        // Create a new CartItem
        await CartItem.create({
            cart_id: cart._id,
            product_id,
            name,
            price, // Snapshot price at the time of adding
            image,
            quantity,
            size: size || null,
            color: color || null,
        });
    }

    const cartWithItems = await buildCartResponse(cart);

    res.status(200).json({
        success: true,
        cart: cartWithItems
    });
});

// DELETE /api/v1/cart/item/:productId — Xóa một mặt hàng cụ thể khỏi giỏ
export const removeCartItem = handleAsyncError(async (req, res, next) => {
    const { productId } = req.params;
    const { size, color } = req.query; // Get variants from query string

    const cart = await Cart.findOne({ user_id: req.user.id });

    if (!cart) {
        return next(new HandleError("Không tìm thấy giỏ hàng", 404));
    }

    // Standardize nulls for matching
    const query = {
        cart_id: cart._id,
        product_id: productId
    };

    if (size) query.size = size;
    else query.size = null;

    if (color) query.color = color;
    else query.color = null;

    await CartItem.findOneAndDelete(query);

    const cartWithItems = await buildCartResponse(cart);

    res.status(200).json({
        success: true,
        cart: cartWithItems
    });
});

// DELETE /api/v1/cart/clear — Xóa toàn bộ giỏ hàng sau khi checkout
export const clearCart = handleAsyncError(async (req, res, next) => {
    const cart = await Cart.findOne({ user_id: req.user.id });

    if (cart) {
        await CartItem.deleteMany({ cart_id: cart._id });
    }

    res.status(200).json({
        success: true,
        message: "Giỏ hàng đã được làm trống"
    });
});
