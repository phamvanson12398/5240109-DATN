import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryApi } from "./api/category";

/**
 * Thunk: Lấy danh sách Category
 */
export const fetchCategories = createAsyncThunk(
    "category/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            return await categoryApi.fetchCategories();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể lấy danh sách danh mục"
            );
        }
    }
);

/**
 * Thunk: Tạo Category
 */
export const createCategory = createAsyncThunk(
    "category/createCategory",
    async (categoryData, { rejectWithValue }) => {
        try {
            return await categoryApi.createCategory(categoryData);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể tạo danh mục"
            );
        }
    }
);

/**
 * Thunk: Cập nhật Category
 */
export const updateCategory = createAsyncThunk(
    "category/updateCategory",
    async ({ id, categoryData }, { rejectWithValue }) => {
        try {
            return await categoryApi.updateCategory(id, categoryData);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể cập nhật danh mục"
            );
        }
    }
);

/**
 * Thunk: Xóa Category
 */
export const deleteCategory = createAsyncThunk(
    "category/deleteCategory",
    async (id, { rejectWithValue }) => {
        try {
            await categoryApi.deleteCategory(id);
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể xóa danh mục"
            );
        }
    }
);

const categorySlice = createSlice({
    name: "category",

    initialState: {
        categories: [],
        selectedCategory: null,
        loading: false,
        actionLoading: false,
        error: null,
        success: false,
    },

    reducers: {
        clearCategoryErrors: (state) => {
            state.error = null;
        },

        resetCategoryState: (state) => {
            state.error = null;
            state.success = false;
            state.actionLoading = false;
        },

        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },

        clearSelectedCategory: (state) => {
            state.selectedCategory = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // FETCH CATEGORIES
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // CREATE CATEGORY
            .addCase(createCategory.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.success = true;

                const newCategory = action.payload.category || action.payload;
                state.categories.unshift(newCategory);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
                state.success = false;
            })

            // UPDATE CATEGORY
            .addCase(updateCategory.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.success = true;

                const updatedCategory = action.payload.category || action.payload;

                state.categories = state.categories.map((category) =>
                    category._id === updatedCategory._id || category.id === updatedCategory.id
                        ? updatedCategory
                        : category
                );
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
                state.success = false;
            })

            // DELETE CATEGORY
            .addCase(deleteCategory.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.success = true;

                state.categories = state.categories.filter(
                    (category) => category._id !== action.payload && category.id !== action.payload
                );
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

export const {
    clearCategoryErrors,
    resetCategoryState,
    setSelectedCategory,
    clearSelectedCategory,
} = categorySlice.actions;

export default categorySlice.reducer;