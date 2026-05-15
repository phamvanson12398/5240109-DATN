import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/shared/api/http.js';

// Helper to handle API errors
const getErrorPayload = (error, fallbackMessage) => ({
    message: error.response?.data?.message || fallbackMessage,
    statusCode: error.response?.status || 500
});

// Thunks
export const fetchAddresses = createAsyncThunk('address/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get('/api/v1/address/me');
        return data;
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Không thể tải danh sách địa chỉ'));
    }
});

export const addAddress = createAsyncThunk('address/add', async (addressData, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/v1/address/new', addressData);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Thêm địa chỉ thất bại'));
    }
});

export const updateAddress = createAsyncThunk('address/update', async ({ id, addressData }, { rejectWithValue }) => {
    try {
        const { data } = await axios.put(`/api/v1/address/${id}`, addressData);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Cập nhật địa chỉ thất bại'));
    }
});

export const deleteAddress = createAsyncThunk('address/delete', async (id, { rejectWithValue }) => {
    try {
        const { data } = await axios.delete(`/api/v1/address/${id}`);
        return { ...data, id }; // Return id to remove from state
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Xóa địa chỉ thất bại'));
    }
});

export const setDefaultAddress = createAsyncThunk('address/setDefault', async (id, { rejectWithValue }) => {
    try {
        const { data } = await axios.put(`/api/v1/address/default/${id}`);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Thiết lập địa chỉ mặc định thất bại'));
    }
});

const initialState = {
    addresses: [],
    loading: false,
    error: null,
    success: false,
    message: null
};

const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        clearAddressErrors: (state) => {
            state.error = null;
        },
        clearAddressSuccess: (state) => {
            state.success = false;
            state.message = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = action.payload.addresses || [];
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Add
            .addCase(addAddress.pending, (state) => {
                state.loading = true;
            })
            .addCase(addAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = "Thêm địa chỉ thành công";
                state.addresses.push(action.payload.address);
                // If it's the only address, it will be default (logic handled by backend)
            })
            .addCase(addAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Update
            .addCase(updateAddress.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = "Cập nhật địa chỉ thành công";
                const index = state.addresses.findIndex(addr => addr._id === action.payload.address._id);
                if (index !== -1) {
                    state.addresses[index] = action.payload.address;
                }
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Delete
            .addCase(deleteAddress.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = "Xóa địa chỉ thành công";
                state.addresses = state.addresses.filter(addr => addr._id !== action.payload.id);
                // If backend promoted a new default, another fetch might be needed, 
                // but let's assume the user handles it or we re-fetch.
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Set Default
            .addCase(setDefaultAddress.pending, (state) => {
                state.loading = true;
            })
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = "Thiết lập mặc định thành công";
                state.addresses = state.addresses.map(addr => ({
                    ...addr,
                    isDefault: addr._id === action.payload.address._id
                }));
            })
            .addCase(setDefaultAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            });
    }
});

export const { clearAddressErrors, clearAddressSuccess } = addressSlice.actions;
export default addressSlice.reducer;
