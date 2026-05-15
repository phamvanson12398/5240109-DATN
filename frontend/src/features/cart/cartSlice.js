import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/shared/api/http.js";

const getCartKey = (userId) => userId ? `cartItems_${userId}` : "cartItems_guest";
const getShippingKey = (userId) => userId ? `shippingInfo_${userId}` : "shippingInfo_guest";

const defaultShippingInfo = {
    address: "",
    pinCode: "",
    phoneNumber: "",
    country: "VN",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    provinceName: "",
    districtName: "",
    wardName: "",
};

const getProductId = (item) => {
    const rawProduct = item?.product_id || item?.product;
    return rawProduct && typeof rawProduct === "object" ? rawProduct._id : rawProduct;
};

const normalizeCartItems = (items) => {
    if (!Array.isArray(items)) return [];

    return items.map((item) => {
        const rawProduct = item.product_id || item.product;
        const isPopulated = typeof rawProduct === "object" && rawProduct !== null && rawProduct._id;
        const productId = isPopulated ? rawProduct._id : rawProduct;
        const stock = item.stock ?? (isPopulated ? rawProduct.stock : undefined);
        const price = Number(item.priceSnapshot ?? item.price ?? 0);

        return {
            ...item,
            product: productId,
            product_id: productId,
            price,
            priceSnapshot: price,
            originalPriceSnapshot: Number(item.originalPriceSnapshot ?? item.originalPrice ?? item.price ?? 0),
            stock,
        };
    });
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get("/api/v1/cart");
        return data.cart.items;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Khong the tai gio hang");
    }
});

export const syncCartWithDB = createAsyncThunk("cart/syncCartWithDB", async (items, { rejectWithValue }) => {
    try {
        const { data } = await axios.post("/api/v1/cart/sync", { items });
        return data.cart.items;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Loi dong bo gio hang");
    }
});

export const revalidateCart = createAsyncThunk("cart/revalidateCart", async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.post("/api/v1/cart/revalidate");
        if (data.valid === false) return rejectWithValue(data);
        return data.cart.items;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Khong the cap nhat gio hang");
    }
});

export const addItemsToCart = createAsyncThunk(
    "cart/addItemsToCart",
    async ({ id, quantity, isUpdate, size, color }, { getState, rejectWithValue }) => {
        try {
            const { user } = getState().user;

            if (user) {
                const { data } = await axios.post("/api/v1/cart/item", {
                    product_id: id,
                    quantity,
                    isUpdate,
                    size,
                    color,
                });

                const serverItems = normalizeCartItems(data.cart.items);
                const serverItem = serverItems.find((item) =>
                    item.product === id && (item.size || "") === (size || "") && (item.color || "") === (color || "")
                );

                return { ...(serverItem || serverItems[serverItems.length - 1]), isServerSnapshot: true };
            }

            const { data } = await axios.get(`/api/v1/products/${id}`);
            const product = data.product;
            return {
                product_id: product._id,
                product: product._id,
                name: product.name,
                price: Number(product.price || 0),
                priceSnapshot: Number(product.price || 0),
                originalPriceSnapshot: Number(product.originalPrice || product.price || 0),
                image: product.images?.[0]?.url || "",
                stock: product.stock,
                quantity,
                isUpdate,
                size,
                color,
                pricingType: "normal",
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Da xay ra loi");
        }
    }
);

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        userId: null,
        cartItems: [],
        loading: false,
        error: null,
        success: false,
        message: null,
        shippingInfo: defaultShippingInfo,
    },
    reducers: {
        syncCartWithUser: (state, action) => {
            const userId = action.payload;
            state.userId = userId;
            state.cartItems = JSON.parse(localStorage.getItem(getCartKey(userId))) || [];
            state.shippingInfo = JSON.parse(localStorage.getItem(getShippingKey(userId))) || defaultShippingInfo;
        },
        removeErrors: (state) => {
            state.error = null;
        },
        removeMessage: (state) => {
            state.message = null;
            state.success = false;
        },
        removeItemFromCart: (state, action) => {
            const { product, size, color } = action.payload;
            const pId = product && typeof product === "object" ? product._id : product;
            const pSize = size || "";
            const pColor = color || "";

            state.cartItems = state.cartItems.filter((item) => {
                return !(getProductId(item) === pId && (item.size || "") === pSize && (item.color || "") === pColor);
            });

            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));

            if (state.userId) {
                const query = new URLSearchParams();
                if (pSize) query.append("size", pSize);
                if (pColor) query.append("color", pColor);
                const queryString = query.toString();
                axios.delete(`/api/v1/cart/item/${pId}${queryString ? `?${queryString}` : ""}`).catch(console.error);
            }
        },
        saveShippingInfo: (state, action) => {
            state.shippingInfo = action.payload;
            localStorage.setItem(getShippingKey(state.userId), JSON.stringify(state.shippingInfo));
        },
        removeOrderedItems: (state, action) => {
            const orderedItems = action.payload || [];
            const orderedKeys = new Set(orderedItems.map((item) => `${getProductId(item)}-${item.size || ""}-${item.color || ""}`));

            state.cartItems = state.cartItems.filter((item) => {
                const key = `${getProductId(item)}-${item.size || ""}-${item.color || ""}`;
                return !orderedKeys.has(key);
            });

            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.shippingInfo = defaultShippingInfo;
            localStorage.removeItem(getCartKey(state.userId));
            localStorage.removeItem(getShippingKey(state.userId));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase("user/logout/fulfilled", (state) => {
                state.userId = null;
                state.cartItems = JSON.parse(localStorage.getItem(getCartKey(null))) || [];
                state.shippingInfo = JSON.parse(localStorage.getItem(getShippingKey(null))) || defaultShippingInfo;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.cartItems = normalizeCartItems(action.payload);
                state.loading = false;
                localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
            })
            .addCase(syncCartWithDB.fulfilled, (state, action) => {
                state.cartItems = normalizeCartItems(action.payload);
                state.loading = false;
                localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
            })
            .addCase(revalidateCart.fulfilled, (state, action) => {
                state.cartItems = normalizeCartItems(action.payload);
                state.loading = false;
                localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
            })
            .addCase(revalidateCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Gio hang can duoc cap nhat";
            })
            .addCase(addItemsToCart.fulfilled, (state, action) => {
                const item = action.payload;
                const existingItem = state.cartItems.find((i) =>
                    getProductId(i) === getProductId(item) &&
                    (i.size || "") === (item.size || "") &&
                    (i.color || "") === (item.color || "")
                );

                if (existingItem) {
                    if (item.isServerSnapshot) {
                        Object.assign(existingItem, item);
                    } else if (item.isUpdate) {
                        existingItem.quantity = item.quantity;
                    } else {
                        existingItem.quantity += item.quantity;
                    }
                } else {
                    state.cartItems.push(item);
                }

                state.loading = false;
                state.success = true;
                state.message = item.isServerSnapshot
                    ? `Da cap nhat ${item.name} trong gio hang`
                    : `Da them ${item.name} vao gio hang thanh cong`;
                localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
            })
            .addCase(addItemsToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload || "Da xay ra loi";
            });
    },
});

export const {
    removeErrors,
    removeMessage,
    removeItemFromCart,
    saveShippingInfo,
    removeOrderedItems,
    clearCart,
    syncCartWithUser,
} = cartSlice.actions;

export default cartSlice.reducer;
