import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/shared/api/http.js";

// Lấy danh sách sách có filter + sort + pagination
export const getProduct = createAsyncThunk(
  "product/getProduct",
  async (
    {
      keyword,
      page = 1,
      category,
      level1,
      level2,
      author,
      publisher,
      price,
      sort,
      ratings,
      inStock,
    },
    { rejectWithValue }
  ) => {
    try {
      let link = `/api/v1/products?page=${page}`;

      // Filter theo danh mục sách
      if (category) {
        link += `&category=${encodeURIComponent(category)}`;
      }

      if (level1) {
        link += `&level1=${encodeURIComponent(level1)}`;
      }

      if (level2) {
        link += `&level2=${encodeURIComponent(level2)}`;
      }

      // Tìm kiếm sách
      if (keyword) {
        link += `&keyword=${encodeURIComponent(keyword)}`;
      }

      // Filter theo tác giả
      if (author) {
        link += `&author=${encodeURIComponent(author)}`;
      }

      // Filter theo nhà xuất bản
      if (publisher) {
        link += `&publisher=${encodeURIComponent(publisher)}`;
      }

      // Filter khoảng giá
      if (price) {
        if (price.gte !== undefined && price.gte !== null && price.gte > 0) {
          link += `&price[gte]=${price.gte}`;
        }

        if (price.lte !== undefined && price.lte !== null) {
          link += `&price[lte]=${price.lte}`;
        }
      }

      // Filter đánh giá
      if (ratings) {
        if (ratings.gte !== undefined && ratings.gte !== null) {
          link += `&ratings[gte]=${ratings.gte}`;
        }

        if (ratings.lt !== undefined && ratings.lt !== null) {
          link += `&ratings[lt]=${ratings.lt}`;
        }
      }

      // Chỉ lấy sách còn hàng
      if (inStock) {
        link += `&stock=true`;
      }

      // Sắp xếp sách
      if (sort) {
        const sortMap = {
          newest: "-createdAt",
          price_asc: "price",
          price_desc: "-price",
          rating_desc: "-ratings",
          bestselling: "-sold",
          name_asc: "name",
          name_desc: "-name",
        };

        const sortParam = sortMap[sort] || sort;
        link += `&sort=${sortParam}`;
      }

      const { data } = await axios.get(link);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          "Đã xảy ra lỗi khi tải danh sách sách!"
      );
    }
  }
);

// Lấy chi tiết sách
export const getProductDetails = createAsyncThunk(
  "product/getProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/v1/products/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Đã xảy ra lỗi khi tải thông tin sách!"
      );
    }
  }
);

const initialState = {
  // Danh sách sách
  products: [],
  productCount: 0,
  resultPerPage: 12,
  totalPages: 0,
  currentPage: 1,

  // Chi tiết sách
  product: null,

  // Sách liên quan / gợi ý
  relatedProducts: [],

  // Trạng thái filter/search
  hasResults: true,
  message: null,

  // Trạng thái request
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    removeErrors: (state) => {
      state.error = null;
    },

    clearProductMessage: (state) => {
      state.message = null;
    },

    clearProductDetails: (state) => {
      state.product = null;
      state.relatedProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Lấy danh sách sách
      .addCase(getProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.products = action.payload.products || [];
        state.productCount = action.payload.productCount || 0;
        state.resultPerPage = action.payload.resultPerPage || 12;
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;

        state.hasResults =
          action.payload.hasResults !== undefined
            ? action.payload.hasResults
            : state.products.length > 0;

        state.relatedProducts = action.payload.relatedProducts || [];
        state.message = action.payload.message || null;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã xảy ra lỗi khi tải danh sách sách!";
        state.products = [];
        state.productCount = 0;
        state.totalPages = 0;
        state.currentPage = 1;
        state.hasResults = false;
        state.relatedProducts = [];
      })

      // Lấy chi tiết sách
      .addCase(getProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.product = null;
        state.relatedProducts = [];
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.product = action.payload.product || null;
        state.relatedProducts = action.payload.relatedProducts || [];
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã xảy ra lỗi khi tải thông tin sách!";
        state.product = null;
        state.relatedProducts = [];
      });
  },
});

export const {
  removeErrors,
  clearProductMessage,
  clearProductDetails,
} = productSlice.actions;

export default productSlice.reducer;