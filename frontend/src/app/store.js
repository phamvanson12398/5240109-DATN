import { configureStore } from '@reduxjs/toolkit';
import productReducer from '@/features/products/productSlice';
import userReducer from '@/features/user/userSlice';
import cartReducer from '@/features/cart/cartSlice';
import orderReducer from '@/features/orders/orderSlice';
import addressReducer from '@/features/address/addressSlice';
import adminReducer from '@/features/admin/state/adminSlice';
import voucherReducer from '@/features/vouchers/voucherSlice';
import notificationReducer from '@/features/notifications/notificationSlice';


export const store = configureStore({
    reducer: {
        product: productReducer,
        user: userReducer,
        cart: cartReducer,
        order: orderReducer,
        address: addressReducer,
        admin: adminReducer,
        voucher: voucherReducer,
        notification: notificationReducer,
    }
})
